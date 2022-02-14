"use strict";
const Generator = require("yeoman-generator");
const path = require("path");
const glob = require("glob");
const credStore = require('./credStore');
const hanaUtils = require('./hanaUtils');
const graphUtils = require('./graphUtils');

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
        name: "hanaTargetHDI",
        message: "Will you be using an existing SAP HANA Cloud HDI Container? If so please enter the HDI Container service instance name here or leave blank for none.",
        default: ""
      },
      {
        when: response => response.hanaTargetHDI === "",
        type: "input",
        name: "schemaName",
        message: "Will you be using an existing SAP HANA Cloud schema? If so please enter the schema name here or leave blank for none. Note: schema names in mixed case are case sensitive!",
        default: ""
      },
      {
        when: response => response.hanaTargetHDI === "" && response.schemaName !== "",
        type: "input",
        name: "hanaEndpoint",
        message: "What is your SAP HANA Cloud SQL endpoint?",
        default: "<guid>.hana.<region>.hanacloud.ondemand.com:443"
      },
      {
        when: response => response.hanaTargetHDI === "" && response.schemaName !== "",
        type: "input",
        name: "hanaUser",
        message: "What is your SAP HANA Cloud user name?",
        default: "DBADMIN"
      },
      {
        when: response => response.hanaTargetHDI === "" && response.schemaName !== "",
        type: "password",
        name: "hanaPassword",
        message: "What is the password for your SAP HANA Cloud user?",
        mask: "*",
        default: ""
      },
      {
        when: response => response.hanaTargetHDI === "" && response.schemaName !== "",
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
        choices: ["SAP S/4HANA Cloud Sales Order (A2X)", "SAP S/4HANA Cloud Business Partner (A2X)", "SAP SuccessFactors Recruiting", "SAP SuccessFactors Employee Central", "SAP Ariba Network Purchase Orders Buyer", "SAP Ariba Web Services", "SAP Fieldglass Connectors", "SAP Fieldglass Approvals", "SAP Concur", "SAP Graph", "HERE Location Services", "NASA Near Earth Object Web Service"],
        default: ["SAP S/4HANA Cloud Sales Order (A2X)"]
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP Graph"),
        type: "input",
        name: "GraphURL",
        message: "What is your SAP Graph URL?",
        default: "https://<region>.graph.sap/api"
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP Graph"),
        type: "input",
        name: "GraphId",
        message: "What is your SAP Graph Business Data Graph Identifier?",
        default: "v1"
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP Graph"),
        type: "input",
        name: "GraphTokenURL",
        message: "What is your SAP Graph Token URL?",
        default: "https://<subdomain>.authentication.<region>.hana.ondemand.com"
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP Graph"),
        type: "input",
        name: "GraphClientId",
        message: "What is your SAP Graph Client Id?",
        default: ""
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP Graph"),
        type: "password",
        name: "GraphClientSecret",
        message: "What is your SAP Graph Client Secret?",
        mask: "*",
        default: ""
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
        message: "What is the buyer's SAP Ariba Network Id (ANID)?",
        default: "AN02000000280"
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP Ariba Network Purchase Orders Buyer"),
        type: "password",
        name: "APIKeyAriba",
        message: "What is your application-specific SAP Ariba API Key?",
        mask: "*",
        default: ""
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP Ariba Web Services"),
        type: "input",
        name: "AribaRealm",
        message: "What is your SAP Ariba Realm?",
        default: "consulting-T"
      },
      {
        when: response => response.api === true && (response.apiLoB.includes("SAP Fieldglass Connectors") || response.apiLoB.includes("SAP Fieldglass Approvals")),
        type: "input",
        name: "FGHost",
        message: "What is the host name of your SAP Fieldglass system?",
        default: ""
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP Fieldglass Connectors"),
        type: "input",
        name: "FGCNclientId",
        message: "What is your SAP Fieldglass Buyer Company Code?",
        default: ""
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP Fieldglass Connectors"),
        type: "input",
        name: "FGCNsupplierId",
        message: "What is your SAP Fieldglass Supplier Company Code?",
        default: ""
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP Fieldglass Connectors"),
        type: "input",
        name: "FGCNJobPostingSupplierDownload",
        message: "What is your SAP Fieldglass Given Connector Name for Job Posting Supplier Download?",
        default: ""
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP Fieldglass Connectors"),
        type: "input",
        name: "FGCNWorkerfromWorkOrderXMLDownload",
        message: "What is your SAP Fieldglass Given Connector Name for Worker from Work Order XML Download?",
        default: ""
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP Fieldglass Connectors"),
        type: "input",
        name: "FGCNJobSeekerUpload",
        message: "What is your SAP Fieldglass Given Connector Name for Job Seeker Upload?",
        default: ""
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP Fieldglass Connectors"),
        type: "input",
        name: "FGCNWorkOrderAcceptUpload",
        message: "What is your SAP Fieldglass Given Connector Name for Work Order Accept Upload?",
        default: ""
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP Concur"),
        type: "input",
        name: "ConcurGeolocation",
        message: "What is your SAP Concur geolocation?",
        default: "https://us.api.concursolutions.com"
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
        when: response => response.api === true,
        type: "confirm",
        name: "connectivity",
        message: "Will you be accessing on-premise systems via the Cloud Connector?",
        default: false
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
        when: response => response.authentication === true && response.api === true && response.apiLoB.includes("SAP Graph"),
        type: "confirm",
        name: "GraphSameSubaccount",
        message: "Will you be deploying to the subaccount of the SAP Graph service instance?",
        default: true
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
        when: response => response.api === true,
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
      if (answers.hanaTargetHDI !== "") {
        answers.schemaName = "";
        answers.multiTenant = false;
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
        answers.FGHost = "";
        answers.FGCNclientId = "";
        answers.FGCNsupplierId = "";
        answers.FGCNJobPostingSupplierDownload = "";
        answers.FGCNWorkerfromWorkOrderXMLDownload = "";
        answers.FGCNJobSeekerUpload = "";
        answers.FGCNWorkOrderAcceptUpload = "";
        answers.ConcurGeolocation = "";
        answers.GraphURL = "";
        answers.GraphId = "";
        answers.GraphTokenURL = "";
        answers.GraphClientId = "";
        answers.GraphClientSecret = "";
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
      answers.apiFGCN = answers.apiLoB.includes("SAP Fieldglass Connectors");
      answers.apiFGAP = answers.apiLoB.includes("SAP Fieldglass Approvals");
      answers.apiCONC = answers.apiLoB.includes("SAP Concur");
      answers.apiGRAPH = answers.apiLoB.includes("SAP Graph");
      answers.apiHERE = answers.apiLoB.includes("HERE Location Services");
      answers.apiNeoWs = answers.apiLoB.includes("NASA Near Earth Object Web Service");
      answers.ApplicationInterfaceKey = "";
      if (answers.api) {
        if (answers.apiS4HCSO || answers.apiS4HCBP || answers.apiSFSFRC || answers.apiSFSFEC || answers.apiARIBPO || answers.apiARIBWS || answers.apiCONC) {
          answers.ApplicationInterfaceKey = "saptest0";
        }
        if (!(answers.apiS4HCSO || answers.apiS4HCBP || answers.apiSFSFRC || answers.apiSFSFEC || answers.apiARIBPO || answers.apiFGAP)) {
          answers.APIKeyHubSandbox = "";
        }
      } else {
        answers.GraphSameSubaccount = false;
        answers.connectivity = false;
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
      if (answers.apiFGCN === false) {
        answers.FGCNclientId = "";
        answers.FGCNsupplierId = "";
        answers.FGCNJobPostingSupplierDownload = "";
        answers.FGCNWorkerfromWorkOrderXMLDownload = "";
        answers.FGCNJobSeekerUpload = "";
        answers.FGCNWorkOrderAcceptUpload = "";
      }
      if (answers.apiFGCN === false && answers.apiFGAP === false) {
        answers.FGHost = "";
      }
      if (answers.apiCONC === false) {
        answers.ConcurGeolocation = "";
      }
      if (answers.apiGRAPH === false) {
        answers.GraphURL = "";
        answers.GraphId = "";
        answers.GraphTokenURL = "";
        answers.GraphClientId = "";
        answers.GraphClientSecret = "";
        answers.GraphSameSubaccount = false;
      }
      if (answers.apiHERE === false) {
        answers.APIKeyHERE = "";
      }
      if (answers.apiNeoWs === false) {
        answers.APIKeyNASA = "";
      } else if (answers.APIKeyNASA === "") {
        answers.APIKeyNASA = "DEMO_KEY";
      }
      if (answers.authentication === false) {
        answers.authorization = false;
        answers.multiTenant = false;
      }
      if (answers.authentication === false) {
        answers.haa = false;
        answers.GraphSameSubaccount = false;
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
      if (answers.api === false) {
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

    if (answers.get('hanaTargetHDI') !== "") {
      hanaUtils.hanaTargetHDI2Schema(this, answers);
    }

    let graphDataSources = [];
    if (answers.get('apiGRAPH')) {
      graphDataSources = await graphUtils.getgraphDataSources(this, answers);
      if (!graphDataSources) {
        this.env.error("Unable to obtain SAP Graph Data Sources.");
      }
    }
    answers.set('graphDataSources', graphDataSources);

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
      if (answers.get('ApplicationInterfaceKey') !== '') resCreds = await credStore.writeCredential(credsBinding, credsNS, 'password', 'ApplicationInterfaceKey', answers.get('ApplicationInterfaceKey'));
      if (answers.get('APIKeyHubSandbox') !== '') resCreds = await credStore.writeCredential(credsBinding, credsNS, 'password', 'APIKeyHubSandbox', answers.get('APIKeyHubSandbox'));
      if (answers.get('apiARIBPO')) {
        resCreds = await credStore.writeCredential(credsBinding, credsNS, 'password', 'AribaNetworkId', answers.get('AribaNetworkId'));
        resCreds = await credStore.writeCredential(credsBinding, credsNS, 'password', 'APIKeyAriba', answers.get('APIKeyAriba'));
      }
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
                      if (!(file.substring(0, 19) === 'srv/catalog-service' && answers.get('hana') === false && answers.get('api') === false)) {
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
                                            if (!((file.substring(0, 33) === 'srv/external/FieldglassConnectors') && answers.get('apiFGCN') === false)) {
                                              if (!(file.substring(0, 34) === 'srv/templates/FieldglassConnectors' && answers.get('apiFGCN') === false)) {
                                                if (!((file.substring(0, 32) === 'srv/external/FieldglassApprovals') && answers.get('apiFGAP') === false)) {
                                                  if (!((file.substring(0, 19) === 'srv/external/Concur') && answers.get('apiCONC') === false)) {
                                                    if (!((file.substring(0, 33) === 'srv/external/HERELocationServices') && answers.get('apiHERE') === false)) {
                                                      if (!((file.substring(0, 38) === 'srv/external/NearEarthObjectWebService') && answers.get('apiNeoWs') === false)) {
                                                        if (!((file.substring(0, 15) === 'app/xs-app.json' || file.substring(0, 16) === 'app/package.json') && (answers.get('managedAppRouter') === true || (answers.get('authentication') === false && answers.get('ui') === false)))) {
                                                          if (!((file.substring(0, 13) === 'app/resources' || file.includes('i18n') || file.includes('index.cds')) && answers.get('ui') === false)) {
                                                            if (!((file.substring(0, 19) === 'app/resources/fiori' || file.includes('i18n') || file.includes('index.cds')) && answers.get('hana') === false)) {
                                                              if (!((file.substring(0, 24) === 'app/resources/index.html') && answers.get('html5repo') === true)) {
                                                                if (!((file.substring(0, 31) === 'app/resources/fiori/xs-app.json' || file.substring(0, 32) === 'app/resources/fiori/package.json' || file.substring(0, 35) === 'app/resources/fiori/ui5-deploy.yaml') && answers.get('html5repo') === false)) {
                                                                  if (!((file.substring(0, 31) === 'app/resources/html5/xs-app.json' || file.substring(0, 32) === 'app/resources/html5/package.json' || file.substring(0, 35) === 'app/resources/html5/ui5-deploy.yaml' || file.substring(0, 40) === 'app/resources/html5/webapp/manifest.json') && answers.get('html5repo') === false)) {
                                                                    if (!(file.substring(0, 2) === 'db' && answers.get('hana') === false && answers.get('schemaName') === "" && answers.get('hanaTargetHDI') === "")) {
                                                                      if (!((file.substring(0, 17) === 'db/data-model.cds' || file.substring(0, 7) === 'db/data' || file.substring(0, 6) === 'db/csv') && answers.get('hana') === false)) {
                                                                        if (!(file.substring(0, 31) === 'db/data/_PROJECT_NAME_.db.Sales' && answers.get('hana') === false)) {
                                                                          if (!((file.substring(0, 39) === 'db/src/_PROJECT_NAME_DB_EXTERNAL_ACCESS') && answers.get('hanaExternalHDI') === false)) {
                                                                            if (!((file.substring(0, 35) === 'db/csv/_PROJECT_NAME_.db.Conditions' || file.substring(0, 43) === 'db/data/_PROJECT_NAME_.db.CustomerProcesses' || file.substring(0, 31) === 'db/csv/_PROJECT_NAME_.db.Status') && (answers.get('apiS4HCBP') === false || answers.get('em') === false))) {
                                                                              if (!(file.substring(0, 7) === 'db/src/' && answers.get('hanaNative') === false && answers.get('hanaExternalHDI') === false && answers.get('hanaTargetHDI') === "" && answers.get('schemaName') === "")) {
                                                                                if (!((file.substring(0, 10) === 'db/src/SP_' || file.substring(0, 10) === 'db/src/TT_' || file.substring(0, 10) === 'db/src/CV_' || file.substring(0, 10) === 'db/src/TF_' || file.substring(0, 10) === 'db/src/SYS') && answers.get('hanaNative') === false)) {
                                                                                  const sOrigin = this.templatePath(file);
                                                                                  let fileDest = file;
                                                                                  if (fileDest.includes('_PROJECT_NAME_.db')) {
                                                                                    let folder = 'db/data';
                                                                                    if (fileDest.substring(0, 6) === 'db/csv') folder = fileDest.substring(0, 6);
                                                                                    fileDest = folder + '/' + answers.get('projectName') + '.db-' + fileDest.split(".", 3)[2] + '.csv';
                                                                                  }
                                                                                  if (fileDest.includes('_PROJECT_NAME_DB_EXTERNAL_ACCESS')) {
                                                                                    let tempDest = 'db/src/' + answers.get('projectName').toUpperCase() + '_DB_EXTERNAL_ACCESS';
                                                                                    if (fileDest.includes('EXTERNAL_ACCESS_G')) {
                                                                                      tempDest += '_G';
                                                                                    }
                                                                                    fileDest = tempDest + '.' + fileDest.split(".", 3)[1];
                                                                                  }
                                                                                  if (fileDest.includes('app/resources/') && answers.get('html5repo')) {
                                                                                    fileDest = 'app/' + fileDest.substring(14);
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
      hanaUtils.processSchema(this, answers);
      hanaUtils.processSchemaUPS(this, answers);
    }

    answers.delete('hanaEndpoint');
    answers.delete('hanaUser');
    answers.delete('hanaPassword');
    answers.delete('APIKeyHubSandbox');
    answers.delete('SFSystemName');
    answers.delete('AribaNetworkId');
    answers.delete('APIKeyAriba');
    answers.delete('AribaRealm');
    answers.delete('FGHost');
    answers.delete('FGCNclientId');
    answers.delete('FGCNsupplierId');
    answers.delete('ConcurGeolocation');
    answers.delete('GraphClientId');
    answers.delete('GraphClientSecret');
    answers.delete('APIKeyHERE');
    answers.delete('APIKeyNASA');
    answers.delete('ApplicationInterfaceKey');

  }

  async install() {
    var answers = this.config;
    if (answers.get("apiGRAPH")) {
      await graphUtils.graphImport(this, answers);
    }
    // build and deploy if requested
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
    if (this.config.get('authentication') && this.config.get('apiGRAPH') && this.config.get('GraphSameSubaccount') === false) {
      this.log("Important: Trust needs to be configured when not deploying to the subaccount of the SAP Graph service instance!");
    }
    if (this.config.get('customDomain') !== "" && this.config.get('multiTenant')) {
      this.log("Important: The wildcard custom domain route needs be mapped via the following CF CLI command after deployment:");
      this.log("  cf map-route " + this.config.get('projectName') + " " + this.config.get('customDomain') + ' --hostname "*"');
    }
    if (this.config.get('routes')) {
      this.log("Important: The CF API is being used so please be sure to update the destination " + this.config.get('projectName') + "-cfapi - Token Service URL (replace login with uaa) and set User & Password. Client Secret needs to be empty.");
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
