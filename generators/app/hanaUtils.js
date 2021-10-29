module.exports = {
    hanaTargetHDI2Schema: hanaTargetHDI2Schema,
    schemaNameAdjustedCase: schemaNameAdjustedCase,
    processSchema: processSchema,
    processSchemaUPS: processSchemaUPS
};

const hana = require('@sap/hana-client');
const hanaCert = '-----BEGIN CERTIFICATE-----MIIDrzCCApegAwIBAgIQCDvgVpBCRrGhdWrJWZHHSjANBgkqhkiG9w0BAQUFADBhMQswCQYDVQQGEwJVUzEVMBMGA1UEChMMRGlnaUNlcnQgSW5jMRkwFwYDVQQLExB3d3cuZGlnaWNlcnQuY29tMSAwHgYDVQQDExdEaWdpQ2VydCBHbG9iYWwgUm9vdCBDQTAeFw0wNjExMTAwMDAwMDBaFw0zMTExMTAwMDAwMDBaMGExCzAJBgNVBAYTAlVTMRUwEwYDVQQKEwxEaWdpQ2VydCBJbmMxGTAXBgNVBAsTEHd3dy5kaWdpY2VydC5jb20xIDAeBgNVBAMTF0RpZ2lDZXJ0IEdsb2JhbCBSb290IENBMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4jvhEXLeqKTTo1eqUKKPC3eQyaKl7hLOllsBCSDMAZOnTjC3U/dDxGkAV53ijSLdhwZAAIEJzs4bg7/fzTtxRuLWZscFs3YnFo97nh6Vfe63SKMI2tavegw5BmV/Sl0fvBf4q77uKNd0f3p4mVmFaG5cIzJLv07A6Fpt43C/dxC//AH2hdmoRBBYMql1GNXRor5H4idq9Joz+EkIYIvUX7Q6hL+hqkpMfT7PT19sdl6gSzeRntwi5m3OFBqOasv+zbMUZBfHWymeMr/y7vrTC0LUq7dBMtoM1O/4gdW7jVg/tRvoSSiicNoxBN33shbyTApOB6jtSj1etX+jkMOvJwIDAQABo2MwYTAOBgNVHQ8BAf8EBAMCAYYwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUA95QNVbRTLtm8KPiGxvDl7I90VUwHwYDVR0jBBgwFoAUA95QNVbRTLtm8KPiGxvDl7I90VUwDQYJKoZIhvcNAQEFBQADggEBAMucN6pIExIK+t1EnE9SsPTfrgT1eXkIoyQY/EsrhMAtudXH/vTBH1jLuG2cenTnmCmrEbXjcKChzUyImZOMkXDiqw8cvpOp/2PV5Adg06O/nVsJ8dWO41P0jmP6P6fbtGbfYmbW0W5BjfIttep3Sp+dWOIrWcBAI+0tKIJFPnlUkiaY4IBIqDfv8NZ5YBberOgOzW6sRBc4L0na4UU+Krk2U886UAb3LujEV0lsYSEY1QSteDwsOoBrp+uvFRTp2InBuThs4pFsiv9kuXclVzDAGySj4dzp30d8tbQkCAUw7C29C79Fv1C5qfPrmAESrciIxpg0X40KPMbp1ZWVbd4=-----END CERTIFICATE-----';

function hanaTargetHDI2Schema(thisf, answers) {
    thisf.log("Accessing existing SAP HANA Cloud HDI Container: Start");
    thisf.log("Checking whether the service instance exists...");
    let resHDI = thisf.spawnCommandSync('cf', ['service', answers.get('hanaTargetHDI'), '--guid'], { stdio: 'pipe' });
    if (resHDI.status) {
        thisf.log("Service instance does not exist.");
    }
    thisf.log("Creating service key...");
    const hdiSK = 'sha-cap';
    resHDI = thisf.spawnCommandSync('cf', ['create-service-key', answers.get('hanaTargetHDI'), hdiSK], { stdio: 'pipe' });
    if (resHDI.status) {
        thisf.log("Unable to create service key:", resHDI.stdout.toString('utf8'));
    }
    thisf.log("Reading service key...");
    resHDI = thisf.spawnCommandSync('cf', ['service-key', answers.get('hanaTargetHDI'), hdiSK], { stdio: 'pipe' });
    if (resHDI.status) {
        thisf.log("Unable to read service key:", resHDI.stdout.toString('utf8'));
    }
    var hdiBinding;
    hdiBinding = resHDI.stdout.toString('utf8');
    hdiBinding = JSON.parse(hdiBinding.substring(hdiBinding.indexOf('{')));
    answers.set('schemaName', hdiBinding.schema);
    answers.set('hanaEndpoint', hdiBinding.host + ':' + hdiBinding.port);
    answers.set('hanaUser', hdiBinding.user);
    answers.set('hanaPassword', hdiBinding.password);
    thisf.log("Accessing existing SAP HANA Cloud HDI Container: End");
}

