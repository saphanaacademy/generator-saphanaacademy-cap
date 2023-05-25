"use strict";
const Generator = require("yeoman-generator");
const path = require("path");
const glob = require("glob");
const types = require("@sap-devx/yeoman-ui-types");
const hanaUtils = require('./hanaUtils');
const graphUtils = require('./graphUtils');
const customUtils = require('./customUtils');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.setPromptsCallback = (fn) => {
      if (this.prompts) {
        this.prompts.setCallback(fn);
      }
    };
    const virtualPrompts = [
      {
        name: "Project Attributes",
        description: "Configure the main project attributes."
      },
      {
        name: "Runtime Selection",
        description: "Choose and configure your runtime."
      },
      {
        name: "SAP HANA Cloud Selection",
        description: "Choose and configure SAP HANA Cloud."
      },
      {
        name: "API Selection",
        description: "Choose and configure APIs."
      },
      {
        name: "Custom OData API Entities",
        description: "Choose Custom OData API entities."
      },
      {
        name: "Additional Attributes",
        description: "Configure additional attributes."
      },
      {
        name: "Domain Attributes",
        description: "Configure domain attributes."
      },
      {
        name: "Multitenant Attributes",
        description: "Configure multitenant SaaS attributes."
      },
      {
        name: "Further Attributes",
        description: "Configure further attributes."
      }
    ];
    this.prompts = new types.Prompts(virtualPrompts);
  }

  initializing() {
    process.chdir(this.destinationRoot());
  }

  async prompting() {
    // defaults
    const answers = {};
    answers.projectName = "app";
    answers.newDir = true;
    answers.displayName = "App";
    answers.description = "Business Application";
    answers.BTPRuntime = "CF";
    answers.namespace = "default";
    answers.dockerID = "";
    answers.dockerRepositoryName = "";
    answers.dockerRepositoryVisibility = "public";
    answers.dockerRegistrySecretName = "docker-registry-config";
    answers.dockerServerURL = "https://index.docker.io/v1/";
    answers.dockerEmailAddress = "";
    answers.dockerPassword = "";
    answers.kubeconfig = "";
    answers.buildCmd = "pack";
    answers.hanaTargetHDI = "";
    answers.schemaName = "";
    answers.hanaEndpoint = "<guid>.hana.<region>.hanacloud.ondemand.com:443";
    answers.hanaUser = "DBADMIN";
    answers.hanaPassword = "";
    answers.schemaAuth = true;
    answers.hana = true;
    answers.hanaNative = true;
    answers.hanaExternalHDI = false;
    answers.api = true;
    answers.apiLoB = ["SAP S/4HANA Cloud Sales Order (A2X)"];
    answers.GraphURL = "https://<region>.graph.sap/api";
    answers.GraphId = "v1";
    answers.GraphTokenURL = "https://<subdomain>.authentication.<region>.hana.ondemand.com";
    answers.GraphClientId = "";
    answers.GraphClientSecret = "";
    answers.SFAPIAccess = "";
    answers.AribaNetworkId = "AN02000000280";
    answers.APIKeyAriba = "";
    answers.AribaRealm = "consulting-T";
    answers.FGHost = "";
    answers.FGCNclientId = "";
    answers.FGCNsupplierId = "";
    answers.FGCNJobPostingSupplierDownload = "";
    answers.FGCNWorkerfromWorkOrderXMLDownload = "";
    answers.FGCNJobSeekerUpload = "";
    answers.FGCNWorkOrderAcceptUpload = "";
    answers.ConcurGeolocation = "https://us.api.concursolutions.com";
    answers.AICoreURL = "https://api.ai.<service>.<region>.<provider>.ml.hana.ondemand.com";
    answers.AICoreTokenURL = "https://ai.authentication.<region>.hana.ondemand.com";
    answers.AICoreResourceGroup = "<resourceGroupName>";
    answers.AICoreDeploymentId = "<deploymentId>";
    answers.AICoreModel = "<modelName>";
    answers.AICoreModelType = "image";
    answers.SACHost = "https://<tenant>.<region>.hcs.cloud.sap";
    answers.SACTokenURL = "https://<tenant>.authentication.<region>.hana.ondemand.com/oauth/token/alias/<alias>";
    answers.SACAudience = "https://<tenant>.authentication.<region>.hana.ondemand.com";
    answers.customURL = "";
    answers.customAuth = "";
    answers.customUser = "";
    answers.customPassword = "";
    answers.customTokenURL = "";
    answers.customClientId = "";
    answers.customClientSecret = "";
    answers.customNamespace = "";
    answers.customEntities = [];
    answers.APIKeyNASA = "DEMO_KEY";
    answers.APIKeyHubSandbox = "";
    answers.connectivity = false;
    answers.authentication = true;
    answers.authorization = true;
    answers.attributes = false;
    answers.GraphSameSubaccount = true;
    answers.app2app = false;
    answers.app2appType = "authorize";
    answers.app2appName = "";
    answers.app2appMethod = ["user"];
    answers.v2support = false;
    answers.ui = true;
    answers.html5repo = false;
    answers.managedAppRouter = true;
    answers.customDomain = "";
    answers.clusterDomain = "0000000.kyma.ondemand.com";
    answers.gateway = "kyma-gateway.kyma-system.svc.cluster.local";
    answers.multiTenant = false;
    answers.category = "SaaS Multitenant Apps";
    answers.routes = true;
    answers.toggles = false;
    answers.common = false;
    answers.externalSessionManagement = false;
    answers.srv2 = false;
    answers.srvjs = false;
    answers.em = false;
    answers.emNamespace = "company/technology/events";
    answers.emClientId = "";
    answers.cicd = false;
    answers.applicationLogging = false;
    answers.credStore = "";
    answers.haa = false;
    answers.haaHostname = "*";
    answers.haaPersonalizeJWT = false;
    answers.haaUseNamedUser = false;
    answers.graphql = false;
    answers.swagger = false;
    answers.buildDeploy = false;
    // prompts
    const answersProject = await this.prompt([
      {
        type: "input",
        name: "projectName",
        message: "What project name would you like?",
        validate: (s) => {
          if (/^[a-zA-Z][a-zA-Z0-9]*$/g.test(s)) {
            return true;
          }
          return "Please start with a letter and only use alphanumeric characters for the project name.";
        },
        default: answers.projectName
      },
      {
        type: "confirm",
        name: "newDir",
        message: "Would you like to create a new directory for this project?",
        default: answers.newDir
      },
      {
        type: "input",
        name: "displayName",
        message: "What is the display name of your app?",
        default: answers.displayName
      },
      {
        type: "input",
        name: "description",
        message: "What is the description of your app?",
        default: answers.description
      }
    ]);
    const answersRuntime = await this.prompt([
      {
        type: "list",
        name: "BTPRuntime",
        message: "Which runtime will you be deploying the project to?",
        choices: [{ name: "SAP BTP, Cloud Foundry runtime", value: "CF" }, { name: "SAP BTP, Kyma runtime", value: "Kyma" }],
        store: true,
        default: answers.BTPRuntime
      },
      {
        when: response => response.BTPRuntime === "Kyma",
        type: "input",
        name: "namespace",
        message: "What SAP BTP, Kyma runtime namespace will you be deploying to?",
        validate: (s) => {
          if (/^[a-z0-9-]*$/g.test(s) && s.length > 0 && s.substring(0, 1) !== '-' && s.substring(s.length - 1) !== '-') {
            return true;
          }
          return "Your SAP BTP, Kyma runtime namespace can only contain lowercase alphanumeric characters or -.";
        },
        store: true,
        default: answers.namespace
      },
      {
        when: response => response.BTPRuntime === "Kyma",
        type: "input",
        name: "dockerID",
        message: "What is your Docker ID?",
        validate: (s) => {
          if (/^[a-z0-9]*$/g.test(s) && s.length >= 4 && s.length <= 30) {
            return true;
          }
          return "Your Docker ID must be between 4 and 30 characters long and can only contain numbers and lowercase letters.";
        },
        store: true,
        default: answers.dockerID
      },
      {
        when: response => response.BTPRuntime === "Kyma",
        type: "input",
        name: "dockerRepositoryName",
        message: "What is your Docker repository name? Leave blank to create a separate repository for each microservice.",
        validate: (s) => {
          if ((/^[a-z0-9-_]*$/g.test(s) && s.length >= 2 && s.length <= 225) || s === "") {
            return true;
          }
          return "Your Docker repository name must be between 2 and 255 characters long and can only contain numbers, lowercase letters, hyphens (-), and underscores (_).";
        },
        default: answers.dockerRepositoryName
      },
      {
        when: response => response.BTPRuntime === "Kyma",
        type: "list",
        name: "dockerRepositoryVisibility",
        message: "What is your Docker repository visibility?",
        choices: [{ name: "Public (Appears in Docker Hub search results)", value: "public" }, { name: "Private (Only visible to you)", value: "private" }],
        store: true,
        default: answers.dockerRepositoryVisibility
      },
      {
        when: response => response.BTPRuntime === "Kyma" && response.dockerRepositoryVisibility === "private",
        type: "input",
        name: "dockerRegistrySecretName",
        message: "What is the name of your Docker Registry Secret? It will be created in the namespace if you specify your Docker Email Address and Docker Personal Access Token or Password.",
        store: true,
        default: answers.dockerRegistrySecretName
      },
      {
        when: response => response.BTPRuntime === "Kyma" && response.dockerRepositoryVisibility === "private",
        type: "input",
        name: "dockerServerURL",
        message: "What is your Docker Server URL?",
        store: true,
        default: answers.dockerServerURL
      },
      {
        when: response => response.BTPRuntime === "Kyma" && response.dockerRepositoryVisibility === "private",
        type: "input",
        name: "dockerEmailAddress",
        message: "What is your Docker Email Address? Leave blank if your Docker Registry Secret already exists in the namespace.",
        default: answers.dockerEmailAddress
      },
      {
        when: response => response.BTPRuntime === "Kyma" && response.dockerRepositoryVisibility === "private",
        type: "password",
        name: "dockerPassword",
        message: "What is your Docker Personal Access Token or Password? Leave blank if your Docker Registry Secret already exists in the namespace.",
        mask: "*",
        default: answers.dockerPassword
      },
      {
        when: response => response.BTPRuntime === "Kyma",
        type: "input",
        name: "kubeconfig",
        message: "What is the path of your Kubeconfig file? Leave blank to use the KUBECONFIG environment variable instead.",
        default: answers.kubeconfig
      },
      {
        when: response => response.BTPRuntime === "Kyma",
        type: "list",
        name: "buildCmd",
        message: "How would you like to build container images?",
        choices: [{ name: "Paketo (Cloud Native Buildpacks)", value: "pack" }, { name: "Docker", value: "docker" }, { name: "Podman", value: "podman" }],
        store: true,
        default: answers.buildCmd
      }
    ]);
    const answersHANA = await this.prompt([
      {
        type: "input",
        name: "hanaTargetHDI",
        message: "Will you be using an existing SAP HANA Cloud HDI Container? If so please enter the HDI Container service instance name here or leave blank for none.",
        default: answers.hanaTargetHDI
      },
      {
        when: response => response.hanaTargetHDI === "",
        type: "input",
        name: "schemaName",
        message: "Will you be using an existing SAP HANA Cloud schema? If so please enter the schema name here or leave blank for none. Note: schema names in mixed case are case sensitive!",
        default: answers.schemaName
      },
      {
        when: response => response.hanaTargetHDI === "" && response.schemaName !== "",
        type: "input",
        name: "hanaEndpoint",
        message: "What is your SAP HANA Cloud SQL endpoint?",
        default: answers.hanaEndpoint
      },
      {
        when: response => response.hanaTargetHDI === "" && response.schemaName !== "",
        type: "input",
        name: "hanaUser",
        message: "What is your SAP HANA Cloud user name?",
        default: answers.hanaUser
      },
      {
        when: response => response.hanaTargetHDI === "" && response.schemaName !== "",
        type: "password",
        name: "hanaPassword",
        message: "What is the password for your SAP HANA Cloud user?",
        mask: "*",
        default: answers.hanaPassword
      },
      {
        when: response => response.hanaTargetHDI === "" && response.schemaName !== "",
        type: "confirm",
        name: "schemaAuth",
        message: "Would you like to create the SAP HANA Cloud technical user and grant authorizations?",
        default: answers.schemaAuth
      },
      {
        type: "confirm",
        name: "hana",
        message: "Would you like to create an entity with SAP HANA Cloud persistence?",
        default: answers.hana
      },
      {
        when: response => response.hana === true,
        type: "confirm",
        name: "hanaNative",
        message: "Would you like to use native SAP HANA Cloud artifacts?",
        default: answers.hanaNative
      },
      {
        when: response => response.hana === true,
        type: "confirm",
        name: "hanaExternalHDI",
        message: "Would you like to enable external access to the HDI Container?",
        default: answers.hanaExternalHDI
      }
    ]);
    const answersAPI = await this.prompt([
      {
        type: "confirm",
        name: "api",
        message: "Would you like to use an external API?",
        default: answers.api
      },
      {
        when: response => response.api === true,
        type: "checkbox",
        name: "apiLoB",
        message: "Which external API(s) would you like to use?",
        choices: ["SAP S/4HANA Cloud Sales Order (A2X)", "SAP S/4HANA Cloud Business Partner (A2X)", "SAP SuccessFactors Recruiting", "SAP SuccessFactors Employee Central", "SAP Ariba Network Purchase Orders Buyer", "SAP Ariba Web Services", "SAP Fieldglass Connectors", "SAP Fieldglass Approvals", "SAP Concur", "SAP Graph", "SAP AI Core", "SAP Analytics Cloud Tenant API", "HERE Location Services", "NASA Near Earth Object Web Service", "Northwind", "Custom OData"],
        default: answers.apiLoB
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP Graph"),
        type: "input",
        name: "GraphURL",
        message: "What is your SAP Graph URL?",
        default: answers.GraphURL
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP Graph"),
        type: "input",
        name: "GraphId",
        message: "What is your SAP Graph Business Data Graph Identifier?",
        default: answers.GraphId
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP Graph"),
        type: "input",
        name: "GraphTokenURL",
        message: "What is your SAP Graph Token URL?",
        default: answers.GraphTokenURL
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP Graph"),
        type: "input",
        name: "GraphClientId",
        message: "What is your SAP Graph Client Id?",
        default: answers.GraphClientId
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP Graph"),
        type: "password",
        name: "GraphClientSecret",
        message: "What is your SAP Graph Client Secret?",
        mask: "*",
        default: answers.GraphClientSecret
      },
      {
        when: response => response.api === true && (response.apiLoB.includes("SAP SuccessFactors Recruiting") || response.apiLoB.includes("SAP SuccessFactors Employee Central")),
        type: "input",
        name: "SFAPIAccess",
        message: "What is the name of your SAP SuccessFactors Extensibility service instance (api-access plan)? Leave blank for the SAP API Business Hub sandbox.",
        default: answers.SFAPIAccess
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP Ariba Network Purchase Orders Buyer"),
        type: "input",
        name: "AribaNetworkId",
        message: "What is the buyer's SAP Ariba Network Id (ANID)?",
        default: answers.AribaNetworkId
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP Ariba Network Purchase Orders Buyer"),
        type: "password",
        name: "APIKeyAriba",
        message: "What is your application-specific SAP Ariba API Key?",
        mask: "*",
        default: answers.APIKeyAriba
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP Ariba Web Services"),
        type: "input",
        name: "AribaRealm",
        message: "What is your SAP Ariba Realm?",
        default: answers.AribaRealm
      },
      {
        when: response => response.api === true && (response.apiLoB.includes("SAP Fieldglass Connectors") || response.apiLoB.includes("SAP Fieldglass Approvals")),
        type: "input",
        name: "FGHost",
        message: "What is the host name of your SAP Fieldglass system?",
        default: answers.FGHost
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP Fieldglass Connectors"),
        type: "input",
        name: "FGCNclientId",
        message: "What is your SAP Fieldglass Buyer Company Code?",
        default: answers.FGCNclientId
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP Fieldglass Connectors"),
        type: "input",
        name: "FGCNsupplierId",
        message: "What is your SAP Fieldglass Supplier Company Code?",
        default: answers.FGCNsupplierId
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP Fieldglass Connectors"),
        type: "input",
        name: "FGCNJobPostingSupplierDownload",
        message: "What is your SAP Fieldglass Given Connector Name for Job Posting Supplier Download?",
        default: answers.FGCNJobPostingSupplierDownload
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP Fieldglass Connectors"),
        type: "input",
        name: "FGCNWorkerfromWorkOrderXMLDownload",
        message: "What is your SAP Fieldglass Given Connector Name for Worker from Work Order XML Download?",
        default: answers.FGCNWorkerfromWorkOrderXMLDownload
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP Fieldglass Connectors"),
        type: "input",
        name: "FGCNJobSeekerUpload",
        message: "What is your SAP Fieldglass Given Connector Name for Job Seeker Upload?",
        default: answers.FGCNJobSeekerUpload
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP Fieldglass Connectors"),
        type: "input",
        name: "FGCNWorkOrderAcceptUpload",
        message: "What is your SAP Fieldglass Given Connector Name for Work Order Accept Upload?",
        default: answers.FGCNWorkOrderAcceptUpload
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP Concur"),
        type: "input",
        name: "ConcurGeolocation",
        message: "What is your SAP Concur geolocation?",
        default: answers.ConcurGeolocation
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP AI Core"),
        type: "input",
        name: "AICoreURL",
        message: "What is your SAP AI Core URL?",
        default: answers.AICoreURL
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP AI Core"),
        type: "input",
        name: "AICoreTokenURL",
        message: "What is your SAP AI Core Token URL?",
        default: answers.AICoreTokenURL
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP AI Core"),
        type: "input",
        name: "AICoreResourceGroup",
        message: "What is your SAP AI Core Resource Group name?",
        default: answers.AICoreResourceGroup

      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP AI Core"),
        type: "input",
        name: "AICoreDeploymentId",
        message: "What is your SAP AI Core Deployment ID?",
        default: answers.AICoreDeploymentId
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP AI Core"),
        type: "input",
        name: "AICoreModel",
        message: "What is your SAP AI Core Model name?",
        default: answers.AICoreModel
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP AI Core"),
        type: "list",
        name: "AICoreModelType",
        message: "What is your SAP AI Core Model type?",
        choices: [{ name: "Image", value: "image" }, { name: "Sound", value: "sound" }],
        default: answers.AICoreModelType
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP Analytics Cloud Tenant API"),
        type: "input",
        name: "SACHost",
        message: "What is your SAP Analytics Cloud Host?",
        default: answers.SACHost
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP Analytics Cloud Tenant API"),
        type: "input",
        name: "SACTokenURL",
        message: "What is your SAP Analytics Cloud OAuth2SAML Token URL?",
        default: answers.SACTokenURL
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP Analytics Cloud Tenant API"),
        type: "input",
        name: "SACAudience",
        message: "What is your SAP Analytics Cloud OAuth2SAML Audience?",
        default: answers.SACAudience
      },
      {
        when: response => response.api === true && response.apiLoB.includes("HERE Location Services"),
        type: "password",
        name: "APIKeyHERE",
        message: "What is your HERE Location Services API Key?",
        mask: "*",
        default: answers.APIKeyHERE
      },
      {
        when: response => response.api === true && response.apiLoB.includes("NASA Near Earth Object Web Service"),
        type: "password",
        name: "APIKeyNASA",
        message: "What is your NASA API Key? Leave blank to use a public demo key.",
        mask: "*",
        default: answers.APIKeyNASA
      },
      {
        when: response => response.api === true && (response.apiLoB.includes("SAP S/4HANA Cloud Sales Order (A2X)") || response.apiLoB.includes("SAP S/4HANA Cloud Business Partner (A2X)") || response.apiLoB.includes("SAP SuccessFactors Recruiting") || response.apiLoB.includes("SAP SuccessFactors Employee Central") || response.apiLoB.includes("SAP Ariba Network Purchase Orders Buyer") || response.apiLoB.includes("SAP Fieldglass Approvals")),
        type: "password",
        name: "APIKeyHubSandbox",
        message: "What is your API Key for the SAP API Business Hub sandbox?",
        mask: "*",
        default: answers.APIKeyHubSandbox
      },
      {
        when: response => response.api === true && response.apiLoB.includes("Custom OData"),
        type: "input",
        name: "customURL",
        message: "What is your Custom OData API endpoint?",
        default: answers.customURL
      },
      {
        when: response => response.api === true && response.apiLoB.includes("Custom OData"),
        type: "list",
        name: "customAuth",
        message: "What authentication does your Custom OData API require?",
        choices: [{ name: "None", value: "" }, { name: "Basic Authentication", value: "basic" }, { name: "OAuth2 SAML Client Credentials", value: "oauth2cc" }],
        default: answers.customAuth
      },
      {
        when: response => response.api === true && response.apiLoB.includes("Custom OData") && response.customAuth === "basic",
        type: "input",
        name: "customUser",
        message: "What is your Custom OData API user?",
        default: answers.customUser
      },
      {
        when: response => response.api === true && response.apiLoB.includes("Custom OData") && response.customAuth === "basic",
        type: "password",
        name: "customPassword",
        message: "What is your Custom OData API password?",
        mask: "*",
        default: answers.customPassword
      },
      {
        when: response => response.api === true && response.apiLoB.includes("Custom OData") && response.customAuth === "oauth2cc",
        type: "input",
        name: "customTokenURL",
        message: "What is your Custom OData API Token URL?",
        default: answers.customTokenURL
      },
      {
        when: response => response.api === true && response.apiLoB.includes("Custom OData") && response.customAuth === "oauth2cc",
        type: "input",
        name: "customClientId",
        message: "What is your Custom OData API Client Id?",
        default: answers.customClientId
      },
      {
        when: response => response.api === true && response.apiLoB.includes("Custom OData") && response.customAuth === "oauth2cc",
        type: "password",
        name: "customClientSecret",
        message: "What is your Custom OData API Client Secret?",
        mask: "*",
        default: answers.customClientSecret
      }
    ]);
    if (answersAPI.api === true && answersAPI.apiLoB.includes("Custom OData")) {
      try {
        let custom = await customUtils.customGet(this, answersAPI);
        answersAPI.customEDMX = custom.EDMX;
        answersAPI.customNamespace = custom.namespace;
        answersAPI.customEntities = custom.entities;
      } catch (error) {
        this.log("Custom OData API EDMX:", error);
      }
    }
    const answersCustomODataAPI = await this.prompt([
      {
        when: answersAPI.api === true && answersAPI.apiLoB.includes("Custom OData"),
        type: "checkbox",
        name: "customEntities",
        message: "Which Custom OData API entities would you like from the namespace " + answersAPI.customNamespace + "?",
        choices: answersAPI.customEntities,
        default: answersAPI.customEntities
      }
    ]);
    const answersAdditional = await this.prompt([
      {
        when: answersAPI.api === true && answersRuntime.BTPRuntime !== "Kyma",
        type: "confirm",
        name: "connectivity",
        message: "Will you be accessing on-premise systems via the Cloud Connector?",
        default: answers.connectivity
      },
      {
        type: "confirm",
        name: "authentication",
        message: "Would you like authentication?",
        default: answers.authentication
      },
      {
        when: response => response.authentication === true,
        type: "confirm",
        name: "authorization",
        message: "Would you like authorization?",
        default: answers.authorization
      },
      {
        when: response => answersHANA.hana === true && response.authentication === true && response.authorization === true,
        type: "confirm",
        name: "attributes",
        message: "Would you like to use role attributes?",
        default: answers.attributes
      },
      {
        when: response => response.authentication === true && answersAPI.api === true && answersAPI.apiLoB.includes("SAP Graph"),
        type: "confirm",
        name: "GraphSameSubaccount",
        message: "Will you be deploying to the subaccount of the SAP Graph service instance?",
        default: answers.GraphSameSubaccount
      },
      {
        when: response => response.authentication === true && response.authorization === true,
        type: "confirm",
        name: "app2app",
        message: "Would you like to configure an App2App authorization scenario?",
        default: answers.app2app
      },
      {
        when: response => response.authentication === true && response.authorization === true && response.app2app === true,
        type: "list",
        name: "app2appType",
        message: "Which App2App authorization scenario would you like to configure?",
        choices: [{ name: "Authorize another app to use this app", value: "authorize" }, { name: "Access another app from this app", value: "access" }],
        default: answers.app2appType
      },
      {
        when: response => response.authentication === true && response.authorization === true && response.app2app === true,
        type: "input",
        name: "app2appName",
        message: "What is the name of the other app (deployed to same BTP subaccount)?",
        default: answers.app2appName
      },
      {
        when: response => response.authentication === true && response.authorization === true && response.app2app === true,
        type: "checkbox",
        name: "app2appMethod",
        message: "What type of App2App authentication would you like?",
        choices: [{ name: "Principal Propagation of Business User", value: "user", checked: true }, { name: "Technical Communication", value: "machine" }],
        default: answers.app2appMethod
      },
      {
        type: "confirm",
        name: "v2support",
        message: "Would you like to enable OData v2 support?",
        default: answers.v2support
      },
      {
        type: "confirm",
        name: "ui",
        message: "Would you like a UI?",
        default: answers.ui
      },
      {
        when: response => response.ui === true,
        type: "confirm",
        name: "html5repo",
        message: "Would you like to use the HTML5 Application Repository?",
        default: answers.html5repo
      },
      {
        when: response => response.html5repo === true,
        type: "confirm",
        name: "managedAppRouter",
        message: "Would you like to use the managed application router?",
        default: answers.managedAppRouter
      },
      {
        type: "input",
        name: "customDomain",
        message: "Will you be using a wildcard custom domain (eg: apps.domain.com)? If so please enter the custom domain name here. Leave blank to use the platform default.",
        validate: (s) => {
          if (s === "") {
            return true;
          }
          if (/^[a-zA-Z0-9.-]*$/g.test(s)) {
            return true;
          }
          return "Please only use alphanumeric characters for the custom domain.";
        },
        default: answers.customDomain
      }
    ]);
    if (answersRuntime.BTPRuntime === "Kyma" && answersAdditional.customDomain === "") {
      let cmd = ["get", "cm", "shoot-info", "-n", "kube-system", "-o", "jsonpath='{.data.domain}'"];
      if (answersRuntime.kubeconfig !== "") {
        cmd.push("--kubeconfig", answersRuntime.kubeconfig);
      }
      let opt = { "stdio": [process.stdout] };
      try {
        let resGet = this.spawnCommandSync("kubectl", cmd, opt);
        if (resGet.exitCode === 0) {
          answers.clusterDomain = resGet.stdout.toString().replace(/'/g, '');
        }
      } catch (error) {
        this.log("kubectl error:", error);
      }
    } else {
      answers.clusterDomain = answersAdditional.customDomain;
    }
    const answersDomain = await this.prompt([
      {
        when: answersRuntime.BTPRuntime === "Kyma" && answersAdditional.customDomain === "",
        type: "input",
        name: "clusterDomain",
        message: "What is the cluster domain of your SAP BTP, Kyma runtime?",
        default: answers.clusterDomain
      },
      {
        when: answersRuntime.BTPRuntime === "Kyma" && answersAdditional.customDomain !== "",
        type: "input",
        name: "gateway",
        message: "What is the gateway for the custom domain in your SAP BTP, Kyma runtime?",
        default: answers.gateway
      }
    ]);
    const answersMTX = await this.prompt([
      {
        when: answersHANA.hana === true && answersHANA.schemaName === "" && answersHANA.hanaTargetHDI === "" && answersAdditional.ui === true && answersAdditional.html5repo === false,
        type: "confirm",
        name: "multiTenant",
        message: "Would you like to create a SaaS multitenant app?",
        default: answers.multiTenant
      },
      {
        when: response => response.multiTenant === true,
        type: "input",
        name: "category",
        message: "What is the category of your app?",
        default: answers.category
      },
      {
        when: response => response.multiTenant === true && answersAdditional.customDomain === "",
        type: "confirm",
        name: "routes",
        message: "Would you like to include creation/deletion of tenant routes (CF) or API Rules (Kyma) / on subscribe/unsubscribe?",
        default: answers.routes
      },
      /*
      {
        when: response => response.multiTenant === true,
        type: "confirm",
        name: "toggles",
        message: "Would you like to enable feature toggles?",
        default: answers.toggles
      },
      */
      {
        when: response => response.multiTenant === true,
        type: "confirm",
        name: "common",
        message: "Would you like to include common SAP HANA Cloud persistence?",
        default: answers.common
      }
    ]);
    const answersFurther = await this.prompt([
      {
        when: response => (answersAdditional.ui === true || answersMTX.multiTenant === true) && answersRuntime.BTPRuntime === "Kyma",
        type: "confirm",
        name: "externalSessionManagement",
        message: "Would you like to configure external session management (using Redis)?",
        default: answers.externalSessionManagement
      },
      {
        type: "confirm",
        name: "srv2",
        message: "Would you like to include an additional backend service using SAP Cloud Application Programming Model?",
        default: answers.srv2
      },
      {
        type: "confirm",
        name: "srvjs",
        message: "Would you like to include an additional backend service using regular Node.js?",
        default: answers.srvjs
      },
      {
        type: "confirm",
        name: "em",
        message: "Would you like to enable messaging with SAP Event Mesh?",
        default: answers.em
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
        default: answers.emNamespace
      },
      {
        when: response => response.em === true && (answersAPI.apiLoB.includes("SAP S/4HANA Cloud Sales Order (A2X)") || answersAPI.apiLoB.includes("SAP S/4HANA Cloud Business Partner (A2X)")),
        type: "input",
        name: "emClientId",
        message: "What is the emClientId of your SAP S/4HANA Cloud Extensibility messaging service instance?",
        validate: (s) => {
          if (s.length >= 1 && s.length <= 4 && /^[a-zA-Z0-9]*$/g.test(s)) {
            return true;
          }
          return "Please use between 1 and 4 alphanumeric characters for the emClientID.";
        },
        default: answers.emClientId
      },
      {
        type: "confirm",
        name: "cicd",
        message: "Would you like to enable Continuous Integration and Delivery (CI/CD)?",
        default: answers.cicd
      },
      {
        when: answersRuntime.BTPRuntime !== "Kyma",
        type: "confirm",
        name: "applicationLogging",
        message: "Would you like to enable Application Logging?",
        default: answers.applicationLogging
      },
      {
        when: answersRuntime.BTPRuntime !== "Kyma" && answersAPI.api === true,
        type: "input",
        name: "credStore",
        message: "What is the name of your SAP Credential Store service instance? Leave blank for none.",
        validate: (s) => {
          if (/^[a-zA-Z0-9_-]*$/g.test(s)) {
            return true;
          }
          return "Please only use alphanumeric characters for the SAP Credential Store service instance name.";
        },
        default: answers.credStore
      },
      {
        when: answersRuntime.BTPRuntime !== "Kyma" && answersHANA.hana === true && answersHANA.hanaNative === true && answersAdditional.authentication === true,
        type: "confirm",
        name: "haa",
        message: "Would you like to include the SAP HANA Analytics Adapter (HAA)?",
        default: answers.haa
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
        default: answers.haaHostname
      },
      {
        when: response => response.haa === true,
        type: "confirm",
        name: "haaPersonalizeJWT",
        message: "Would you like HAA to propagate the application user to SAP HANA Cloud?",
        default: answers.haaPersonalizeJWT
      },
      {
        when: response => response.haa === true,
        type: "confirm",
        name: "haaUseNamedUser",
        message: "Would you like HAA to connect to SAP HANA Cloud via JWT-based SSO (this implies shadow users in SAP HANA Cloud)?",
        default: answers.haaUseNamedUser
      },
      {
        type: "confirm",
        name: "graphql",
        message: "Would you like to enable GraphQL?",
        default: answers.graphql
      },
      {
        type: "confirm",
        name: "swagger",
        message: "Would you like to enable a Swagger UI?",
        default: answers.swagger
      },
      {
        type: "confirm",
        name: "buildDeploy",
        message: "Would you like to build and deploy the project immediately?",
        default: answers.buildDeploy
      }
    ]);
    if (answersProject.newDir) {
      this.destinationRoot(`${answersProject.projectName}`);
    }
    if (answersAdditional.html5repo === true) {
      answersFurther.srvPath = "";
      answersFurther.multiTenant = false;
      answersFurther.haa = false;
    } else {
      answersFurther.srvPath = "/";
      answersAdditional.managedAppRouter = false;
    }
    if (answersAdditional.managedAppRouter === true) {
      answersFurther.externalSessionManagement = false;
    }
    if (answersHANA.hana === false) {
      answersFurther.hanaNative = false;
    }
    if (typeof answersMTX.multiTenant === 'undefined' || answersMTX.multiTenant === false) {
      answersMTX.routes = false;
    }
    if (answersAdditional.authentication === false) {
      answersAdditional.authorization = false;
    }
    if (answersAPI.api === true) {
      answersFurther.apiS4HCSO = answersAPI.apiLoB.includes("SAP S/4HANA Cloud Sales Order (A2X)");
      answersFurther.apiS4HCBP = answersAPI.apiLoB.includes("SAP S/4HANA Cloud Business Partner (A2X)");
      answersFurther.apiSFSFRC = answersAPI.apiLoB.includes("SAP SuccessFactors Recruiting");
      answersFurther.apiSFSFEC = answersAPI.apiLoB.includes("SAP SuccessFactors Employee Central");
      answersFurther.apiARIBPO = answersAPI.apiLoB.includes("SAP Ariba Network Purchase Orders Buyer");
      answersFurther.apiARIBWS = answersAPI.apiLoB.includes("SAP Ariba Web Services");
      answersFurther.apiFGCN = answersAPI.apiLoB.includes("SAP Fieldglass Connectors");
      answersFurther.apiFGAP = answersAPI.apiLoB.includes("SAP Fieldglass Approvals");
      answersFurther.apiCONC = answersAPI.apiLoB.includes("SAP Concur");
      answersFurther.apiGRAPH = answersAPI.apiLoB.includes("SAP Graph");
      answersFurther.apiAICORE = answersAPI.apiLoB.includes("SAP AI Core");
      answersFurther.apiSACTenant = answersAPI.apiLoB.includes("SAP Analytics Cloud Tenant API");
      answersFurther.apiHERE = answersAPI.apiLoB.includes("HERE Location Services");
      answersFurther.apiNeoWs = answersAPI.apiLoB.includes("NASA Near Earth Object Web Service");
      answersFurther.apiNW = answersAPI.apiLoB.includes("Northwind");
      answersFurther.apiCustom = answersAPI.apiLoB.includes("Custom OData");
    } else {
      answersFurther.apiS4HCSO = false;
      answersFurther.apiS4HCBP = false;
      answersFurther.apiSFSFRC = false;
      answersFurther.apiSFSFEC = false;
      answersFurther.apiARIBPO = false;
      answersFurther.apiARIBWS = false;
      answersFurther.apiFGCN = false;
      answersFurther.apiFGAP = false;
      answersFurther.apiCONC = false;
      answersFurther.apiGRAPH = false;
      answersFurther.apiAICORE = false;
      answersFurther.apiSACTenant = false;
      answersFurther.apiHERE = false;
      answersFurther.apiNeoWs = false;
      answersFurther.apiNW = false;
      answersFurther.apiCustom = false;
    }
    if (answers.app2app === false) {
      answers.app2appType = "";
    }
    answersFurther.destinationPath = this.destinationPath();
    this.config.set(answers);
    this.config.set(answersProject);
    this.config.set(answersRuntime);
    this.config.set(answersHANA);
    this.config.set(answersAPI);
    this.config.set(answersCustomODataAPI);
    this.config.set(answersAdditional);
    this.config.set(answersDomain);
    this.config.set(answersMTX);
    this.config.set(answersFurther);
  }

  async writing() {
    var answers = this.config;

    if (answers.get('hanaTargetHDI') !== "") {
      await hanaUtils.hanaTargetHDI2Schema(this, answers);
    }

    let graphDataSources = [];
    if (answers.get('apiGRAPH')) {
      graphDataSources = await graphUtils.getGraphDataSources(this, answers);
      if (!graphDataSources) {
        this.env.error("Unable to obtain SAP Graph Data Sources.");
      }
    }
    answers.set('graphDataSources', graphDataSources);

    if (answers.get('apiCustom')) {
      await customUtils.customWrite(this, answers);
    }

    if (this.config.get('BTPRuntime') === "CF" && (answers.get('cicd') === true || answers.get('app2appType') === "access")) {
      answers.set('cforg', 'org');
      answers.set('cfspace', 'space');
      answers.set('cfapi', 'https://api.cf.<region>.hana.ondemand.com');
      answers.set('cfregion', '<region>');
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
            answers.set('cfregion', keyvalue[2].split('.')[2]);
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
            if (!((file.substring(0, 5) === 'helm/' || file.includes('/Dockerfile') || file === 'dotdockerignore' || file === 'Makefile') && answers.get('BTPRuntime') !== 'Kyma')) {
              if (!(file.includes('/Dockerfile') && answers.get('buildCmd') === 'pack')) {
                if (!((file.includes('helm/_PROJECT_NAME_-app') || file.substring(0, 14) === 'app/Dockerfile') && (answers.get('managedAppRouter') === true || (answers.get('authentication') === false && answers.get('ui') === false)))) {
                  if (!(file.includes('helm/_PROJECT_NAME_-app/templates/apirule.yaml') && answers.get('multiTenant') === true)) {
                    if (!(file.includes('helm/_PROJECT_NAME_-db/') && ((answers.get('hana') === false && answers.get('schemaName') === '' && answers.get('hanaTargetHDI') === '') || answers.get('multiTenant') === true))) {
                      if (!((file.includes('service-hdi.yaml') || file.includes('binding-hdi.yaml')) && ((answers.get('hana') === false && answers.get('schemaName') === '' && answers.get('hanaTargetHDI') === '') || answers.get('multiTenant') === true))) {
                        if (!((file.includes('-registry.yaml') || file.includes('-sm.yaml')) && answers.get('multiTenant') === false)) {
                          if (!(file.includes('role.yaml') && answers.get('routes') === false)) {
                            if (!((file.includes('helm/_PROJECT_NAME_-dbcommon') || file.includes('-hdicommon.yaml')) && answers.get('common') === false)) {
                              if (!(file.includes('helm/_PROJECT_NAME_-srv2') && answers.get('srv2') === false)) {
                                if (!(file.includes('helm/_PROJECT_NAME_-srvjs') && answers.get('srvjs') === false)) {
                                  if (!(file.includes('-logging.yaml') && answers.get('applicationLogging') === false)) {
                                    if (!((file.substring(0, 6) === 'html5/' || file.includes('helm/_PROJECT_NAME_-html5')) && answers.get('html5repo') === false)) {
                                      if (!(file.substring(0, 6) === 'html5/' && answers.get('BTPRuntime') !== 'Kyma')) {
                                        if (!((file.substring(0, 35) === 'app/resources/html5/ui5-deploy.yaml' || file.substring(0, 32) === 'app/resources/html5/package.json') && answers.get('BTPRuntime') === 'Kyma')) {
                                          if (!((file.substring(0, 35) === 'app/resources/fiori/ui5-deploy.yaml' || file.substring(0, 32) === 'app/resources/fiori/package.json') && answers.get('BTPRuntime') === 'Kyma')) {
                                            if (!((file.includes('service-uaa.yaml') || file.includes('binding-uaa.yaml')) && answers.get('authentication') === false && answers.get('api') === false && answers.get('html5repo') === false)) {
                                              if (!((file.includes('service-dest.yaml') || file.includes('binding-dest.yaml')) && answers.get('api') === false && answers.get('html5repo') === false && answers.get('app2appType') !== 'access')) {
                                                if (!((file.includes('-redis.yaml') || file.includes('destinationrule.yaml')) && answers.get('externalSessionManagement') === false)) {
                                                  if (!((file === 'mta.yaml' || file === 'xs-security.json') && answers.get('BTPRuntime') !== 'CF')) {
                                                    if (!(file === 'xs-security.json' && answers.get('authentication') === false && answers.get('api') === false && answers.get('html5repo') === false)) {
                                                      if (!(file.includes('-em.yaml') && answers.get('em') === false)) {
                                                        if (!(file === 'em.json' && (answers.get('em') === false || answers.get('BTPRuntime') === 'Kyma'))) {
                                                          if (!((file === 'Jenkinsfile' || file.substring(0, 9) === '.pipeline' || file.includes('-cicd.')) && answers.get('cicd') === false)) {
                                                            if (!((file.includes('sa-cicd.') || file.includes('docker-cicd.')) && answers.get('BTPRuntime') !== 'Kyma')) {
                                                              if (!(file.substring(0, 3) === 'haa' && answers.get('haa') === false)) {
                                                                if (!(file.substring(0, 19) === 'srv/catalog-service' && answers.get('hana') === false && answers.get('api') === false && answers.get('app2app') === false)) {
                                                                  if (!(file === 'srv/lib/credStore.js' && answers.get('credStore') === '')) {
                                                                    if (!(file === 'srv/lib/utils.js' && (answers.get('apiARIBWS') === false && answers.get('apiCONC') === false))) {
                                                                      if (!(file === 'app/custom.js' && answers.get('multiTenant') === false)) {
                                                                        if (!(file.substring(0, 3) === 'fts' && answers.get('toggles') === false)) {
                                                                          if (!(file.substring(0, 8) === 'dbcommon' && answers.get('common') === false)) {
                                                                            if (!(file.substring(0, 4) === 'srv2' && answers.get('srv2') === false)) {
                                                                              if (!(file.substring(0, 5) === 'srvjs' && answers.get('srvjs') === false)) {
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
                                                                                                      if (!((file.substring(0, 16) === 'srv/external/SAC') && answers.get('apiSACTenant') === false)) {
                                                                                                        if (!((file.substring(0, 33) === 'srv/external/HERELocationServices') && answers.get('apiHERE') === false)) {
                                                                                                          if (!((file.substring(0, 38) === 'srv/external/NearEarthObjectWebService') && answers.get('apiNeoWs') === false)) {
                                                                                                            if (!((file.substring(0, 15) === 'app/xs-app.json' || file.substring(0, 16) === 'app/package.json') && (answers.get('managedAppRouter') === true || (answers.get('authentication') === false && answers.get('ui') === false)))) {
                                                                                                              if (!((file.substring(0, 13) === 'app/resources' || file.includes('i18n') || file.includes('app/index.cds')) && answers.get('ui') === false)) {
                                                                                                                if (!((file.substring(0, 19) === 'app/resources/fiori' || file.includes('i18n') || file.includes('app/index.cds')) && answers.get('hana') === false)) {
                                                                                                                  if (!(file.includes('MediaSection.fragment.xml') && answers.get('apiAICORE') === false)) {
                                                                                                                    if (!((file.substring(0, 24) === 'app/resources/index.html') && answers.get('html5repo') === true)) {
                                                                                                                      if (!((file.substring(0, 31) === 'app/resources/fiori/xs-app.json' || file.substring(0, 32) === 'app/resources/fiori/package.json' || file.substring(0, 35) === 'app/resources/fiori/ui5-deploy.yaml') && answers.get('html5repo') === false)) {
                                                                                                                        if (!((file.substring(0, 31) === 'app/resources/html5/xs-app.json' || file.substring(0, 32) === 'app/resources/html5/package.json' || file.substring(0, 35) === 'app/resources/html5/ui5-deploy.yaml' || file.substring(0, 40) === 'app/resources/html5/webapp/manifest.json') && answers.get('html5repo') === false)) {
                                                                                                                          if (!(file.substring(0, 2) === 'db' && answers.get('hana') === false && answers.get('schemaName') === "" && answers.get('hanaTargetHDI') === "")) {
                                                                                                                            if (!(file.substring(0, 16) === 'db/undeploy.json' && !(answers.get('schemaName') === "" && answers.get('hanaTargetHDI') === ""))) {
                                                                                                                              if (!((file.substring(0, 17) === 'db/data-model.cds' || file.substring(0, 12) === 'db/data-test' || file.substring(0, 14) === 'db/data-config') && answers.get('hana') === false)) {
                                                                                                                                if (!(file.substring(0, 41) === 'db/data-test/data/_PROJECT_NAME_.db.Sales' && answers.get('hana') === false)) {
                                                                                                                                  if (!(file.substring(0, 45) === 'db/data-test/data/_PROJECT_NAME_.db.Anomalies' && answers.get('apiAICORE') === false)) {
                                                                                                                                    if (!(file.substring(0, 44) === 'db/data-test/data/_PROJECT_NAME_.db.Students' && (answers.get('hana') === false || answers.get('srv2') === false))) {
                                                                                                                                      if (!((file.substring(0, 39) === 'db/src/_PROJECT_NAME_DB_EXTERNAL_ACCESS') && answers.get('hanaExternalHDI') === false)) {
                                                                                                                                        if (!((file.substring(0, 48) === 'db/data-config/data/_PROJECT_NAME_.db.Conditions' || file.substring(0, 53) === 'db/data-test/data/_PROJECT_NAME_.db.CustomerProcesses' || file.substring(0, 44) === 'db/data-config/data/_PROJECT_NAME_.db.Status') && (answers.get('apiS4HCBP') === false || answers.get('em') === false))) {
                                                                                                                                          if (!(file.substring(0, 7) === 'db/src/' && answers.get('hanaNative') === false && answers.get('hanaExternalHDI') === false && answers.get('hanaTargetHDI') === "" && answers.get('schemaName') === "")) {
                                                                                                                                            if (!((file.substring(0, 10) === 'db/src/SP_' || file.substring(0, 10) === 'db/src/TT_' || file.substring(0, 10) === 'db/src/CV_' || file.substring(0, 10) === 'db/src/TF_' || file.substring(0, 10) === 'db/src/SYS') && answers.get('hanaNative') === false)) {
                                                                                                                                              const sOrigin = this.templatePath(file);
                                                                                                                                              let fileDest = file;
                                                                                                                                              if (fileDest.includes('_PROJECT_NAME_.db')) {
                                                                                                                                                let folder = 'db/data-test/data';
                                                                                                                                                if (fileDest.substring(0, 19) === 'db/data-config/data') folder = 'db/data-config/data';
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
                                                                                                                                                if (answers.get('BTPRuntime') === "Kyma" && !(file === 'app/index.cds' || file.includes('annotations.cds'))) {
                                                                                                                                                  fileDest = 'html5/resources/' + fileDest.substring(14);
                                                                                                                                                  if (fileDest.includes('/webapp')) {
                                                                                                                                                    fileDest = fileDest.substring(0, fileDest.indexOf('/webapp')) + fileDest.substring(fileDest.indexOf('/webapp') + 7);
                                                                                                                                                  }
                                                                                                                                                } else {
                                                                                                                                                  fileDest = 'app/' + fileDest.substring(14);
                                                                                                                                                }
                                                                                                                                              }
                                                                                                                                              if (fileDest === 'dotenv') {
                                                                                                                                                fileDest = '.env';
                                                                                                                                              }
                                                                                                                                              if (fileDest === 'dotgitignore') {
                                                                                                                                                fileDest = '.gitignore';
                                                                                                                                              }
                                                                                                                                              if (fileDest === 'dotdockerignore') {
                                                                                                                                                fileDest = '.dockerignore';
                                                                                                                                              }
                                                                                                                                              if (fileDest.includes('helm/_PROJECT_NAME_-')) {
                                                                                                                                                fileDest = fileDest.replace('_PROJECT_NAME_', answers.get('projectName'));
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

    if (answers.get('schemaName') !== "") {
      await hanaUtils.processSchema(this, answers);
      await hanaUtils.processSchemaAuth(this, answers);
    }

  }

  async install() {
    var answers = this.config;
    var opt = { "cwd": answers.get("destinationPath") };
    if (answers.get("apiGRAPH")) {
      await graphUtils.graphImport(this, answers);
    }
    if (answers.get("apiCustom")) {
      await customUtils.customImport(this, answers);
    }
    // install dev dependencies
    if ((answers.get("hana") && answers.get("ui")) || answers.get("api")) {
      this.spawnCommandSync("npm", ["install"], opt);
    }
    this.log("");
    this.log("You can test your project locally from the command line as follows:");
    this.log(" cd " + answers.get("projectName"));
    this.log(" cds watch");
    if (answers.get('BTPRuntime') === "Kyma") {
      const yaml = require('js-yaml');
      const fs2 = require('fs');
      let cmd;
      if (answers.get("dockerRepositoryVisibility") === "private" && !(answers.get("dockerEmailAddress") === "" && answers.get("dockerPassword") === "")) {
        cmd = ["create", "secret", "docker-registry", answers.get("dockerRegistrySecretName"), "--docker-server", answers.get("dockerServerURL"), "--docker-username", answers.get("dockerID"), "--docker-email", answers.get("dockerEmailAddress"), "--docker-password", answers.get("dockerPassword"), "-n", answers.get("namespace")];
        if (answers.get("kubeconfig") !== "") {
          cmd.push("--kubeconfig", answers.get("kubeconfig"));
        }
        this.spawnCommandSync("kubectl", cmd, opt);
      }
      if (answers.get("externalSessionManagement") === true) {
        // generate secret
        try {
          const k8s = require('@kubernetes/client-node');
          const kc = new k8s.KubeConfig();
          if (answers.get("kubeconfig") !== "") {
            kc.loadFromFile(answers.get('kubeconfig'));
          } else {
            kc.loadFromDefault();
          }
          let k8sApi = kc.makeApiClient(k8s.CoreV1Api);
          this.log('Creating the external session management secret...');
          let pwdgen = require('generate-password');
          let redisPassword = pwdgen.generate({
            length: 64,
            numbers: true
          });
          let sessionSecret = pwdgen.generate({
            length: 64,
            numbers: true
          });
          let k8sSecret = {
            apiVersion: 'v1',
            kind: 'Secret',
            metadata: {
              name: answers.get('projectName') + '-redis-binding-secret',
              labels: {
                'app.kubernetes.io/managed-by': answers.get('projectName') + '-app'
              }
            },
            type: 'Opaque',
            data: {
              EXT_SESSION_MGT: Buffer.from('{"instanceName":"' + answers.get("projectName") + '-redis", "storageType":"redis", "sessionSecret": "' + sessionSecret + '"}', 'utf-8').toString('base64'),
              REDIS_PASSWORD: Buffer.from('"' + redisPassword + '"', 'utf-8').toString('base64'),
              ".metadata": Buffer.from('{"credentialProperties":[{"name":"hostname","format":"text"},{"name":"port","format":"text"},{"name":"password","format":"text"},{"name":"cluster_mode","format":"text"},{"name":"tls","format":"text"}],"metaDataProperties":[{"name":"instance_name","format":"text"},{"name":"type","format":"text"},{"name":"label","format":"text"}]}', 'utf-8').toString('base64'),
              instance_name: Buffer.from(answers.get('projectName') + '-db-' + answers.get('schemaName'), 'utf-8').toString('base64'),
              type: Buffer.from("redis", 'utf-8').toString('base64'),
              name: Buffer.from(answers.get("projectName") + "-redis", 'utf-8').toString('base64'),
              instance_name: Buffer.from(answers.get("projectName") + "-redis", 'utf-8').toString('base64'),
              hostname: Buffer.from(answers.get("projectName") + "-redis", 'utf-8').toString('base64'),
              port: Buffer.from("6379", 'utf-8').toString('base64'),
              password: Buffer.from(redisPassword, 'utf-8').toString('base64'),
              cluster_mode: Buffer.from("false", 'utf-8').toString('base64'),
              tls: Buffer.from("false", 'utf-8').toString('base64')
            }
          };
          await k8sApi.createNamespacedSecret(
            answers.get('namespace'),
            k8sSecret
          ).catch(e => this.log("createNamespacedSecret:", e.response.body));
        } catch (error) {
          this.log("kubeconfig error:", error);
        }
      }
      if (answers.get("cicd") === true) {
        // generate service account & kubeconfig
        let fileDest = path.join(this.destinationRoot(), "sa-cicd.yaml");
        cmd = ["apply", "-f", fileDest, "-n", answers.get("namespace")];
        if (answers.get("kubeconfig") !== "") {
          cmd.push("--kubeconfig", answers.get("kubeconfig"));
        }
        let resApply = this.spawnCommandSync("kubectl", cmd, opt);
        if (resApply.exitCode === 0) {
          opt.stdio = [process.stdout];
          cmd = ["get", "secret/" + answers.get("projectName") + "-cicd", "-n", answers.get("namespace"), "-o", "jsonpath='{.data}'"];
          if (answers.get("kubeconfig") !== "") {
            cmd.push("--kubeconfig", answers.get("kubeconfig"));
          }
          let resSecretDetail = this.spawnCommandSync("kubectl", cmd, opt);
          let secretDetail = resSecretDetail.stdout.toString();
          secretDetail = JSON.parse(secretDetail.substring(1).substring(0, secretDetail.length - 2));
          let fileText = {
            "apiVersion": "v1",
            "kind": "Config",
            "clusters": [
              {
                "name": "cicd-cluster",
                "cluster": {
                  "certificate-authority-data": secretDetail["ca.crt"],
                  "server": "https://api." + answers.get("clusterDomain")
                }
              }
            ],
            "users": [
              {
                "name": "cicd-user",
                "user": {
                  "token": Buffer.from(secretDetail.token, "base64").toString("utf-8")
                }
              }
            ],
            "contexts": [
              {
                "name": "cicd-context",
                "context": {
                  "cluster": "cicd-cluster",
                  "namespace": answers.get("namespace"),
                  "user": "cicd-user"
                }
              }
            ],
            "current-context": "cicd-context"
          };
          fileDest = path.join(this.destinationRoot(), "sa-kubeconfig-cicd.yaml");
          fs2.writeFile(fileDest, yaml.dump(fileText), 'utf-8', function (err) {
            if (err) {
              this.log(err.message);
              return;
            }
          });
        }
      }
      if (answers.get("buildDeploy")) {
        let resPush = this.spawnCommandSync("make", ["docker-push"], opt);
        if (resPush.exitCode === 0) {
          this.spawnCommandSync("make", ["helm-deploy"], opt);
        }
      } else {
        this.log("");
        this.log("You can build and deploy your project as follows or use a CI/CD pipeline:");
        this.log(" cd " + answers.get("projectName"));
        this.log(" make docker-push");
        this.log(" make helm-deploy");
      }
    } else {
      // Cloud Foundry runtime
      var mta = "mta_archives/" + answers.get("projectName") + "_0.0.1.mtar";
      if (answers.get("buildDeploy")) {
        let resBuild = this.spawnCommandSync("mbt", ["build"], opt);
        if (resBuild.exitCode === 0) {
          this.spawnCommandSync("cf", ["deploy", mta], opt);
        }
      } else {
        this.log("");
        this.log("You can build and deploy your project as follows or use a CI/CD pipeline:");
        this.log(" cd " + answers.get("projectName"));
        this.log(" mbt build");
        this.log(" cf deploy " + mta);
      }
    }
    answers.delete('hanaEndpoint');
    answers.delete('hanaUser');
    answers.delete('hanaPassword');
    answers.delete('APIKeyHubSandbox');
    answers.delete('SFAPIAccess');
    answers.delete('AribaNetworkId');
    answers.delete('APIKeyAriba');
    answers.delete('AribaRealm');
    answers.delete('FGHost');
    answers.delete('FGCNclientId');
    answers.delete('FGCNsupplierId');
    answers.delete('ConcurGeolocation');
    answers.delete('GraphClientId');
    answers.delete('GraphClientSecret');
    answers.delete('AICoreResourceGroup');
    answers.delete('AICoreDeploymentId');
    answers.delete('customUser');
    answers.delete('customPassword');
    answers.delete('customClientId');
    answers.delete('customClientSecret');
    answers.delete('customEDMX');
    answers.delete('APIKeyHERE');
    answers.delete('APIKeyNASA');
    answers.delete('dockerEmailAddress');
    answers.delete('dockerPassword');
  }

  end() {
    if (this.config.get('authentication') && this.config.get('apiGRAPH') && this.config.get('GraphSameSubaccount') === false) {
      this.log("");
      this.log("Important: Trust needs to be configured when not deploying to the subaccount of the SAP Graph service instance!");
    }
    if (this.config.get('customDomain') !== "" && this.config.get('multiTenant') && this.config.get('BTPRuntime') === "CF") {
      this.log("");
      this.log("Important: The wildcard custom domain route needs be mapped via the following CF CLI command after deployment:");
      this.log("  cf map-route " + this.config.get('projectName') + "-app " + this.config.get('customDomain') + ' --hostname "*"');
    }
    if (this.config.get('routes') && this.config.get('multiTenant') && this.config.get('BTPRuntime') === "CF") {
      this.log("");
      this.log("Important: The CF API is being used so please be sure to update the destination " + this.config.get('projectName') + "-cfapi - Token Service URL (replace login with uaa) and set User & Password. Client Secret needs to be empty.");
    }
    if (this.config.get('multiTenant') && this.config.get('api')) {
      this.log("");
      this.log("Don't forget to configure the destination for each subscriber.");
    }
    if (this.config.get('haa')) {
      this.log("");
      this.log("Don't forget to add the SAP HANA Analytics Adapter WAR file (java-xsahaa.war) to the haa/target folder. You can download the SAP HANA Analytics Adapter from https://tools.hana.ondemand.com/#hanatools");
    }
    if (this.config.get('BTPRuntime') === "Kyma" && this.config.get("api")) {
      this.log("");
      this.log("Before deploying, consider setting values for API keys & credentials in helm/" + this.config.get("projectName") + "-srv/templates/service-dest.yaml or set directly using the destination service REST API immediately after deployment.");
    }
    if (this.config.get('BTPRuntime') === "Kyma" && this.config.get("em")) {
      this.log("");
      this.log("After deploying, the following label 'kyma-project.io/eventing-backend=beb' needs to be added to the generated secret '" + this.config.get("projectName") + "-em-binding-secret'. You can do this via the following command:");
      this.log("  kubectl label secret " + this.config.get("projectName") + '-em-binding-secret "kyma-project.io/eventing-backend=beb" -n ' + this.config.get("namespace"));
    }
    this.log("");
  }

}