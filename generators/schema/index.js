"use strict";
const Generator = require("yeoman-generator");
const hanaUtils = require('../app/hanaUtils');

module.exports = class extends Generator {
    initializing() {
        process.chdir(this.destinationRoot());
      }

    prompting() {
        this.log("");
        if (this.config.get("schemaName") !== "" && this.config.get("hanaTargetHDI") === "") {
            this.log("Refreshing existing SAP HANA Cloud schema:", this.config.get("schemaName"));
        } else {
            this.log("No existing SAP HANA Cloud schema is defined for this project.");
            return;
        }
        this.log("");
        return this.prompt([
            {
                type: "input",
                name: "hanaEndpoint",
                message: "What is your SAP HANA Cloud SQL endpoint?",
                default: "<guid>.hana.<region>.hanacloud.ondemand.com:443"
            },
            {
                type: "input",
                name: "hanaUser",
                message: "What is your SAP HANA Cloud user name?",
                default: "DBADMIN"
            },
            {
                type: "password",
                name: "hanaPassword",
                message: "What is the password for your SAP HANA Cloud user?",
                mask: "*",
                default: ""
            },
            {
                type: "confirm",
                name: "confirm",
                message: "The following project files will be replaced: db/src/" + this.config.get("schemaName") + ".hdbgrants, db/src/" + this.config.get("schemaName") + ".hdbsynonym, db/src/" + this.config.get("schemaName") + "-*.hdbview, db/" + this.config.get("schemaName") + ".cds, db/undeploy.json, srv/" + this.config.get("schemaName") + "-service.cds. Are you really sure you want to do this?",
                default: false
            },
        ]).then((answers) => {
            this.config.set(answers);
        });
    }

    async writing() {
        var answers = this.config;
        this.log("");
        if (answers.get("confirm")) {
            hanaUtils.processSchema(this, answers);
            this.log("Project files have been replaced.");
        } else {
            this.log("Project files have not been replaced.");
        }
        this.log("");
        answers.delete('hanaEndpoint');
        answers.delete('hanaUser');
        answers.delete('hanaPassword');
        answers.delete('confirm');
    }

    end() {
        this.log("");
    }

};