function schemaNameAdjustedCase(answers) {
    var schemaNameAdjustedCase = answers.get('schemaName');
    // when schema name is lowercase sometimes we need to specify it in uppercase!
    if (answers.get('schemaName') === answers.get('schemaName').toLowerCase()) {
        schemaNameAdjustedCase = answers.get('schemaName').toUpperCase();
    }
    return schemaNameAdjustedCase;
}

function processSchema(thisf, answers) {
    var schemaNameAdjustedCase = this.schemaNameAdjustedCase(answers);
    var destinationRoot = thisf.destinationRoot();

    var connection = hana.createConnection();
    var connOptions = {
        serverNode: answers.get('hanaEndpoint'),
        encrypt: 'true',
        sslValidateCertificate: 'true',
        ssltruststore: hanaCert,
        uid: answers.get('hanaUser'),
        pwd: answers.get('hanaPassword')
    };
    connection.connect(connOptions, function (err) {
        if (err) {
            thisf.log(err.message);
            return;
        }
        let sql = "SELECT 'T' AS object_type, table_name as object_name FROM tables WHERE schema_name='" + schemaNameAdjustedCase + "' AND is_system_table='FALSE' AND is_temporary='FALSE' AND is_user_defined_type='FALSE' UNION SELECT 'V' AS object_type, view_name as object_name FROM views WHERE schema_name='" + schemaNameAdjustedCase + "'";
        connection.exec(sql, function (err, resObjects) {
            if (err) {
                thisf.log(err.message);
                return;
            }
            // for HDI containers only objects that use namespaces are supported ie: app.db::object
            if (answers.get('hanaTargetHDI') !== "") {
                let l = resObjects.length;
                while (l--) {
                    if (resObjects[l].OBJECT_NAME.search('::') === -1) {
                        thisf.log("Table or View does not use a namespace so will not be processed: " + resObjects[l].OBJECT_NAME);
                        resObjects.splice(l, 1);
                    }
                }
            }
            // ignore calc view hierarchies
            let ll = resObjects.length;
            while (ll--) {
                if (!(resObjects[ll].OBJECT_NAME.search('/sqlh/') === -1 && resObjects[ll].OBJECT_NAME.search('/hier/') === -1)) {
                    thisf.log("Ignoring Calculation View hierarchy: " + resObjects[ll].OBJECT_NAME);
                    resObjects.splice(ll, 1);
                }
            }
            if (resObjects.length < 1) {
                thisf.log("No suitable tables or views found in schema " + answers.get('schemaName'));
                return;
            }

            // create grants
            let hdbGrants = '{"';
            if (answers.get('hanaTargetHDI') !== "") {
                hdbGrants += answers.get('hanaTargetHDI');
            } else {
                hdbGrants += answers.get('projectName') + "-db-" + answers.get('schemaName');
            }
            hdbGrants += '": { "object_owner": {';
            if (answers.get('hanaTargetHDI') !== "") {
                hdbGrants += ' "container_roles": ["' + resObjects[0].OBJECT_NAME.split("::")[0] + "::EXTERNAL_ACCESS_G#";
            } else {
                hdbGrants += ' "roles": ["' + answers.get('projectName') + "_" + answers.get('schemaName') + "::EXTERNAL_ACCESS_G";
            }
            hdbGrants += '"] }, "application_user": {';
            if (answers.get('hanaTargetHDI') !== "") {
                hdbGrants += ' "container_roles": ["' + resObjects[0].OBJECT_NAME.split("::")[0] + "::EXTERNAL_ACCESS";
            } else {
                hdbGrants += ' "roles": ["' + answers.get('projectName') + "_" + answers.get('schemaName') + "::EXTERNAL_ACCESS";
            }
            hdbGrants += '"] } } }';

            // create synonyms
            let hdbSynonym = "{";
            let hdbSynonymConfig = "{";
            let i = 0;
            resObjects.forEach(element => {
                if (i) {
                    hdbSynonym += ",";
                    hdbSynonymConfig += ",";
                }
                if (answers.get('hanaTargetHDI') !== "") {
                    hdbSynonym += '"' + answers.get('projectName').toUpperCase() + '_DB_' + element.OBJECT_NAME.split("::")[0].replace(/\./g, "_").toUpperCase() + '_SY_' + element.OBJECT_NAME.split("::")[1] + '": {"target": {"object":"' + element.OBJECT_NAME + '","schema":"_PLACEHOLDER_"}}';
                    hdbSynonymConfig += '"' + answers.get('projectName').toUpperCase() + '_DB_' + element.OBJECT_NAME.split("::")[0].replace(/\./g, "_").toUpperCase() + '_SY_' + element.OBJECT_NAME.split("::")[1] + '": {"target": {"object":"' + element.OBJECT_NAME + '","schema.configure":"' + answers.get('hanaTargetHDI') + '/schema"}}';
                } else {
                    hdbSynonym += '"' + answers.get('projectName').toUpperCase() + '_DB_' + answers.get('schemaName').toUpperCase() + '_SY_' + element.OBJECT_NAME + '": {"target": {"object":"' + element.OBJECT_NAME + '","schema":"' + schemaNameAdjustedCase + '"}}';
                }
                i++;
            });
            hdbSynonym += "}";
            hdbSynonymConfig += "}";
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
                    thisf.log(err.message);
                    return;
                }

                // create hdbview for each object
                var hdbViews = [];
                resObjects.forEach(elementO => {
                    var hdbView;
                    if (answers.get('hanaTargetHDI') !== "") {
                        hdbView = "VIEW " + answers.get('projectName').toUpperCase() + '_DB_' + elementO.OBJECT_NAME.split("::")[0].replace(/\./g, "_").toUpperCase() + '_' + elementO.OBJECT_NAME.split("::")[1].toUpperCase() + " AS\n  SELECT";
                    } else {
                        hdbView = "VIEW " + answers.get('projectName').toUpperCase() + "_DB_" + answers.get('schemaName').toUpperCase() + "_" + elementO.OBJECT_NAME.toUpperCase() + " AS\n  SELECT";
                    }
                    let i = 0;
                    resColumns.forEach(elementC => {
                        if (elementC.OBJECT_NAME === elementO.OBJECT_NAME) {
                            if (i) hdbView += ",\n        ";
                            hdbView += ' "' + elementC.COLUMN_NAME + '" AS ' + (elementC.COLUMN_NAME).toUpperCase();
                            i++;
                        }
                    });
                    var view;
                    if (answers.get('hanaTargetHDI') !== "") {
                        hdbView += '\n  FROM "' + answers.get('projectName').toUpperCase() + '_DB_' + elementO.OBJECT_NAME.split("::")[0].replace(/\./g, "_").toUpperCase() + '_SY_' + elementO.OBJECT_NAME.split("::")[1] + '"';
                        view = { "NAME": answers.get('projectName').toUpperCase() + '_DB_' + elementO.OBJECT_NAME.split("::")[0].replace(/\./g, "_").toUpperCase() + '_' + elementO.OBJECT_NAME.split("::")[1].toUpperCase(), "VIEW": hdbView };
                    } else {
                        hdbView += '\n  FROM "' + answers.get('projectName').toUpperCase() + '_DB_' + answers.get('schemaName').toUpperCase() + '_SY_' + elementO.OBJECT_NAME + '"';
                        view = { "NAME": elementO.OBJECT_NAME, "VIEW": hdbView };
                    }
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
                        thisf.log(err.message);
                        return;
                    }

                    // create facade entity for each view
                    let schemaCDS = "namespace " + answers.get('projectName') + ".db;\n\ncontext ";
                    if (answers.get('hanaTargetHDI') !== "") {
                        schemaCDS += resObjects[0].OBJECT_NAME.split(".")[0] + " {\n  context " + resObjects[0].OBJECT_NAME.split(".")[1].split("::")[0];
                    } else {
                        schemaCDS += answers.get('schemaName');
                    }
                    schemaCDS += " {";
                    resObjects.forEach(elementO => {
                        schemaCDS += "\n    @cds.persistence.exists\n    entity ";
                        if (answers.get('hanaTargetHDI') !== "") {
                            schemaCDS += elementO.OBJECT_NAME.split("::")[1];
                        } else {
                            schemaCDS += elementO.OBJECT_NAME;
                        }
                        /* view parameters not supported yet: need to include in db/src/.hdbview, db/<schemaName>.cds and srv/<schemaName>-service.cds
                        //let sql = "SELECT view_name as object_name, parameter_name, data_type_name, length, scale, has_default_value, position FROM view_parameters WHERE schema_name='" + schemaNameAdjustedCase + "' AND view_name IN(";
                          // add any view parameters
                          i = 0;
                          resParameters.forEach(elementP => {
                            thisf.log(elementP.OBJECT_NAME,elementO.OBJECT_NAME);
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
                        schemaCDS += " {\n";
                        i = 0;
                        resColumns.forEach(elementC => {
                            if (elementC.OBJECT_NAME === elementO.OBJECT_NAME) {
                                let isKey = false;
                                resConstraints.forEach(elementI => {
                                    if (elementI.OBJECT_NAME === elementC.OBJECT_NAME && elementI.COLUMN_NAME === elementC.COLUMN_NAME && elementI.IS_PRIMARY_KEY === "TRUE") {
                                        schemaCDS += "      key ";
                                        isKey = true;
                                    }
                                });
                                // unclear how to determine key for views - assume first column
                                if (elementC.OBJECT_TYPE === "V" && i === 0) {
                                    schemaCDS += "      key ";
                                    isKey = true;
                                }
                                i++;
                                if (!isKey) { schemaCDS += "          " }
                                schemaCDS += (elementC.COLUMN_NAME).toLowerCase() + " : ";
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
                                schemaCDS += ";\n";
                            }
                        });
                        schemaCDS += "    };";
                    });
                    if (answers.get('hanaTargetHDI') !== "") {
                        schemaCDS += "\n  }";
                    }
                    schemaCDS += "\n}";

                    // create service
                    var serviceCDS;
                    if (answers.get('hanaTargetHDI') !== "") {
                        serviceCDS = "using {" + answers.get('projectName') + ".db." + resObjects[0].OBJECT_NAME.split("::")[0] + " as " + answers.get('hanaTargetHDI').replace(/-/g, "_") + "} from '../db/" + answers.get('hanaTargetHDI') + "';\n\nservice " + answers.get('hanaTargetHDI').replace(/-/g, "_") + "_service @(path : '/" + answers.get('hanaTargetHDI') + "')";
                    } else {
                        serviceCDS = "using {" + answers.get('projectName') + ".db." + answers.get('schemaName') + " as " + answers.get('schemaName') + "} from '../db/" + answers.get('schemaName') + "';\n\nservice " + answers.get('schemaName') + "_service @(path : '/" + answers.get('schemaName') + "')";
                    }
                    if (answers.get('authentication')) {
                        serviceCDS += " @(requires:'authenticated-user')";
                    }
                    serviceCDS += " {";
                    resObjects.forEach(element => {
                        if (answers.get('hanaTargetHDI') !== "") {
                            serviceCDS += "\n    entity " + element.OBJECT_NAME.split("::")[1];
                        } else {
                            serviceCDS += "\n    entity " + element.OBJECT_NAME;
                        }
                        if (answers.get('authorization')) {
                            serviceCDS += " @(restrict: [{ grant: 'READ', to: 'Viewer' }, { grant: 'WRITE', to: 'Admin' } ])";
                        }
                        if (answers.get('hanaTargetHDI') !== "") {
                            serviceCDS += " as select * from " + answers.get('hanaTargetHDI').replace(/-/g, "_") + "." + element.OBJECT_NAME.split("::")[1] + ";";
                        } else {
                            serviceCDS += " as select * from " + answers.get('schemaName') + "." + element.OBJECT_NAME + ";";
                        }
                    });
                    serviceCDS += "\n};";

                    // scaffold project files
                    const fs2 = require('fs');
                    if (!fs2.existsSync(destinationRoot + "/db")) {
                        fs2.mkdirSync(destinationRoot + "/db");
                    };
                    let fileDest;
                    if (answers.get('hanaTargetHDI') !== "") {
                        fileDest = destinationRoot + "/db/" + answers.get('hanaTargetHDI');
                    } else {
                        fileDest = destinationRoot + "/db/" + answers.get('schemaName');
                    }
                    fs2.writeFile(fileDest + ".cds", schemaCDS, 'utf8', function (err) {
                        if (err) {
                            thisf.log(err.message);
                            return;
                        }
                    });
                    if (!fs2.existsSync(destinationRoot + "/db/src")) {
                        fs2.mkdirSync(destinationRoot + "/db/src");
                    };
                    if (answers.get('hanaTargetHDI') !== "") {
                        fileDest = destinationRoot + "/db/src/" + answers.get('hanaTargetHDI');
                    } else {
                        fileDest = destinationRoot + "/db/src/" + answers.get('schemaName');
                    }
                    fs2.writeFile(fileDest + ".hdbgrants", JSON.stringify(JSON.parse(hdbGrants), null, 4), 'utf8', function (err) {
                        if (err) {
                            thisf.log(err.message);
                            return;
                        }
                    });
                    fs2.writeFile(fileDest + ".hdbsynonym", JSON.stringify(JSON.parse(hdbSynonym), null, 4), 'utf8', function (err) {
                        if (err) {
                            thisf.log(err.message);
                            return;
                        }
                    });
                    if (answers.get('hanaTargetHDI') !== "") {
                        if (!fs2.existsSync(destinationRoot + "/db/cfg")) {
                            fs2.mkdirSync(destinationRoot + "/db/cfg");
                        };
                        fileDest = destinationRoot + "/db/cfg/" + answers.get('hanaTargetHDI');
                        fs2.writeFile(fileDest + ".hdbsynonymconfig", JSON.stringify(JSON.parse(hdbSynonymConfig), null, 4), 'utf8', function (err) {
                            if (err) {
                                thisf.log(err.message);
                                return;
                            }
                        });
                    }
                    hdbViews.forEach(element => {
                        if (answers.get('hanaTargetHDI') !== "") {
                            fileDest = destinationRoot + "/db/src/" + element.NAME;
                        } else {
                            fileDest = destinationRoot + "/db/src/" + answers.get('schemaName') + "-" + element.NAME;
                        }
                        fs2.writeFile(fileDest + ".hdbview", element.VIEW, 'utf8', function (err) {
                            if (err) {
                                thisf.log(err.message);
                                return;
                            }
                        });
                    });
                    if (!fs2.existsSync(destinationRoot + "/srv")) {
                        fs2.mkdirSync(destinationRoot + "/srv");
                    };
                    if (answers.get('hanaTargetHDI') !== "") {
                        fileDest = destinationRoot + "/srv/" + answers.get('hanaTargetHDI');
                    } else {
                        fileDest = destinationRoot + "/srv/" + answers.get('schemaName');
                    }
                    fs2.writeFile(fileDest + "-service.cds", serviceCDS, 'utf8', function (err) {
                        if (err) {
                            thisf.log(err.message);
                            return;
                        }
                    });
                    connection.disconnect(function (err) {
                        if (err) {
                            thisf.log(err.message);
                            return;
                        }
                    });
                });
            });
        });
    });
}

function processSchemaUPS(thisf, answers) {
    var prefix = answers.get('projectName') + '_' + answers.get('schemaName');
    var schemaNameAdjustedCase = this.schemaNameAdjustedCase(answers);

    // generate a password
    var pwdgen = require('generate-password');
    var grantorPassword = pwdgen.generate({
        length: 30,
        numbers: true
    });

    // define SAP HANA Cloud technical user, roles and grants
    const sql1 = 'CREATE USER ' + prefix + '_GRANTOR PASSWORD ' + grantorPassword + ' NO FORCE_FIRST_PASSWORD_CHANGE';
    const sql2 = 'CREATE ROLE "' + prefix + '::EXTERNAL_ACCESS_G"';
    const sql3 = 'CREATE ROLE "' + prefix + '::EXTERNAL_ACCESS"';
    const sql4 = 'GRANT "' + prefix + '::EXTERNAL_ACCESS_G", "' + prefix + '::EXTERNAL_ACCESS" TO ' + prefix + '_GRANTOR WITH ADMIN OPTION';
    const sql5 = 'GRANT SELECT,INSERT,UPDATE,DELETE ON SCHEMA "' + schemaNameAdjustedCase + '" TO "' + prefix + '::EXTERNAL_ACCESS_G" WITH GRANT OPTION';
    const sql6 = 'GRANT SELECT,INSERT,UPDATE,DELETE ON SCHEMA "' + schemaNameAdjustedCase + '" TO "' + prefix + '::EXTERNAL_ACCESS"';
    const sql7 = 'DROP ROLE "' + prefix + '::EXTERNAL_ACCESS_G"';
    const sql8 = 'DROP ROLE "' + prefix + '::EXTERNAL_ACCESS"';
    const sql9 = 'DROP USER ' + prefix + '_GRANTOR CASCADE';
    if (answers.get('hanaTargetHDI') === "") {
        thisf.log('Syntax to create the SAP HANA Cloud technical user, roles and grants:');
        thisf.log(sql1 + ";");
        thisf.log(sql2 + ";");
        thisf.log(sql3 + ";");
        thisf.log(sql4 + ";");
        thisf.log(sql5 + ";");
        thisf.log(sql6 + ";");
        thisf.log('');
        thisf.log('Syntax to delete the SAP HANA Cloud technical user, roles and grants:');
        thisf.log(sql7 + ";");
        thisf.log(sql8 + ";");
        thisf.log(sql9 + ";");
        thisf.log('');
    }

    // define user-provided service instance
    // we take this approach instead of writing to mta.yaml to avoid the SAP HANA Cloud technical user & password being visible in project source files
    const cupsParams = '{"user":"' + prefix + '_GRANTOR","password":"' + grantorPassword + '","schema":"' + schemaNameAdjustedCase + '","tags":["hana"]}';
    if (answers.get('hanaTargetHDI') === "") {
        thisf.log('Syntax to create the User-Provided Service Instance:');
        thisf.log('cf cups ' + answers.get('projectName') + '-db-' + answers.get('schemaName') + " -p '" + cupsParams + "'");
        thisf.log('');
        thisf.log('Syntax to delete the User-Provided Service Instance:');
        thisf.log('cf delete-service ' + answers.get('projectName') + '-db-' + answers.get('schemaName'));
        thisf.log('');
    }

    // actually create HANA technical user & roles & UPS only if requested
    if (answers.get('schemaUPS') === true) {
        var done = thisf.async();
        var connection = hana.createConnection();
        var connOptions = {
            serverNode: answers.get('hanaEndpoint'),
            encrypt: 'true',
            sslValidateCertificate: 'true',
            ssltruststore: hanaCert,
            uid: answers.get('hanaUser'),
            pwd: answers.get('hanaPassword')
        };
        connection.connect(connOptions, function (err) {
            if (err) {
                thisf.log(err.message);
                return;
            }
            connection.exec(sql1, function (err, result) {
                if (err) {
                    thisf.log(err.message);
                    return;
                }
                connection.exec(sql2, function (err, result) {
                    if (err) {
                        thisf.log(err.message);
                        return;
                    }
                    connection.exec(sql3, function (err, result) {
                        if (err) {
                            thisf.log(err.message);
                            return;
                        }
                        connection.exec(sql4, function (err, result) {
                            if (err) {
                                thisf.log(err.message);
                                return;
                            }
                            connection.exec(sql5, function (err, result) {
                                if (err) {
                                    thisf.log(err.message);
                                    return;
                                }
                                connection.exec(sql6, function (err, result) {
                                    if (err) {
                                        thisf.log(err.message);
                                        return;
                                    }
                                    connection.disconnect(function (err) {
                                        done(err);
                                        thisf.spawnCommandSync('cf', ['cups', answers.get('projectName') + '-db-' + answers.get('schemaName'), '-p', cupsParams]);
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    }
}