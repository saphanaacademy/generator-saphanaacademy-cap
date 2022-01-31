"use strict";
const Generator = require("yeoman-generator");
const graphUtils = require('../app/graphUtils');

module.exports = class extends Generator {
    prompting() {
        this.log("");
        if (this.config.get("apiGRAPH")) {
            this.log("Refreshing existing SAP Graph Data Sources.");
        } else {
            this.log("No existing SAP Graph Data Sources have been defined for this project.");
            return;
        }
        this.log("");
        return this.prompt([
            {
                type: "input",
                name: "GraphURL",
                message: "What is your SAP Graph URL?",
                default: this.config.get("GraphURL")
            },
            {
                type: "input",
                name: "GraphId",
                message: "What is your SAP Graph Business Data Graph Identifier?",
                default: this.config.get("GraphId")
            },
            {
                type: "input",
                name: "GraphTokenURL",
                message: "What is your SAP Graph Token URL?",
                default: "https://<subdomain>.authentication.<region>.hana.ondemand.com"
            },
            {
                type: "input",
                name: "GraphClientId",
                message: "What is your SAP Graph Client Id?",
                default: ""
            },
            {
                type: "password",
                name: "GraphClientSecret",
                message: "What is your SAP Graph Client Secret?",
                mask: "*",
                default: ""
            },
            {
                type: "confirm",
                name: "confirm",
                message: "The following project files will be refreshed: /srv/external/sap.*.* and /package.json. Existing content including manual changes will be replaced! Are you absolutely sure you want to do this?",
                default: false
            }
        ]).then((answers) => {
            this.config.set(answers);
        });
    }

    async writing() {
        var answers = this.config;
        if (answers.get("confirm")) {
            let graphDataSources = await graphUtils.getgraphDataSources(this, answers);
            if (!graphDataSources) {
                this.env.error("Unable to obtain SAP Graph Data Sources.");
            }
            const fs2 = require('fs');
            const glob = require("glob");
            let options;
            let destinationRoot = this.destinationRoot();
            glob(destinationRoot + "/srv/external/sap.*.*", options, function (er, files) {
                for (const file of files) {
                    fs2.unlinkSync(file);
                }
            });
            let fileDest = destinationRoot + "/package.json";
            let fileContent = fs2.readFileSync(fileDest, 'utf8', function (err) {
                if (err) {
                    thisf.log(err.message);
                    return;
                }
            });
            let fileJSON = JSON.parse(fileContent);
            let xgraphDataSources = answers.get("graphDataSources");
            xgraphDataSources.forEach(element => {
                delete fileJSON.cds.requires[element.name];
            });
            graphDataSources.forEach(element => {
                let item = {
                    "kind": "odata",
                    "model": "srv/external/" + element.name,
                    "credentials": {
                        "[production]": {
                            "destination": answers.get("projectName") + "-graph-api",
                            "path": "/" + answers.get("GraphId") + "/" + element.url
                        },
                        "[development]": {
                            "destination": answers.get("projectName") + "-graph-api",
                            "path": "/" + answers.get("GraphId") + "/" + element.url
                        }
                    }
                };
                fileJSON.cds.requires[element.name] = item;
            });
            fs2.writeFile(fileDest, JSON.stringify(fileJSON, null, 2), 'utf8', function (err) {
                if (err) {
                    thisf.log(err.message);
                    return;
                }
            });
            answers.set("graphDataSources", graphDataSources);
            // wait a second before import
            await sleep(1000);
            graphUtils.graphImport(this, answers);
            this.log("");
            this.log("Project files have been refreshed.");
            this.log("");
        } else {
            this.log("");
            this.log("Project files have not been refreshed.");
            this.log("");
        }
        answers.delete('GraphClientId');
        answers.delete('GraphClientSecret');
        answers.delete('confirm');
    }

    end() {
        this.log("");
        this.log("Please refresh the following project files manually:");
        this.log("  /srv/catalog-service.cds");
        this.log("  /srv/catalog-service.js");
        this.log("  /app/resources/html5/webapp/index.html");
        this.log("  /test.http");
        this.log("");
    }

};

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};