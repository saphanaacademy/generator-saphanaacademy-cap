"use strict";
const Generator = require("yeoman-generator");
const path = require("path");
const glob = require("glob");
const credStore = require('./credStore');

module.exports = class extends Generator {
  prompting() {
    return this.prompt([
      {
        type: "input",
        name: "projectName",
        message: "What project name would you like?",
        validate: (s) => {
          if (/^[a-zA-Z0-9_]*$/g.test(s)) {
            return true;
          }
          return "Please only use alphanumeric characters for the project name.";
        },
        default: "app"
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
        default: "App"
      },
      {
        type: "input",
        name: "description",
        message: "What is the description of your app?",
        default: "Business Application"
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
        mask: "*",
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
        type: "input",
        name: "hanaTargetHDI",
        message: "Will you be accessing an external HDI Container? If so please enter the HDI Container service instance name here or leave blank for none.",
        default: ""
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
        when: response => response.hana === true,
        type: "confirm",
        name: "hanaExternalHDI",
        message: "Would you like to enable external access to the HDI Container?",
        default: false
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
        message: "Which external API(s) would you like to use?",
        choices: ["SAP S/4HANA Cloud Sales Order (A2X)", "SAP S/4HANA Cloud Business Partner (A2X)", "SAP SuccessFactors Recruiting", "SAP SuccessFactors Employee Central", "SAP Ariba Network Purchase Orders Buyer", "SAP Ariba Web Services", "SAP Fieldglass Approvals", "SAP Concur", "SAP Graph Workforce", "HERE Location Services", "NASA Near Earth Object Web Service"],
        default: ["SAP S/4HANA Cloud Sales Order (A2X)"]
      },
      {
        when: response => response.api === true && (response.apiLoB.includes("SAP SuccessFactors Recruiting") || response.apiLoB.includes("SAP SuccessFactors Employee Central")),
        type: "input",
        name: "SFSystemName",
        message: "What is the System Name for SAP SuccessFactors?",
        default: ""
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP Ariba Network Purchase Orders Buyer"),
        type: "input",
        name: "AribaNetworkId",
        message: "What is the buyer's Ariba Network Id (ANID)?",
        default: "AN02000000280"
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP Ariba Network Purchase Orders Buyer"),
        type: "password",
        name: "APIKeyAriba",
        message: "What is your application-specific Ariba API Key?",
        mask: "*",
        default: ""
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP Ariba Web Services"),
        type: "input",
        name: "AribaRealm",
        message: "What is your Ariba Realm?",
        default: "consulting-T"
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP Fieldglass Approvals"),
        type: "password",
        name: "APIKeyFieldglass",
        message: "What is your company-specific key provided by SAP Fieldglass for API access?",
        mask: "*",
        default: ""
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP Concur"),
        type: "input",
        name: "ConcurGeolocation",
        message: "What is your Concur geolocation?",
        default: "https://us.api.concursolutions.com"
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP Graph Workforce"),
        type: "password",
        name: "APIKeyGraph",
        message: "What is your access token for SAP Graph API sandbox? Leave blank to use a read-only public access token.",
        mask: "*",
        default: ""
      },
      {
        when: response => response.api === true && response.apiLoB.includes("HERE Location Services"),
        type: "password",
        name: "APIKeyHERE",
        message: "What is your HERE Location Services API Key?",
        mask: "*",
        default: ""
      },
      {
        when: response => response.api === true && response.apiLoB.includes("NASA Near Earth Object Web Service"),
        type: "password",
        name: "APIKeyNASA",
        message: "What is your NASA API Key? Leave blank to use a public demo key.",
        mask: "*",
        default: ""
      },
      {
        when: response => response.api === true && (response.apiLoB.includes("SAP S/4HANA Cloud Sales Order (A2X)") || response.apiLoB.includes("SAP S/4HANA Cloud Business Partner (A2X)") || response.apiLoB.includes("SAP SuccessFactors Recruiting") || response.apiLoB.includes("SAP SuccessFactors Employee Central") || response.apiLoB.includes("SAP Ariba Network Purchase Orders Buyer") || response.apiLoB.includes("SAP Fieldglass Approvals")),
        type: "password",
        name: "APIKeyHubSandbox",
        message: "What is your API Key for the SAP API Business Hub sandbox?",
        mask: "*",
        default: ""
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
        default: ""
      },
      {
        when: response => response.hana === true && response.authentication === true && response.schemaName === "" && response.hanaTargetHDI === "" && response.html5repo === false,
        type: "confirm",
        name: "multiTenant",
        message: "Would you like to create a SaaS multitenant app?",
        default: false
      },
      {
        when: response => response.multiTenant === true,
        type: "input",
        name: "category",
        message: "What is the category of your app?",
        default: "SaaS Multitenant Apps"
      },
      {
        when: response => response.multiTenant === true && response.customDomain === "",
        type: "confirm",
        name: "routes",
        message: "Would you like to include creation/deletion of tenant routes on subscribe/unsubscribe (via the CF API)?",
        default: false
      },
      {
        type: "confirm",
        name: "em",
        message: "Would you like to enable messaging with SAP Event Mesh?",
        default: false
      },
      {
        when: response => response.em === true,
        type: "input",
        name: "emNamespace",
        message: "What messaging namespace would you like? Note: Namespaces must contain exactly three segments and be unique per subaccount.",
        validate: (s) => {
          if (/^[a-zA-Z0-9//]*$/g.test(s) && s.split("/").length === 3 && s.substring(0, 1) !== "/" && s.substring(s.length - 1, s.length) !== "/") {
            return true;
          }
          return "Please specify exactly three segments and only use alphanumeric characters for the messaging namespace.";
        },
        default: "company/technology/events"
      },
      {
        when: response => response.em === true && (response.apiLoB.includes("SAP S/4HANA Cloud Sales Order (A2X)") || response.apiLoB.includes("SAP S/4HANA Cloud Business Partner (A2X)")),
        type: "input",
        name: "emClientId",
        message: "What is the emClientId of your SAP S/4HANA Cloud Extensibility messaging service instance?",
        validate: (s) => {
          if (s.length >= 1 && s.length <= 4 && /^[a-zA-Z0-9]*$/g.test(s)) {
            return true;
          }
          return "Please use between 1 and 4 alphanumeric characters for the emClientID.";
        },
        default: ""
      },
      {
        type: "confirm",
        name: "cicd",
        message: "Would you like to enable Continuous Integration and Delivery (CI/CD)?",
        default: false
      },
      {
        type: "confirm",
        name: "applicationLogging",
        message: "Would you like to enable Application Logging?",
        default: false
      },
      {
        when: response => response.api === true || (response.multiTenant === true && response.routes === true),
        type: "input",
        name: "credStore",
        message: "What is the name of your SAP Credential Store service instance? Leave blank to use environment variables instead.",
        validate: (s) => {
          if (/^[a-zA-Z0-9_-]*$/g.test(s)) {
            return true;
          }
          return "Please only use alphanumeric characters for the SAP Credential Store service instance name.";
        },
        default: ""
      },
      {
        when: response => response.hana === true && response.hanaNative === true && response.authentication === true,
        type: "confirm",
        name: "haa",
        message: "Would you like to include the SAP HANA Analytics Adapter (HAA)?",
        default: false
      },
      {
        when: response => response.haa === true,
        type: "input",
        name: "haaHostname",
        message: "What is the hostname of the client application that will be accessing HAA? Use * for wildcard.",
        validate: (s) => {
          if (s === "*") {
            return true;
          }
          if (/^[a-zA-Z0-9.-]*$/g.test(s)) {
            return true;
          }
          return "Please only use alphanumeric characters for the client application hostname or use * for wildcard.";
        },
        default: "*"
      },
      {
        when: response => response.haa === true,
        type: "confirm",
        name: "haaPersonalizeJWT",
        message: "Would you like HAA to propagate the application user to SAP HANA Cloud?",
        default: false
      },
      {
        when: response => response.haa === true,
        type: "confirm",
        name: "haaUseNamedUser",
        message: "Would you like HAA to connect to SAP HANA Cloud via JWT-based SSO (this implies shadow users in SAP HANA Cloud)?",
        default: false
      },
      {
        type: "confirm",
        name: "swagger",
        message: "Would you like to enable a Swagger UI?",
        default: false
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
      if (answers.hanaTargetHDI !== "") {
        answers.multiTenant = false;
      }
      if (answers.hana === false) {
        answers.hanaNative = false;
        answers.hanaExternalHDI = false;
        answers.multiTenant = false;
        answers.haa = false;
      }
      if (answers.hanaNative === false) {
        answers.haa = false;
      }
      if (answers.api === false) {
        answers.apiLoB = [];
        answers.APIKeyHubSandbox = "";
        answers.SFSystemName = "";
        answers.AribaNetworkId = "";
        answers.APIKeyAriba = "";
        answers.AribaRealm = "";
        answers.APIKeyFieldglass = "";
        answers.ConcurGeolocation = "";
        answers.APIKeyGraph = "";
        answers.APIKeyHERE = "";
        answers.APIKeyNASA = "";
        answers.credStore = "";
      }
      answers.apiS4HCSO = answers.apiLoB.includes("SAP S/4HANA Cloud Sales Order (A2X)");
      answers.apiS4HCBP = answers.apiLoB.includes("SAP S/4HANA Cloud Business Partner (A2X)");
      answers.apiSFSFRC = answers.apiLoB.includes("SAP SuccessFactors Recruiting");
      answers.apiSFSFEC = answers.apiLoB.includes("SAP SuccessFactors Employee Central");
      answers.apiARIBPO = answers.apiLoB.includes("SAP Ariba Network Purchase Orders Buyer");
      answers.apiARIBWS = answers.apiLoB.includes("SAP Ariba Web Services");
      answers.apiFGAP = answers.apiLoB.includes("SAP Fieldglass Approvals");
      answers.apiCONC = answers.apiLoB.includes("SAP Concur");
      answers.apiGRAPH = answers.apiLoB.includes("SAP Graph Workforce");
      answers.apiHERE = answers.apiLoB.includes("HERE Location Services");
      answers.apiNeoWs = answers.apiLoB.includes("NASA Near Earth Object Web Service");
      answers.apiSAP = false;
      if (answers.api) {
        if (answers.apiS4HCSO || answers.apiS4HCBP || answers.apiSFSFRC || answers.apiSFSFEC || answers.apiARIBPO || answers.apiFGAP || answers.apiCONC || answers.apiGRAPH) {
          answers.apiSAP = true;
        }
        if (!(answers.apiS4HCSO || answers.apiS4HCBP || answers.apiSFSFRC || answers.apiSFSFEC || answers.apiARIBPO || answers.apiFGAP)) {
          answers.APIKeyHubSandbox = "";
        }
      }
      if (answers.apiSFSFRC === false && answers.apiSFSFEC === false) {
        answers.SFSystemName = "";
      }
      if (answers.apiARIBPO === false) {
        answers.AribaNetworkId = "";
        answers.APIKeyAriba = "";
      }
      if (answers.apiARIBWS === false) {
        answers.AribaRealm = "";
      }
      if (answers.apiFGAP === false) {
        answers.APIKeyFieldglass = "";
      }
      if (answers.apiCONC === false) {
        answers.ConcurGeolocation = "";
      }
      if (answers.apiGRAPH === false) {
        answers.APIKeyGraph = "";
      } else if (answers.APIKeyGraph === "") {
        answers.APIKeyGraph = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX25hbWUiOiIiLCJ6aWQiOiJlMjYzMTNkZi0yNDgzLTRjNWItOTg5Yi03ZWQwOGJmMjk3YzMiLCJhdWQiOiJkZW1vLmFwaS5ncmFwaC5zYXAiLCJleHAiOjQ2ODg2MDkyMjEsImlhdCI6MTYwMzg3ODE0MiwiaXNzIjoiZGVtby5hcGkuZ3JhcGguc2FwIiwic3ViIjoiZGVtb0BncmFwaC5zYXAifQ.1nJljCX2HTUv9swW4a7HgYhxQGfH_DBTRqHrw66Xwv_oPC8bEFo5LpVqXCUrGCuCBLVr-1vrUhBKlfvZD9lg7D3z2Xc70PrmKcUEufa0m6my61QUprYuwMmN89yzsnQSUVwIikm4Po6Xo_cfWOXVDzr0WCjGaG_PAnikHMWFHhHbGpc3X1u-ATFw7Rq0oiulXWfavWBEKKB1zFxQ91dC1T103X4sYk3A2fk-dII8zL2XZ1CeOTi4_ntAYjJ5mm71jN0CwTrUWsLGOGe3aevcIw2QLqH44z96ZRy43LdOr8FzHaATwpd-i9FwQ7HlH8ZDqfHu-6FxBpiI29tT5CfwIQ";
      }
      if (answers.apiHERE === false) {
        answers.APIKeyHERE = "";
      }
      if (answers.apiNeoWs === false) {
        answers.APIKeyNASA = "";
      } else if (answers.APIKeyNASA === "") {
        answers.APIKeyNASA = "DEMO_KEY";
      }
      answers.ApplicationInterfaceKey = "saptest0";
      if (answers.authentication === false) {
        answers.authorization = false;
        answers.multiTenant = false;
      }
      if (answers.authentication === false) {
        answers.haa = false;
      }
      if (answers.authentication === false || answers.authorization === false) {
        answers.attributes = false;
      }
      if (answers.ui === false) {
        answers.html5repo = false;
        answers.managedAppRouter = false;
        if (answers.authentication === true) {
          answers.multiTenant = false;
        }
      }
      if (answers.html5repo === true) {
        answers.srvPath = "";
        answers.multiTenant = false;
        answers.haa = false;
      } else {
        answers.srvPath = "/";
        answers.managedAppRouter = false;
      }
      if (answers.multiTenant === false) {
        answers.category = "";
        answers.routes = false;
      } else {
        answers.haa = false;
      }
      if (answers.em === false) {
        answers.emNamespace = "";
        answers.emClientId = "";
      }
      if (answers.apiS4HCSO === false && answers.apiS4HCBP === false) {
        answers.emClientId = "";
      }
      if (answers.customDomain !== "") {
        answers.routes = false;
      }
      if (!(answers.api === true || (answers.multiTenant === true && answers.routes === true))) {
        answers.credStore = "";
      }
      answers.credStoreNS = answers.projectName;
      if (answers.haa === false) {
        answers.haaHostname = "";
        answers.haaPersonalizeJWT = false;
        answers.haaUseNamedUser = false;
      }
      this.config.set(answers);
    });
  }

  async writing() {
    var answers = this.config;
    if (answers.get('schemaName') !== "") {
      // when schema name is lowercase sometimes we need to specify it in uppercase!
      var schemaNameAdjustedCase = answers.get('schemaName');
      if (answers.get('schemaName') === answers.get('schemaName').toLowerCase()) {
        schemaNameAdjustedCase = answers.get('schemaName').toUpperCase();
      }
      var pwdgen = require('generate-password');
      var grantorPassword = pwdgen.generate({
        length: 30,
        numbers: true
      });
      if (answers.get('schemaUPS') === true) {
        var done = this.async();
      }
    }
    if (answers.get('cicd') === true) {
      answers.set('cforg', 'org');
      answers.set('cfspace', 'space');
      answers.set('cfapi', 'https://api.cf.region.hana.ondemand.com');
      // try to identify the targeted api, org & space
      const resTarget = this.spawnCommandSync('cf', ['target'], { stdio: 'pipe' });
      const stdoutTarget = resTarget.stdout.toString('utf8');
      var field_strings = stdoutTarget.split(/[\r\n]*---[\r\n]*/);
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
    var credsBinding;
    if (answers.get('credStore') !== "") {
      this.log("Configuring SAP Credential Service: Start");
      this.log("Checking whether the service instance exists...");
      let resCreds = this.spawnCommandSync('cf', ['service', answers.get('credStore'), '--guid'], { stdio: 'pipe' });
      if (resCreds.status) {
        this.log("Service instance does not exist. Will try to create it. Checking available service plans...");
        resCreds = this.spawnCommandSync('cf', ['marketplace', '-e', 'credStore'], { stdio: 'pipe' });
        let credsPlans = resCreds.stdout.toString('utf8');
        // best guess typically trial or standard - for other plans create the service instance before running the generator
        let credsPlan = '';
        if (credsPlans.search('standard') >= 0) {
          credsPlan = 'standard';
        } else if (credsPlans.search('trial') >= 0) {
          credsPlan = 'trial';
        }
        this.log("Creating service instance...", answers.get('credStore'), credsPlan);
        resCreds = this.spawnCommandSync('cf', ['create-service', 'credStore', credsPlan, answers.get('credStore')], { stdio: 'pipe' });
        if (resCreds.status) {
          this.log("Unable to create service instance:", resCreds.stdout.toString('utf8'));
        }
      }
      this.log("Creating service key...");
      const credsSK = 'sha-cap';
      resCreds = this.spawnCommandSync('cf', ['create-service-key', answers.get('credStore'), credsSK], { stdio: 'pipe' });
      if (resCreds.status) {
        this.log("Unable to create service key:", resCreds.stdout.toString('utf8'));
      }
      this.log("Reading service key...");
      resCreds = this.spawnCommandSync('cf', ['service-key', answers.get('credStore'), credsSK], { stdio: 'pipe' });
      if (resCreds.status) {
        this.log("Unable to read service key:", resCreds.stdout.toString('utf8'));
      }
      credsBinding = resCreds.stdout.toString('utf8');
      credsBinding = JSON.parse(credsBinding.substring(credsBinding.indexOf('{')));
      this.log("Writing credentials...");
      const credsNS = answers.get('credStoreNS');
      if (answers.get('apiSAP')) resCreds = await credStore.writeCredential(credsBinding, credsNS, 'password', 'ApplicationInterfaceKey', answers.get('ApplicationInterfaceKey'));
      if (answers.get('APIKeyHubSandbox') !== '') resCreds = await credStore.writeCredential(credsBinding, credsNS, 'password', 'APIKeyHubSandbox', answers.get('APIKeyHubSandbox'));
      if (answers.get('apiARIBPO')) {
        resCreds = await credStore.writeCredential(credsBinding, credsNS, 'password', 'AribaNetworkId', answers.get('AribaNetworkId'));
        resCreds = await credStore.writeCredential(credsBinding, credsNS, 'password', 'APIKeyAriba', answers.get('APIKeyAriba'));
      }
      if (answers.get('apiFGAP')) resCreds = await credStore.writeCredential(credsBinding, credsNS, 'password', 'APIKeyFieldglass', answers.get('APIKeyFieldglass'));
      if (answers.get('apiGRAPH')) resCreds = await credStore.writeCredential(credsBinding, credsNS, 'password', 'APIKeyGraph', answers.get('APIKeyGraph'));
      if (answers.get('apiHERE')) resCreds = await credStore.writeCredential(credsBinding, credsNS, 'password', 'APIKeyHERE', answers.get('APIKeyHERE'));
      if (answers.get('apiNeoWs')) resCreds = await credStore.writeCredential(credsBinding, credsNS, 'password', 'APIKeyNASA', answers.get('APIKeyNASA'));
      if (answers.get('routes')) {
        resCreds = await credStore.writeCredential(credsBinding, credsNS, 'password', 'CFAPI', '<password>', '<email>');
      }
      this.log("Configuring SAP Credential Service: End");
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
              if (!(file === 'em.json' && answers.get('em') === false)) {
                if (!((file === 'Jenkinsfile' || file.substring(0, 9) === '.pipeline') && answers.get('cicd') === false)) {
                  if (!(file.substring(0, 3) === 'haa' && answers.get('haa') === false)) {
                    if (!(file.substring(0, 3) === 'tpl' && (answers.get('hana') === false || answers.get('multiTenant') === false))) {
                      if (!(file.substring(0, 19) === 'srv/catalog-service' && answers.get('hana') === false && answers.get('hanaTargetHDI') === "" && answers.get('api') === false)) {
                        if (!(file === 'srv/lib/credStore.js' && answers.get('credStore') === '')) {
                          if (!(file === 'srv/lib/utils.js' && (answers.get('apiARIBWS') === false && answers.get('apiCONC') === false))) {
                            if (!((file === 'srv/provisioning.js' || file === 'app/custom.js') && answers.get('multiTenant') === false)) {
                              if (!(file === 'srv/server.js' && answers.get('v2support') === false && answers.get('multiTenant') === false && answers.get('swagger') === false)) {
                                if (!(file.substring(0, 32) === 'srv/external/API_SALES_ORDER_SRV' && answers.get('apiS4HCSO') === false)) {
                                  if (!(file.substring(0, 33) === 'srv/external/API_BUSINESS_PARTNER' && answers.get('apiS4HCBP') === false)) {
                                    if (!((file.substring(0, 25) === 'srv/external/RCMCandidate' || file.includes('map.html')) && answers.get('apiSFSFRC') === false)) {
                                      if (!(file.substring(0, 36) === 'srv/external/ECEmploymentInformation' && answers.get('apiSFSFEC') === false)) {
                                        if (!((file.substring(0, 25) === 'srv/external/AribaNetwork') && answers.get('apiARIBPO') === false)) {
                                          if (!(file.substring(0, 19) === 'srv/templates/Ariba' && answers.get('apiARIBWS') === false)) {
                                            if (!((file.substring(0, 23) === 'srv/external/Fieldglass') && answers.get('apiFGAP') === false)) {
                                              if (!((file.substring(0, 19) === 'srv/external/Concur') && answers.get('apiCONC') === false)) {
                                                if (!((file.substring(0, 33) === 'srv/external/HERELocationServices') && answers.get('apiHERE') === false)) {
                                                  if (!((file.substring(0, 38) === 'srv/external/NearEarthObjectWebService') && answers.get('apiNeoWs') === false)) {
                                                    if (!((file.substring(0, 15) === 'app/xs-app.json' || file.substring(0, 16) === 'app/package.json') && (answers.get('managedAppRouter') === true || (answers.get('authentication') === false && answers.get('ui') === false)))) {
                                                      if (!((file.substring(0, 13) === 'app/resources' || file.includes('i18n') || file.includes('index.cds')) && answers.get('ui') === false)) {
                                                        if (!((file.substring(0, 19) === 'app/resources/fiori' || file.includes('i18n') || file.includes('index.cds')) && answers.get('hana') === false)) {
                                                          if (!((file.substring(0, 31) === 'app/resources/fiori/xs-app.json' || file.substring(0, 32) === 'app/resources/fiori/package.json') && answers.get('html5repo') === false)) {
                                                            if (!((file.substring(0, 31) === 'app/resources/html5/xs-app.json' || file.substring(0, 32) === 'app/resources/html5/package.json' || file.substring(0, 33) === 'app/resources/html5/manifest.json') && answers.get('html5repo') === false)) {
                                                              if (!(file.substring(0, 2) === 'db' && answers.get('hana') === false && answers.get('schemaName') === "" && answers.get('hanaTargetHDI') === "")) {
                                                                if (!((file.substring(0, 17) === 'db/data-model.cds' || file.substring(0, 7) === 'db/data') && (answers.get('hana') === false && answers.get('hanaTargetHDI') === ""))) {
                                                                  if (!(file.substring(0, 31) === 'db/data/_PROJECT_NAME_.db.Sales' && answers.get('hana') === false)) {
                                                                    if (!((file.substring(0, 39) === 'db/src/_PROJECT_NAME_DB_EXTERNAL_ACCESS') && answers.get('hanaExternalHDI') === false)) {
                                                                      if (!(file.substring(0, 33) === 'db/data/_PROJECT_NAME_.db.Widgets' && answers.get('hanaExternalHDI') === false)) {
                                                                        if (!((file.substring(0, 36) === 'db/data/_PROJECT_NAME_.db.Conditions' || file.substring(0, 34) === 'db/data/_PROJECT_NAME_.db.Customer' || file.substring(0, 32) === 'db/data/_PROJECT_NAME_.db.Status') && (answers.get('apiS4HCBP') === false || answers.get('em') === false))) {
                                                                          if (!(file.substring(0, 7) === 'db/src/' && answers.get('hanaNative') === false && answers.get('hanaExternalHDI') === false && answers.get('hanaTargetHDI') === "" && answers.get('schemaName') === "")) {
                                                                            if (!((file.substring(0, 7) === 'db/cfg/' || file.substring(0, 19) === 'db/src/_TARGET_HDI_') && answers.get('hanaTargetHDI') === "")) {
                                                                              if (!(file.substring(0, 20) === 'db/src/_SCHEMA_NAME_' && answers.get('schemaName') === "")) {
                                                                                if (!((file.substring(0, 10) === 'db/src/SP_' || file.substring(0, 10) === 'db/src/TT_' || file.substring(0, 10) === 'db/src/CV_') && answers.get('hanaNative') === false)) {
                                                                                  const sOrigin = this.templatePath(file);
                                                                                  let fileDest = file;
                                                                                  if (fileDest.includes('_PROJECT_NAME_.db')) {
                                                                                    fileDest = 'db/data/' + answers.get('projectName') + '.db-' + fileDest.split(".", 3)[2] + '.csv';
                                                                                  }
                                                                                  if (fileDest.includes('_PROJECT_NAME_DB_EXTERNAL_ACCESS')) {
                                                                                    let tempDest = 'db/src/' + answers.get('projectName').toUpperCase() + '_DB_EXTERNAL_ACCESS';
                                                                                    if (fileDest.includes('EXTERNAL_ACCESS_G')) {
                                                                                      tempDest += '_G';
                                                                                    }
                                                                                    fileDest = tempDest + '.' + fileDest.split(".", 3)[1];
                                                                                  }
                                                                                  if (fileDest.includes('_SCHEMA_NAME_')) {
                                                                                    fileDest = 'db/src/' + answers.get('schemaName') + '.' + fileDest.split(".", 3)[1];
                                                                                  }
                                                                                  if (fileDest.includes('_TARGET_HDI_')) {
                                                                                    fileDest = fileDest.substring(0, 7) + answers.get('hanaTargetHDI').toUpperCase().replace(/-/g, '_') + '.' + fileDest.split(".", 3)[1];
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

    var fs = this.fs;
    var destinationRoot = this.destinationRoot();

    if (answers.get('credStore') !== "") {
      let dotenv = fs.read(destinationRoot + "/.env");
      let VCAPServices = {
        "credstore": [
          {
            "binding_guid": "",
            "binding_name": null,
            "credentials": credsBinding,
            "instance_guid": "",
            "instance_name": answers.get('credStore'),
            "label": "credstore",
            "name": answers.get('credStore'),
            "plan": "",
            "tags": [
              "credstore",
              "securestore",
              "keystore",
              "credentials"
            ]
          }
        ]
      };
      dotenv += "VCAP_SERVICES=" + JSON.stringify(VCAPServices);
      fs.write(destinationRoot + "/.env", dotenv);
    }

    if (answers.get('schemaName') !== "") {
      var prefix = answers.get('projectName') + '_' + answers.get('schemaName');
      var thisgen = this;

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
          return this.error(err);
        }
        let sql = "SELECT 'T' AS object_type, table_name as object_name FROM tables WHERE schema_name='" + schemaNameAdjustedCase + "' AND is_system_table='FALSE' AND is_temporary='FALSE' UNION SELECT 'V' AS object_type, view_name as object_name FROM views WHERE schema_name='" + schemaNameAdjustedCase + "'";
        connection.exec(sql, function (err, resObjects) {
          if (err) {
            return this.error(err);
          }
          if (resObjects.length < 1) {
            return this.error("No tables or views found in schema " + answers.get('schemaName'));
          }

          // create synonyms
          let hdbSynonym = "{";
          let i = 0;
          resObjects.forEach(element => {
            if (i) hdbSynonym += ",";
            hdbSynonym += '"' + answers.get('projectName').toUpperCase() + '_DB_' + answers.get('schemaName').toUpperCase() + '_SY_' + element.OBJECT_NAME + '": {"target": {"object":"' + element.OBJECT_NAME + '","schema":"' + schemaNameAdjustedCase + '"}}';
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
              return this.error(err);
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
              hdbView += ' FROM "' + answers.get('projectName').toUpperCase() + '_DB_' + answers.get('schemaName').toUpperCase() + '_SY_' + elementO.OBJECT_NAME + '"';
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
                return this.error(err);
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
                    this.log(elementP.OBJECT_NAME,elementO.OBJECT_NAME);
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

              // define SAP HANA Cloud technical user, roles and grants
              thisgen.log('Syntax to create the SAP HANA Cloud technical user, roles and grants:');
              const sql1 = 'CREATE USER ' + prefix + '_GRANTOR PASSWORD ' + grantorPassword + ' NO FORCE_FIRST_PASSWORD_CHANGE';
              thisgen.log(sql1 + ";");
              const sql2 = 'CREATE ROLE "' + prefix + '::EXTERNAL_ACCESS_G"';
              thisgen.log(sql2 + ";");
              const sql3 = 'CREATE ROLE "' + prefix + '::EXTERNAL_ACCESS"';
              thisgen.log(sql3 + ";");
              const sql4 = 'GRANT "' + prefix + '::EXTERNAL_ACCESS_G", "' + prefix + '::EXTERNAL_ACCESS" TO ' + prefix + '_GRANTOR WITH ADMIN OPTION';
              thisgen.log(sql4 + ";");
              const sql5 = 'GRANT SELECT,INSERT,UPDATE,DELETE ON SCHEMA "' + schemaNameAdjustedCase + '" TO "' + prefix + '::EXTERNAL_ACCESS_G" WITH GRANT OPTION';
              thisgen.log(sql5 + ";");
              const sql6 = 'GRANT SELECT,INSERT,UPDATE,DELETE ON SCHEMA "' + schemaNameAdjustedCase + '" TO "' + prefix + '::EXTERNAL_ACCESS"';
              thisgen.log(sql6 + ";");
              thisgen.log("");

              // define user-provided service instance
              // we take this approach instead of writing to mta.yaml to avoid the SAP HANA Cloud technical user & password being visible in project source files
              const cupsParams = '{"user":"' + prefix + '_GRANTOR","password":"' + grantorPassword + '","schema":"' + schemaNameAdjustedCase + '","tags":["hana"]}';
              thisgen.log('Syntax to create the User-Provided Service Instance:');
              thisgen.log('cf cups ' + answers.get('projectName') + '-db-' + answers.get('schemaName') + " -p '" + cupsParams + "'");
              thisgen.log("");

              // create HANA technical user and roles only when requested
              if (answers.get('schemaUPS') === true) {
                connection.exec(sql1, function (err, result) {
                  if (err) {
                    return this.error(err);
                  }
                  connection.exec(sql2, function (err, result) {
                    if (err) {
                      return this.error(err);
                    }
                    connection.exec(sql3, function (err, result) {
                      if (err) {
                        return this.error(err);
                      }
                      connection.exec(sql4, function (err, result) {
                        if (err) {
                          return this.error(err);
                        }
                        connection.exec(sql5, function (err, result) {
                          if (err) {
                            return this.error(err);
                          }
                          connection.exec(sql6, function (err, result) {
                            if (err) {
                              return this.error(err);
                            }
                            connection.disconnect(function (err) {
                              done(err);
                              thisgen.spawnCommandSync('cf', ['cups', answers.get('projectName') + '-db-' + answers.get('schemaName'), '-p', cupsParams]);
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
    }

    answers.delete('hanaUser');
    answers.delete('hanaPassword');
    answers.delete('APIKeyHubSandbox');
    answers.delete('SFSystemName');
    answers.delete('AribaNetworkId');
    answers.delete('APIKeyAriba');
    answers.delete('AribaRealm');
    answers.delete('APIKeyFieldglass');
    answers.delete('ConcurGeolocation');
    answers.delete('APIKeyGraph');
    answers.delete('APIKeyHERE');
    answers.delete('APIKeyNASA');
    answers.delete('ApplicationInterfaceKey');

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
      this.log("");
      this.log("You can build and deploy your project from the command line as follows:");
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
      if (this.config.get('credStore') !== '') {
        this.log("Important: The CF API is being used so please be sure to set CFAPI in the SAP Credential Store service instance!");
      } else {
        this.log("Important: The CF API is being used so please be sure to issue the following CF CLI commands after deployment to set credentials:");
        this.log("  cf set-env " + projectName + "-srv CFAPIUser '<email>'");
        this.log("  cf set-env " + projectName + "-srv CFAPIPassword '<password>'");
        this.log("  cf restage " + projectName + "-srv");
      }
    }
    if (this.config.get('multiTenant') && this.config.get('api')) {
      this.log("Don't forget to configure the destination for each subscriber.");
    }
    if (this.config.get('haa')) {
      this.log("Don't forget to add the SAP HANA Analytics Adapter WAR file (java-xsahaa.war) to the haa/target folder. You can download the SAP HANA Analytics Adapter from https://tools.hana.ondemand.com/#hanatools");
    }
    this.log("");
  }

};
