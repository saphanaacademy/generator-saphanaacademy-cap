"use strict";
const Generator = require("yeoman-generator");
const customUtils = require("../app/customUtils");

module.exports = class extends Generator {
    initializing() {
        process.chdir(this.destinationRoot());
      }

    prompting() {
        this.log("");
        if (this.config.get("apiCustom")) {
            this.log("Refreshing existing Custom OData API.");
        } else {
            this.log("No existing Custom OData API has been defined for this project.");
            return;
        }
        this.log("");
        var answers = this.config;
        return this.prompt([
            {
                type: "input",
                name: "customURL",
                message: "What is your Custom OData API endpoint?",
                default: answers.get("customURL")
            },
            {
                type: "list",
                name: "customAuth",
                message: "What authentication does your Custom OData API require?",
                choices: [{ name: "None", value: "" }, { name: "Basic Authentication", value: "basic" }, { name: "OAuth2 SAML Client Credentials", value: "oauth2cc" }],
                default: answers.get("customAuth")
            },
            {
                when: response => response.customAuth === "basic",
                type: "input",
                name: "customUser",
                message: "What is your Custom OData API user?",
                default: ""
            },
            {
                when: response => response.customAuth === "basic",
                type: "password",
                name: "customPassword",
                message: "What is your Custom OData API password?",
                mask: "*",
                default: ""
            },
            {
                when: response => response.customAuth === "oauth2cc",
                type: "input",
                name: "customTokenURL",
                message: "What is your Custom OData API Token URL? Leave blank for no authentication.",
                default: ""
            },
            {
                when: response => response.customAuth === "oauth2cc",
                type: "input",
                name: "customClientId",
                message: "What is your Custom OData API Client Id?",
                default: ""
            },
            {
                when: response => response.customAuth === "oauth2cc",
                type: "password",
                name: "customClientSecret",
                message: "What is your Custom OData API Client Secret?",
                mask: "*",
                default: ""
            },
            {
                type: "confirm",
                name: "confirm",
                message: "The following project files will be refreshed: /srv/external/" + answers.get("customNamespace") + ".* and /package.json. Existing content including manual changes will be replaced! Are you absolutely sure you want to do this?",
                default: false
            }
        ]).then((answers) => {
            this.config.set(answers);
        });
    }

    async writing() {
        var answers = this.config;
        if (answers.get("confirm")) {
            let customNamespaceX = answers.get("customNamespace");
            const fs2 = require("fs");
            const glob = require("glob");
            let options;
            let destinationRoot = this.destinationRoot();
            glob(destinationRoot + "/srv/external/" + customNamespaceX + ".*", options, function (er, files) {
                for (const file of files) {
                    fs2.unlinkSync(file);
                }
            });
            let answers1 = {};
            answers1.customURL = answers.get("customURL");
            answers1.customAuth = answers.get("customAuth");
            answers1.customUser = answers.get("customUser");
            answers1.customPassword = answers.get("customPassword");
            answers1.customTokenURL = answers.get("customTokenURL");
            answers1.customClientId = answers.get("customClientId");
            answers1.customClientSecret = answers.get("customClientSecret");
            let custom = await customUtils.customGet(this, answers1);
            answers.set("customEDMX", custom.EDMX);
            answers.set("customNamespace", custom.namespace);
            answers.set("customEntities", custom.entities);
            await customUtils.customWrite(this, answers);
            let fileDest = destinationRoot + "/package.json";
            let fileContent = fs2.readFileSync(fileDest, "utf8", function (err) {
                if (err) {
                    thisf.log(err.message);
                    return;
                }
            });
            let fileJSON = JSON.parse(fileContent);
            delete fileJSON.cds.requires[customNamespaceX];
            let item = {
                "kind": "odata",
                "model": "srv/external/" + custom.namespace,
                "credentials": {
                    "[production]": {
                        "destination": answers.get("projectName") + "-" + custom.namespace + "-api"
                    },
                    "[development]": {
                        "url": answers.get("customURL")
                    }
                }
            };
            fileJSON.cds.requires[custom.namespace] = item;
            fs2.writeFile(fileDest, JSON.stringify(fileJSON, null, 2), "utf8", function (err) {
                if (err) {
                    thisf.log(err.message);
                    return;
                }
            });
            // wait a second before import
            await sleep(1000);
            customUtils.customImport(this, answers);
            this.log("");
            this.log("Project files have been refreshed.");
            this.log("");
        } else {
            this.log("");
            this.log("Project files have not been refreshed.");
            this.log("");
        }
        answers.delete("customUser");
        answers.delete("customPassword");
        answers.delete("customClientId");
        answers.delete("customClientSecret");
        answers.delete("customEDMX");
        answers.delete("confirm");
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