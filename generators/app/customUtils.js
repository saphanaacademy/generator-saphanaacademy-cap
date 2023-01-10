module.exports = {
    customGet: customGet,
    customWrite: customWrite,
    customImport: customImport
};

const axios = require('axios');
const X2JS = require('x2js');

async function customGet(thisf, answers) {
    try {
        let res1 = {};
        if (answers.customAuth === "oauth2cc") {
            let options1 = {
                method: 'POST',
                url: answers.customTokenURL + '/oauth/token?grant_type=client_credentials',
                headers: {
                    Authorization: 'Basic ' + Buffer.from(answers.customClientId + ':' + answers.customClientSecret).toString('base64')
                }
            };
            res1 = await axios(options1);
        }
        thisf.log("Accessing Custom OData API: Getting Metadata...");
        let options = {
            method: 'GET',
            url: answers.customURL + '/$metadata',
            headers: {
                "Accept": "application/xml"
            }
        };
        if (answers.customAuth === "basic") {
            options.headers.Authorization = 'Basic ' + Buffer.from(answers.customUser + ':' + answers.customPassword).toString('base64');
        } else if (answers.customAuth === "oauth2cc") {
            options.headers.Authorization = 'Bearer ' + res1.data.access_token;  
        }
        let res2 = await axios(options);
        let custom = {};
        custom.EDMX = res2.data;
        let x2js = new X2JS();
        let metadata = x2js.xml2js(custom.EDMX);
        custom.namespace = metadata.Edmx.DataServices.Schema._Namespace;
        custom.entities = [];
        metadata.Edmx.DataServices.Schema.EntityContainer.EntitySet.forEach(element => {
            custom.entities.push(element._Name);
        });
        return custom;
    } catch (err) {
        thisf.log(err.message);
        return;
    }
}

async function customWrite(thisf, answers) {
    const namespace = answers.get('customNamespace');
    thisf.log("Accessing Custom OData API: Writing EDMX:", namespace);
    const fs2 = require('fs');
    var destinationRoot = thisf.destinationRoot();
    fileDest = destinationRoot + "/" + namespace;
    fs2.writeFileSync(fileDest + ".edmx", answers.get('customEDMX'), 'utf8', function (err) {
        if (err) {
            thisf.log(err.message);
            return;
        }
    });
}

async function customImport(thisf, answers) {
    const namespace = answers.get('customNamespace');
    thisf.log("Accessing Custom OData API: Importing EDMX:", namespace);
    let opt = { "cwd": thisf.destinationPath() };
    thisf.spawnCommandSync("cds", ["import", namespace + ".edmx", "-as", "csn", "--keep-namespace"], opt);
}