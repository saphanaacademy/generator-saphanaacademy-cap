"use strict";
const Generator = require("yeoman-generator");
const hanaUtils = require('../app/hanaUtils');

module.exports = class extends Generator {
    prompting() {
        this.log("");
        if (this.config.get("hanaTargetHDI") !== "") {
            this.log("Refreshing existing SAP HANA Cloud HDI Container:", this.config.get("hanaTargetHDI"));
        } else {
            this.log("No existing SAP HANA Cloud HDI Container is defined for this project.");
            return;
        }
        this.log("");
        return this.prompt([
            {
                type: "confirm",
                name: "confirm",
                message: "The following project files will be replaced: db/src/" + this.config.get("hanaTargetHDI") + ".hdbgrants, db/src/" + this.config.get("hanaTargetHDI") + ".hdbsynonym, db/cfg/" + this.config.get("hanaTargetHDI") + ".hdbsynonymconfig, db/src/" + this.config.get("projectName").replace(/\-/g, "_").toUpperCase() + "_DB_" + this.config.get("hanaTargetHDI").replace(/\-/g, "_").toUpperCase() + "_*.hdbview, db/" + this.config.get("hanaTargetHDI") + ".cds, db/undeploy.json, srv/" + this.config.get("hanaTargetHDI") + "-service.cds. Are you really sure you want to do this?",
                default: false
            },
        ]).then((answers) => {
            this.config.set(answers);
        });
    }

    async writing() {
        var answers = this.config;
        if (answers.get("confirm")) {
            hanaUtils.hanaTargetHDI2Schema(this, answers);
            hanaUtils.processSchema(this, answers);
            this.log("");
            this.log("Project files have been replaced.");
            this.log("");
        } else {
            this.log("");
            this.log("Project files have not been replaced.");
            this.log("");
        }
        answers.delete('hanaEndpoint');
        answers.delete('hanaUser');
        answers.delete('hanaPassword');
        answers.delete('confirm');
    }

    end() {
        this.log("");
    }

};
