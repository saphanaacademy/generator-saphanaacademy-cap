module.exports = {
    getgraphDataSources: getgraphDataSources,
    graphImport: graphImport
};

const axios = require('axios');

async function getgraphDataSources(thisf, answers) {
    const graphURL = answers.get('GraphURL');
    const graphId = answers.get('GraphId');
    const tokenURL = answers.get('GraphTokenURL');
    const clientId = answers.get('GraphClientId');
    const clientSecret = answers.get('GraphClientSecret');
    try {
        let options1 = {
            method: 'POST',
            url: tokenURL + '/oauth/token?grant_type=client_credentials',
            headers: {
                Authorization: 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
            }
        };
        let res1 = await axios(options1);
        try {
            thisf.log("Accessing SAP Graph: Getting Services");
            let options2 = {
                method: 'GET',
                url: graphURL + '/' + graphId,
                headers: {
                    "Authorization": 'Bearer ' + res1.data.access_token,
                    "Accept": "application/json"
                }
            };
            let res2 = await axios(options2);
            if (res2.data.value) {
                let graphDataSources = res2.data.value;
                for (let i = 0; i < graphDataSources.length; i++) {
                    graphDataSources[i].shortName = graphDataSources[i].name.split('.').join('');
                    try {
                        thisf.log("Accessing SAP Graph: Getting Metadata:", graphDataSources[i].url);
                        let options3 = {
                            method: 'GET',
                            url: graphURL + '/' + graphId + '/' + graphDataSources[i].url + '/$metadata',
                            headers: {
                                "Authorization": 'Bearer ' + res1.data.access_token,
                                "Accept": "application/xml"
                            }
                        };
                        let res3 = await axios(options3);
                        graphDataSources[i].metadata = res3.data;
                        try {
                            let options4 = {
                                method: 'GET',
                                url: graphURL + '/' + graphId + '/metadata/entities/' + graphDataSources[i].url,
                                headers: {
                                    "Authorization": 'Bearer ' + res1.data.access_token,
                                    "Accept": "application/json"
                                }
                            };
                            let res4 = await axios(options4);
                            let entities = Object.keys(res4.data.entities[0]);
                            graphDataSources[i].entity = entities[0];
                        } catch (err) {
                            thisf.log(err.stack);
                            return;
                        }
                    } catch (err) {
                        thisf.log(err.message);
                        return;
                    }
                }
                const fs2 = require('fs');
                var destinationRoot = thisf.destinationRoot();
                graphDataSources.forEach(element => {
                    thisf.log("Accessing SAP Graph: Writing EDMX:", element.name);
                    fileDest = destinationRoot + "/" + element.name;
                    fs2.writeFileSync(fileDest + ".edmx", element.metadata, 'utf8', function (err) {
                        if (err) {
                            thisf.log(err.message);
                            return;
                        }
                    });
                    delete element.metadata;
                });
                return graphDataSources;
            }
        } catch (err) {
            thisf.log(err.message);
            return;
        }
    } catch (err) {
        thisf.log(err.message);
        return;
    }
}

async function graphImport(thisf, answers) {
    const graphDataSources = answers.get('graphDataSources');
    graphDataSources.forEach(element => {
        thisf.log("Accessing SAP Graph: Importing EDMX:", element.name);
        console.log(thisf.destinationPath());
        let opt = { "cwd": thisf.destinationPath() };
        thisf.spawnCommandSync("cds", ["import", element.name + ".edmx", "-as", "csn", "--keep-namespace"], opt);
    });
}