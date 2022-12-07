"use strict";
const Generator = require("yeoman-generator");
const YAML = require("js-yaml");

module.exports = class extends Generator {
    initializing() {
        process.chdir(this.destinationRoot());
      }

      prompting() {
        this.log("");
        if (this.config.get("authorization") === false) {
            this.log("This sub-generator only supports projects that use authorization.");
            return;
        }
        this.log("");
        const fs2 = require('fs');
        var destinationRoot = this.destinationRoot();
        let fileDest = "";
        if (this.config.get("BTPRuntime") === "Kyma") {
            fileDest = destinationRoot + "/helm/" + this.config.get("projectName") + "-srv/templates/service-uaa.yaml";
        } else {
            fileDest = destinationRoot + "/xs-security.json";
        }
        let fileContent = fs2.readFileSync(fileDest, 'utf8', function (err) {
            if (err) {
                this.log("Unable to read " + fileDest);
                return;
            }
        });
        let scopes = [];
        if (this.config.get("BTPRuntime") === "Kyma") {
            let fileYAML = YAML.load(fileContent);
            scopes = fileYAML.spec.parameters.scopes;
        } else {
            let fileJSON = JSON.parse(fileContent);
            scopes = fileJSON.scopes;
        }
        return this.prompt([
            {
                type: "list",
                name: "app2appType",
                message: "Which App2App authorization scenario would you like to configure?",
                choices: [{ name: "Authorize another app to use this app", value: "authorize" }, { name: "Access another app from this app", value: "access" }],
                default: "authorize"
            },
            {
                type: "input",
                name: "app2appName",
                message: "What is the name of the other app (deployed to same BTP subaccount)?",
                default: ""
            },
            {
                when: response => response.app2appType === "authorize",
                type: "checkbox",
                name: "app2appScopes",
                message: "Select the application scope(s) to be authorized?",
                choices: scopes
            },
            {
                type: "checkbox",
                name: "app2appMethod",
                message: "What kind of authentication would you like?",
                choices: [{ name: "Principal Propagation of Business User", value: "user", checked: true }, { name: "Technical Communication", value: "machine" }],
                default: ["user"]
            },
            {
                type: "confirm",
                name: "confirm",
                message: "Project files including xs-security.json will be updated. Are you absolutely sure you want to do this?",
                default: false
            }
        ]).then((answers) => {
            this.config.set(answers);
        });
    }

    async writing() {
        var answers = this.config;
        if (answers.get("confirm")) {
            const fs2 = require('fs');
            var destinationRoot = this.destinationRoot();
            let fileDest = "";
            if (this.config.get("BTPRuntime") === "Kyma") {
                fileDest = destinationRoot + "/helm/" + this.config.get("projectName") + "-srv/templates/service-uaa.yaml";
            } else {
                fileDest = destinationRoot + "/xs-security.json";
            }
            let fileContent = fs2.readFileSync(fileDest, 'utf8', function (err) {
                if (err) {
                    this.log("Unable to read " + fileDest);
                    return;
                }
            });
            if (this.config.get("BTPRuntime") === "Kyma") {
                let fileYAML = YAML.load(fileContent);
                if (answers.get("app2appType") === "authorize") {
                    fileYAML.spec.parameters.scopes.forEach(scope => {
                        delete scope["grant-as-authority-to-apps"];
                        delete scope["granted-apps"];
                        answers.get("app2appScopes").forEach(element => {
                            if (scope.name === element) {
                                if (answers.get("app2appMethod").includes("user")) {
                                    scope["granted-apps"] = ["$XSAPPNAME(application," + answers.get("app2appName") + ")"];
                                }
                                if (answers.get("app2appMethod").includes("machine")) {
                                    scope["grant-as-authority-to-apps"] = ["$XSAPPNAME(application," + answers.get("app2appName") + ")"];
                                }
                            }
                        });
                    });
                } else if (answers.get("app2appType") === "access") {
                    delete fileYAML.spec.parameters["authorities"];
                    delete fileYAML.spec.parameters["foreign-scope-references"];
                    if (answers.get("app2appMethod").includes("user")) {
                        fileYAML.spec.parameters["foreign-scope-references"] = ["$ACCEPT_GRANTED_SCOPES"];
                    }
                    if (answers.get("app2appMethod").includes("machine")) {
                        fileYAML.spec.parameters["authorities"] = ["$ACCEPT_GRANTED_AUTHORITIES"];
                    }
                }
                fs2.writeFile(fileDest, YAML.dump(fileYAML), "utf8", function (err) {
                    if (err) {
                        this.log(err.message);
                        return;
                    }
                });
            } else {
                let fileJSON = JSON.parse(fileContent);
                if (answers.get("app2appType") === "authorize") {
                    fileJSON.scopes.forEach(scope => {
                        delete scope["grant-as-authority-to-apps"];
                        delete scope["granted-apps"];
                        answers.get("app2appScopes").forEach(element => {
                            if (scope.name === element) {
                                if (answers.get("app2appMethod").includes("user")) {
                                    scope["granted-apps"] = ["$XSAPPNAME(application," + answers.get("app2appName") + ")"];
                                }
                                if (answers.get("app2appMethod").includes("machine")) {
                                    scope["grant-as-authority-to-apps"] = ["$XSAPPNAME(application," + answers.get("app2appName") + ")"];
                                }
                            }
                        });
                    });
                } else if (answers.get("app2appType") === "access") {
                    delete fileJSON["authorities"];
                    delete fileJSON["foreign-scope-references"];
                    if (answers.get("app2appMethod").includes("user")) {
                        fileJSON["foreign-scope-references"] = ["$ACCEPT_GRANTED_SCOPES"];
                    }
                    if (answers.get("app2appMethod").includes("machine")) {
                        fileJSON["authorities"] = ["$ACCEPT_GRANTED_AUTHORITIES"];
                    }
                }
                fs2.writeFile(fileDest, JSON.stringify(fileJSON, null, 2), "utf8", function (err) {
                    if (err) {
                        this.log(err.message);
                        return;
                    }
                });
            }
            this.log("");
            this.log("Project files have been updated.");
            this.log("");
            this.log("You can update the xsuaa service instance as follows without needing to build & deploy the entire project:");
            if (this.config.get("BTPRuntime") === "Kyma") {
                this.log("  helm upgrade " + answers.get("projectName") + "-srv helm/" + answers.get("projectName") + "-srv -f helm/" + answers.get("projectName") + "-srv/templates/service-uaa.yaml -n " + answers.get("namespace"));
            } else {
                this.log("  cf update-service " + answers.get("projectName") + "-uaa -c xs-security.json");
            }
            this.log("");
        } else {
            this.log("");
            this.log("Project files have not been updated.");
            this.log("");
        }
        answers.delete('confirm');
    }

};