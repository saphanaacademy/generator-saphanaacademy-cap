"use strict";
const Generator = require("yeoman-generator");
const path = require("path");
const glob = require("glob");

module.exports = class extends Generator {
  prompting() {
    return this.prompt([
      {
        type: "input",
        name: "projectName",
        message: "What project name would you like?",
        validate: (s) => {
          if (/^[a-zA-Z0-9_-]*$/g.test(s)) {
            return true;
          }
          return "Please only use alphanumeric characters for the project name.";
        },
        default: "app",
      },
      {
        type: "confirm",
        name: "newDir",
        message: "Would you like to create a new directory for this project?",
        default: true
      },
      {
        type: "input",
        name: "displayName",
        message: "What is the display name of your app?",
        default: "App",
      },
      {
        type: "input",
        name: "description",
        message: "What is the description of your app?",
        default: "Business Application",
      },
      {
        type: "input",
        name: "schemaName",
        message: "Will you be using an existing SAP HANA Cloud schema? If so please enter the schema name here or leave blank for none. Note: schema names in mixed case are case sensitive!",
        default: ""
      },
      {
        when: response => response.schemaName !== "",
        type: "input",
        name: "hanaEndpoint",
        message: "What is your SAP HANA Cloud SQL endpoint?",
        default: "<guid>.hana.<region>.hanacloud.ondemand.com:443"
      },
      {
        when: response => response.schemaName !== "",
        type: "input",
        name: "hanaUser",
        message: "What is your SAP HANA Cloud user name?",
        default: "DBADMIN"
      },
      {
        when: response => response.schemaName !== "",
        type: "password",
        name: "hanaPassword",
        message: "What is the password for your SAP HANA Cloud user?",
        default: ""
      },
      {
        when: response => response.schemaName !== "",
        type: "confirm",
        name: "schemaUPS",
        message: "Would you like to create the SAP HANA Cloud technical user and User-Provided Service Instance?",
        default: true
      },
      {
        type: "confirm",
        name: "hana",
        message: "Would you like to create an entity with SAP HANA Cloud persistence?",
        default: true
      },
      {
        when: response => response.hana === true,
        type: "confirm",
        name: "hanaNative",
        message: "Would you like to use native SAP HANA Cloud artifacts?",
        default: true
      },
      {
        type: "confirm",
        name: "api",
        message: "Would you like to use an external API?",
        default: true
      },
      {
        when: response => response.api === true,
        type: "checkbox",
        name: "apiLoB",
        message: "Which external API would you like to use?",
        choices: ["SAP S/4HANA Cloud Sales Order (A2X)", "SAP SuccessFactors Recruiting"],
        default: ["SAP S/4HANA Cloud Sales Order (A2X)"],
      },
      {
        when: response => response.api === true,
        type: "input",
        name: "APIKey",
        message: "What is your API Key for SAP API Business Hub?",
        default: "",
      },
      {
        type: "confirm",
        name: "authentication",
        message: "Would you like authentication?",
        default: true
      },
      {
        when: response => response.authentication === true,
        type: "confirm",
        name: "authorization",
        message: "Would you like authorization?",
        default: true
      },
      {
        when: response => response.authentication === true && response.authorization === true,
        type: "confirm",
        name: "attributes",
        message: "Would you like to use role attributes?",
        default: false
      },
      {
        type: "confirm",
        name: "v2support",
        message: "Would you like to enable OData v2 support?",
        default: false
      },
      {
        type: "confirm",
        name: "ui",
        message: "Would you like a UI?",
        default: true
      },
      {
        when: response => response.ui === true,
        type: "confirm",
        name: "html5repo",
        message: "Would you like to use the HTML5 Application Repository?",
        default: false
      },
      {
        when: response => response.html5repo === true,
        type: "confirm",
        name: "managedAppRouter",
        message: "Would you like to use the managed application router?",
        default: true
      },
      {
        type: "input",
        name: "customDomain",
        message: "Will you be using a wildcard custom domain (eg: apps.mydomain.com)? If so please enter the custom domain name here. Leave blank to use the platform default.",
        validate: (s) => {
          if (s === "") {
            return true;
          }
          if (/^[a-zA-Z0-9.-]*$/g.test(s)) {
            return true;
          }
          return "Please only use alphanumeric characters for the custom domain.";
        },
        default: "",
      },
      {
        when: response => response.authentication === true && response.schemaName === "" && response.html5repo === false,
        type: "confirm",
        name: "multiTenant",
        message: "Would you like to create a SaaS multitenant app?",
        default: false
      },
      {
        when: response => response.multiTenant === true && response.customDomain === "",
        type: "confirm",
        name: "routes",
        message: "Would you like to include creation/deletion of tenant routes on subscribe/unsubscribe (via the CF API)?",
        default: true,
      },
      {
        type: "confirm",
        name: "cicd",
        message: "Would you like to enable Continuous Integration and Delivery (CI/CD)?",
        default: true
      },
      {
        type: "confirm",
        name: "applicationLogging",
        message: "Would you like to enable Application Logging?",
        default: true
      },
      {
        type: "confirm",
        name: "buildDeploy",
        message: "Would you like to build and deploy the project immediately?",
        default: false
      },
    ]).then((answers) => {
      if (answers.newDir) {
        this.destinationRoot(`${answers.projectName}`);
      }
      if (answers.schemaName === "") {
        answers.hanaEndpoint = "";
        answers.hanaUser = "";
        answers.hanaPassword = "";
        answers.schemaUPS = false;
      } else {
        answers.multiTenant = false;
      }
      if (answers.hana === false) {
        answers.hanaNative = false;
      }
      if (answers.api === false) {
        answers.apiLoB = [];
        answers.APIKey = "";
      }
      answers.apiS4HCSO = answers.apiLoB.includes("SAP S/4HANA Cloud Sales Order (A2X)");
      answers.apiSFSFRC = answers.apiLoB.includes("SAP SuccessFactors Recruiting");
      if (answers.authentication === false) {
        answers.authorization = false;
        answers.multiTenant = false;
      }
      if (answers.authentication === false || answers.authorization === false) {
        answers.attributes = false;
      }
      if (answers.ui === false) {
        answers.html5repo = false;
        answers.managedAppRouter = false;
      }
      if (answers.html5repo === true) {
        answers.srvPath = "";
        answers.multiTenant = false;
      } else {
        answers.srvPath = "/";
        answers.managedAppRouter = false;
      }
      if (answers.multiTenant === false) {
        answers.routes = false;
      }
      if (answers.customDomain !== "") {
        answers.routes = false;
      }
      this.config.set(answers);
    });
  }

  writing() {
    var answers = this.config;
    if (answers.get('schemaName') !== "") {
      // when schema name is lowercase sometimes we need to specify it in uppercase!
      var schemaNameAdjustedCase = answers.get('schemaName');
      if (answers.get('schemaName') === answers.get('schemaName').toLowerCase()) {
        schemaNameAdjustedCase = answers.get('schemaName').toUpperCase();
      }
      if (answers.get('schemaUPS') === true) {
        var done = this.async();
        var pwdgen = require('generate-password');
        var grantorPassword = pwdgen.generate({
          length: 30,
          numbers: true
        });
      }
    }
    if (answers.get('cicd') === true) {
      answers.set('cforg', 'org');
      answers.set('cfspace', 'space');
      answers.set('cfapi', 'https://api.cf.region.hana.ondemand.com');
      // try to identify the targeted api, org & space
      const res = this.spawnCommandSync('cf', ['target'], { stdio: 'pipe' });
      const stdout = res.stdout.toString('utf8');
      var field_strings = stdout.split(/[\r\n]*---[\r\n]*/);
      for (var i = 0; i < field_strings.length; i++) {
        if (field_strings[i] == '') {
          continue;
        }
        var props_strings = field_strings[i].split('\n');
        for (var j = 0; j < props_strings.length; j++) {
          var keyvalue = props_strings[j].split(':');
          if (keyvalue[0].toUpperCase() === 'API ENDPOINT') {
            answers.set('cfapi', keyvalue[1].trim() + ':' + keyvalue[2].trim());
          } else if (keyvalue[0] === 'org') {
            answers.set('cforg', keyvalue[1].trim());
          } else if (keyvalue[0] === 'space') {
            answers.set('cfspace', keyvalue[1].trim());
          }
        }
      }
    }

    // scaffold the project
    this.sourceRoot(path.join(__dirname, "templates"));
    glob
      .sync("**", {
        cwd: this.sourceRoot(),
        nodir: true,
        dot: true
      })
      .forEach((file) => {
        if (!(file.includes('.DS_Store'))) {
          if (!(file === 'dotenv' && answers.get('api') === false)) {
            if (!(file === 'xs-security.json' && answers.get('authentication') === false && answers.get('api') === false && answers.get('html5repo') === false)) {
              if (!((file === 'Jenkinsfile' || file.substring(0, 9) === '.pipeline') && answers.get('cicd') === false)) {
                if (!(file.substring(0, 19) === 'srv/catalog-service' && answers.get('hana') === false && answers.get('api') === false)) {
                  if (!(file === 'srv/provisioning.js' && answers.get('multiTenant') === false)) {
                    if (!(file === 'srv/server.js' && answers.get('v2support') === false && answers.get('multiTenant') === false)) {
                      if (!(file.substring(0, 32) === 'srv/external/API_SALES_ORDER_SRV' && answers.get('apiS4HCSO') === false)) {
                        if (!((file.substring(0, 25) === 'srv/external/RCMCandidate' || file.includes('map.html')) && answers.get('apiSFSFRC') === false)) {
                          if (!((file.substring(0, 15) === 'app/xs-app.json' || file.substring(0, 16) === 'app/package.json') && (answers.get('managedAppRouter') === true || (answers.get('authentication') === false && answers.get('ui') === false)))) {
                            if (!((file.substring(0, 13) === 'app/resources' || file.includes('i18n') || file.includes('index.cds')) && answers.get('ui') === false)) {
                              if (!((file.substring(0, 19) === 'app/resources/fiori' || file.includes('i18n') || file.includes('index.cds')) && answers.get('hana') === false)) {
                                if (!((file.substring(0, 31) === 'app/resources/fiori/xs-app.json' || file.substring(0, 32) === 'app/resources/fiori/package.json') && answers.get('html5repo') === false)) {
                                  if (!((file.substring(0, 31) === 'app/resources/html5/xs-app.json' || file.substring(0, 32) === 'app/resources/html5/package.json' || file.substring(0, 33) === 'app/resources/html5/manifest.json') && answers.get('html5repo') === false)) {
                                    if (!(file.substring(0, 2) === 'db' && answers.get('hana') === false && answers.get('schemaName') === "")) {
                                      if (!((file.substring(0, 17) === 'db/data-model.cds' || file.substring(0, 7) === 'db/data') && answers.get('hana') === false)) {
                                        if (!(file.substring(0, 7) === 'db/src/' && answers.get('hanaNative') === false && answers.get('schemaName') === "")) {
                                          if (!(file.substring(0, 20) === 'db/src/_SCHEMA_NAME_' && answers.get('schemaName') === "")) {
                                            if (!((file.substring(0, 10) === 'db/src/SP_' || file.substring(0, 10) === 'db/src/TT_') && answers.get('hanaNative') === false)) {
                                              const sOrigin = this.templatePath(file);
                                              let fileDest = file;
                                              console.log(file);
                                              if (fileDest.includes('_PROJECT_NAME_')) {
                                                fileDest = 'db/data/' + answers.get('projectName') + '.db-Sales.csv';
                                              }
                                              if (fileDest.includes('_SCHEMA_NAME_')) {
                                                fileDest = 'db/src/' + answers.get('schemaName') + '.hdbgrants';
                                              }
                                              if (fileDest === 'dotenv') {
                                                fileDest = '.env';
                                              }
                                              if (fileDest === 'dotgitignore') {
                                                fileDest = '.gitignore';
                                              }
                                              const sTarget = this.destinationPath(fileDest);
                                              this.fs.copyTpl(sOrigin, sTarget, this.config.getAll());
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

    if (answers.get('schemaName') !== "") {
      var fs = this.fs;
      var destinationRoot = this.destinationRoot();
      var prefix = answers.get('projectName') + '_' + answers.get('schemaName');

      // connect to HANA to obtain metadata for tables in schema, scaffold project files & create technical user and roles
      var hana = require('@sap/hana-client')
      var connOptions = {
        serverNode: answers.get('hanaEndpoint'),
        encrypt: 'true',
        sslValidateCertificate: 'true',
        ssltruststore: '-----BEGIN CERTIFICATE-----MIIDrzCCApegAwIBAgIQCDvgVpBCRrGhdWrJWZHHSjANBgkqhkiG9w0BAQUFADBhMQswCQYDVQQGEwJVUzEVMBMGA1UEChMMRGlnaUNlcnQgSW5jMRkwFwYDVQQLExB3d3cuZGlnaWNlcnQuY29tMSAwHgYDVQQDExdEaWdpQ2VydCBHbG9iYWwgUm9vdCBDQTAeFw0wNjExMTAwMDAwMDBaFw0zMTExMTAwMDAwMDBaMGExCzAJBgNVBAYTAlVTMRUwEwYDVQQKEwxEaWdpQ2VydCBJbmMxGTAXBgNVBAsTEHd3dy5kaWdpY2VydC5jb20xIDAeBgNVBAMTF0RpZ2lDZXJ0IEdsb2JhbCBSb290IENBMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4jvhEXLeqKTTo1eqUKKPC3eQyaKl7hLOllsBCSDMAZOnTjC3U/dDxGkAV53ijSLdhwZAAIEJzs4bg7/fzTtxRuLWZscFs3YnFo97nh6Vfe63SKMI2tavegw5BmV/Sl0fvBf4q77uKNd0f3p4mVmFaG5cIzJLv07A6Fpt43C/dxC//AH2hdmoRBBYMql1GNXRor5H4idq9Joz+EkIYIvUX7Q6hL+hqkpMfT7PT19sdl6gSzeRntwi5m3OFBqOasv+zbMUZBfHWymeMr/y7vrTC0LUq7dBMtoM1O/4gdW7jVg/tRvoSSiicNoxBN33shbyTApOB6jtSj1etX+jkMOvJwIDAQABo2MwYTAOBgNVHQ8BAf8EBAMCAYYwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUA95QNVbRTLtm8KPiGxvDl7I90VUwHwYDVR0jBBgwFoAUA95QNVbRTLtm8KPiGxvDl7I90VUwDQYJKoZIhvcNAQEFBQADggEBAMucN6pIExIK+t1EnE9SsPTfrgT1eXkIoyQY/EsrhMAtudXH/vTBH1jLuG2cenTnmCmrEbXjcKChzUyImZOMkXDiqw8cvpOp/2PV5Adg06O/nVsJ8dWO41P0jmP6P6fbtGbfYmbW0W5BjfIttep3Sp+dWOIrWcBAI+0tKIJFPnlUkiaY4IBIqDfv8NZ5YBberOgOzW6sRBc4L0na4UU+Krk2U886UAb3LujEV0lsYSEY1QSteDwsOoBrp+uvFRTp2InBuThs4pFsiv9kuXclVzDAGySj4dzp30d8tbQkCAUw7C29C79Fv1C5qfPrmAESrciIxpg0X40KPMbp1ZWVbd4=-----END CERTIFICATE-----',
        uid: answers.get('hanaUser'),
        pwd: answers.get('hanaPassword')
      };
      let connection = hana.createConnection();
      connection.connect(connOptions, function (err) {
        if (err) {
          return console.error(err);
        }
        let sql = "SELECT 'T' AS object_type, table_name as object_name FROM tables WHERE schema_name='" + schemaNameAdjustedCase + "' AND is_system_table='FALSE' AND is_temporary='FALSE' UNION SELECT 'V' AS object_type, view_name as object_name FROM views WHERE schema_name='" + schemaNameAdjustedCase + "'";
        connection.exec(sql, function (err, resObjects) {
          if (err) {
            return console.error(err);
          }
          if (resObjects.length < 1) {
            return console.error("No tables or views found in schema " + answers.get('schemaName'));
          }

          // create synonyms
          let hdbSynonym = "{";
          let i = 0;
          resObjects.forEach(element => {
            if (i) hdbSynonym += ",";
            hdbSynonym += '"' + answers.get('projectName') + '.db::' + answers.get('schemaName') + '.' + element.OBJECT_NAME + '": {"target": {"object":"' + element.OBJECT_NAME + '","schema":"' + schemaNameAdjustedCase + '"}}';
            i++;
          });
          hdbSynonym += "}";
          sql = "SELECT 'T' AS object_type, table_name as object_name, column_name, data_type_name, length, scale, is_nullable, default_value, position FROM table_columns WHERE schema_name='" + schemaNameAdjustedCase + "' AND table_name IN(''";
          resObjects.forEach(element => {
            if (element.OBJECT_TYPE === "T") {
              sql += ",'" + element.OBJECT_NAME + "'";
            }
          });
          sql += ") UNION SELECT 'V' AS object_type, view_name as object_name, column_name, data_type_name, length, scale, is_nullable, default_value, position FROM view_columns WHERE schema_name='" + schemaNameAdjustedCase + "' AND view_name IN(''";
          resObjects.forEach(element => {
            if (element.OBJECT_TYPE === "V") {
              sql += ",'" + element.OBJECT_NAME + "'";
            }
          });
          sql += ") ORDER BY object_name, position";
          connection.exec(sql, function (err, resColumns) {
            if (err) {
              return console.error(err);
            }

            // create hdbview for each object
            var hdbViews = [];
            resObjects.forEach(elementO => {
              let hdbView = "VIEW " + answers.get('projectName').toUpperCase() + "_DB_" + answers.get('schemaName').toUpperCase() + "_" + (elementO.OBJECT_NAME).toUpperCase() + " AS SELECT";
              let i = 0;
              resColumns.forEach(elementC => {
                if (elementC.OBJECT_NAME === elementO.OBJECT_NAME) {
                  if (i) hdbView += ",";
                  if (elementC.COLUMN_NAME !== (elementC.COLUMN_NAME).toUpperCase()) {
                    hdbView += ' "' + elementC.COLUMN_NAME + '" AS ' + (elementC.COLUMN_NAME).toUpperCase();
                  } else {
                    hdbView += " " + elementC.COLUMN_NAME;
                  }
                  i++;
                }
              });
              hdbView += ' FROM "' + answers.get('projectName') + '.db::' + answers.get('schemaName') + '.' + elementO.OBJECT_NAME + '"';
              var view = { "NAME": elementO.OBJECT_NAME, "VIEW": hdbView };
              hdbViews.push(view);
            });
            let sql = "SELECT table_name as object_name, column_name, position, is_primary_key FROM constraints WHERE schema_name='" + schemaNameAdjustedCase + "' AND table_name IN(''";
            resObjects.forEach(element => {
              if (element.OBJECT_TYPE === "T") {
                sql += ",'" + element.OBJECT_NAME + "'";
              }
            });
            sql += ") ORDER BY table_name, position";
            connection.exec(sql, function (err, resConstraints) {
              if (err) {
                return console.error(err);
              }

              // create facade entity for each view
              let schemaCDS = "namespace " + answers.get('projectName') + ".db; context " + answers.get('schemaName') + " {";
              resObjects.forEach(elementO => {
                schemaCDS += " @cds.persistence.exists entity " + elementO.OBJECT_NAME;
                /* view parameters not supported yet: need to include in db/src/.hdbview, db/<schemaName>.cds and srv/<schemaName>-service.cds
                //let sql = "SELECT view_name as object_name, parameter_name, data_type_name, length, scale, has_default_value, position FROM view_parameters WHERE schema_name='" + schemaNameAdjustedCase + "' AND view_name IN(";
                  // add any view parameters
                  i = 0;
                  resParameters.forEach(elementP => {
                    console.log(elementP.OBJECT_NAME,elementO.OBJECT_NAME);
                    if (elementP.OBJECT_NAME === elementO.OBJECT_NAME) {
                      if (i) {
                        schemaCDS += ",";
                      } else {
                        schemaCDS += " (";
                      }
                      schemaCDS += elementP.PARAMETER_NAME + " : ";
                      switch (elementP.DATA_TYPE_NAME) {
                        case "BOOLEAN": schemaCDS += "Boolean"; break;
                        case "TINYINT":
                        case "SMALLINT":
                        case "INTEGER": schemaCDS += "Integer"; break;
                        case "BIGINT": schemaCDS += "Integer64"; break;
                        case "REAL":
                        case "DOUBLE": schemaCDS += "Double"; break;
                        case "SMALLDECIMAL":
                        case "DECIMAL": schemaCDS += "Decimal(" + elementP.LENGTH + "," + elementP.SCALE + ")"; break;
                        case "DATE": schemaCDS += "Date"; break;
                        case "TIME": schemaCDS += "Time"; break;
                        case "TIMESTAMP": schemaCDS += "Timestamp"; break;
                        case "CHAR":
                        case "NCHAR":
                        case "CLOB":
                        case "VARCHAR":
                        case "NVARCHAR": schemaCDS += "String(" + elementP.LENGTH + ")"; break;
                        case "VARBINARY":
                        case "BINARY": schemaCDS += "Binary(" + elementP.LENGTH + ")"; break;
                        case "BLOB": schemaCDS += "LargeBinary"; break;
                        case "NCLOB": schemaCDS += "LargeString"; break;
                        default: schemaCDS += elementP.DATA_TYPE_NAME;
                      }
                      i++;
                    }
                  });
                  if (i) schemaCDS += ")";
                */
                schemaCDS += " {";
                i = 0;
                resColumns.forEach(elementC => {
                  if (elementC.OBJECT_NAME === elementO.OBJECT_NAME) {
                    resConstraints.forEach(elementI => {
                      if (elementI.OBJECT_NAME === elementC.OBJECT_NAME && elementI.COLUMN_NAME === elementC.COLUMN_NAME && elementI.IS_PRIMARY_KEY === "TRUE") {
                        schemaCDS += " key";
                      }
                    });
                    // unclear how to determine key for views - assume first column
                    if (elementC.OBJECT_TYPE === "V" && i === 0) {
                      schemaCDS += " key";
                    }
                    i++;
                    schemaCDS += " " + (elementC.COLUMN_NAME).toLowerCase() + " : ";
                    switch (elementC.DATA_TYPE_NAME) {
                      case "BOOLEAN": schemaCDS += "Boolean"; break;
                      case "TINYINT":
                      case "SMALLINT":
                      case "INTEGER": schemaCDS += "Integer"; break;
                      case "BIGINT": schemaCDS += "Integer64"; break;
                      case "REAL":
                      case "DOUBLE": schemaCDS += "Double"; break;
                      case "SMALLDECIMAL":
                      case "DECIMAL": schemaCDS += "Decimal(" + elementC.LENGTH + "," + elementC.SCALE + ")"; break;
                      case "DATE": schemaCDS += "Date"; break;
                      case "TIME": schemaCDS += "Time"; break;
                      case "TIMESTAMP": schemaCDS += "Timestamp"; break;
                      case "CHAR":
                      case "NCHAR":
                      case "CLOB":
                      case "VARCHAR":
                      case "NVARCHAR": schemaCDS += "String(" + elementC.LENGTH + ")"; break;
                      case "VARBINARY":
                      case "BINARY": schemaCDS += "Binary(" + elementC.LENGTH + ")"; break;
                      case "BLOB": schemaCDS += "LargeBinary"; break;
                      case "NCLOB": schemaCDS += "LargeString"; break;
                      default: schemaCDS += elementC.DATA_TYPE_NAME;
                    }
                    if (elementC.IS_NULLABLE === "FALSE") {
                      schemaCDS += " not null";
                    }
                    if (elementC.DEFAULT_VALUE != null) {
                      schemaCDS += " default ";
                      switch (elementC.DATA_TYPE_NAME) {
                        case "BOOLEAN":
                        case "BIGINT":
                        case "DOUBLE":
                        case "DECIMAL":
                        case "SMALLINT":
                        case "TINYINT":
                        case "SMALLDECIMAL":
                        case "REAL":
                        case "INTEGER": schemaCDS += elementC.DEFAULT_VALUE; break;
                        default: schemaCDS += "'" + elementC.DEFAULT_VALUE + "'";
                      }

                    }
                    schemaCDS += ";";
                  }
                });
                schemaCDS += "};";
              });
              schemaCDS += "}";

              // create service
              let serviceCDS = "using {" + answers.get('projectName') + ".db." + answers.get('schemaName') + " as " + answers.get('schemaName') + "} from '../db/" + answers.get('schemaName') + "'; service " + answers.get('schemaName') + "Service @(path : '/" + answers.get('schemaName') + "')";
              if (answers.get('authentication')) {
                serviceCDS += " @(requires:'authenticated-user')";
              }
              serviceCDS += " {";
              resObjects.forEach(element => {
                serviceCDS += " entity " + element.OBJECT_NAME;
                if (answers.get('authorization')) {
                  serviceCDS += " @(restrict: [{ grant: 'READ', to: 'Viewer' }, { grant: 'WRITE', to: 'Admin' } ])";
                }
                if (element.OBJECT_TYPE === "V") {
                  serviceCDS += " as select * from " + answers.get('schemaName') + "." + element.OBJECT_NAME + ";";
                } else {
                  serviceCDS += " as select * from " + answers.get('schemaName') + "." + element.OBJECT_NAME + ";";
                }
              });
              serviceCDS += "};";

              // scaffold project files
              fs.write(destinationRoot + "/db/src/" + answers.get('schemaName') + ".hdbsynonym", hdbSynonym);
              hdbViews.forEach(element => {
                fs.write(destinationRoot + "/db/src/" + answers.get('schemaName') + "-" + element.NAME + ".hdbview", element.VIEW);
              });
              fs.write(destinationRoot + "/db/" + answers.get('schemaName') + ".cds", schemaCDS);
              fs.write(destinationRoot + "/srv/" + answers.get('schemaName') + "-service.cds", serviceCDS);

              if (answers.get('schemaUPS') === true) {

                // create HANA technical user and roles
                console.log('Creating SAP HANA Cloud technical user and roles:');

                sql = 'CREATE USER ' + prefix + '_GRANTOR PASSWORD ' + grantorPassword + ' NO FORCE_FIRST_PASSWORD_CHANGE';
                console.log(sql + ";");
                connection.exec(sql, function (err, result) {
                  if (err) {
                    return console.error(err);
                  }
                  sql = 'CREATE ROLE "' + prefix + '::EXTERNAL_ACCESS_G"';
                  console.log(sql + ";");
                  connection.exec(sql, function (err, result) {
                    if (err) {
                      return console.error(err);
                    }
                    sql = 'CREATE ROLE "' + prefix + '::EXTERNAL_ACCESS"';
                    console.log(sql + ";");
                    connection.exec(sql, function (err, result) {
                      if (err) {
                        return console.error(err);
                      }
                      sql = 'GRANT "' + prefix + '::EXTERNAL_ACCESS_G", "' + prefix + '::EXTERNAL_ACCESS" TO ' + prefix + '_GRANTOR WITH ADMIN OPTION';
                      console.log(sql + ";");
                      connection.exec(sql, function (err, result) {
                        if (err) {
                          return console.error(err);
                        }
                        sql = 'GRANT SELECT,INSERT,UPDATE,DELETE ON SCHEMA "' + schemaNameAdjustedCase + '" TO "' + prefix + '::EXTERNAL_ACCESS_G" WITH GRANT OPTION';
                        console.log(sql + ";");
                        connection.exec(sql, function (err, result) {
                          if (err) {
                            return console.error(err);
                          }
                          sql = 'GRANT SELECT,INSERT,UPDATE,DELETE ON SCHEMA "' + schemaNameAdjustedCase + '" TO "' + prefix + '::EXTERNAL_ACCESS"';
                          console.log(sql + ";");
                          connection.exec(sql, function (err, result) {
                            if (err) {
                              return console.error(err);
                            }
                            connection.disconnect(function (err) {
                              done(err);
                            });
                          });
                        });
                      });
                    });
                  });
                });
              }
            });
          });
        });
      });

      if (answers.get('schemaUPS') === true) {
        // create the user-provided service instance
        // we do this instead of adding to the mta.yaml to avoid the HANA technical user & password being visible in project source files
        let cupsParams = '{"user":"' + prefix + '_GRANTOR","password":"' + grantorPassword + '","schema":"' + schemaNameAdjustedCase + '","tags":["hana"]}';
        console.log('Creating User-Provided Service Instance:');
        console.log('cf cups ' + answers.get('projectName') + '-db-' + answers.get('schemaName') + " -p '" + cupsParams + "'");
        this.spawnCommandSync('cf', ['cups', answers.get('projectName') + '-db-' + answers.get('schemaName'), '-p', cupsParams]);
      }
    }

    answers.delete('hanaUser');
    answers.delete('hanaPassword');
    answers.delete('APIKey');

  }

  install() {
    // build and deploy if requested
    var answers = this.config;
    var mta = "mta_archives/" + answers.get("projectName") + "_0.0.1.mtar";
    if (answers.get("buildDeploy")) {
      let opt = { "cwd": this.destinationPath() };
      let resBuild = this.spawnCommandSync("mbt", ["build"], opt);
      if (resBuild.status === 0) {
        this.spawnCommandSync("cf", ["deploy", mta], opt);
      }
    } else {
      this.log("You need to build and deploy your project as follows:");
      this.log(" cd " + answers.get("projectName"));
      this.log(" mbt build");
      this.log(" cf deploy " + mta);
    }
  }

  end() {
    this.log("");
    if (this.config.get('customDomain') !== "" && this.config.get('multiTenant')) {
      this.log("Important: The wildcard custom domain route needs be mapped via the following CF CLI command after deployment:");
      this.log("  cf map-route " + this.config.get('projectName') + " " + this.config.get('customDomain') + ' --hostname "*"');
    }
    if (this.config.get('routes')) {
      let projectName = this.config.get('projectName');
      this.log("Important: The CF API is being used so please be sure to issue the following CF CLI commands after deployment:");
      this.log("  cf set-env " + projectName + "-srv cf_api_user '<email>'");
      this.log("  cf set-env " + projectName + "-srv cf_api_password '<password>'");
      this.log("  cf restage " + projectName + "-srv");
    }
    if (this.config.get('multiTenant') && this.config.get('api')) {
      this.log("Don't forget to configure the destination for each subscriber.");
    }
    this.log("");
  }

};
