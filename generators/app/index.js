"use strict";
const Generator = require("yeoman-generator");
const path = require("path");
const glob = require("glob");
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
        type: "list",
        name: "BTPRuntime",
        message: "Which runtime will you be deploying the project to?",
        choices: [{ name: "SAP BTP, Cloud Foundry runtime", value: "CF" }, { name: "SAP BTP, Kyma runtime", value: "Kyma" }],
        default: "CF"
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
        default: "default"
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
        default: ""
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
        default: ""
      },
      {
        when: response => response.BTPRuntime === "Kyma",
        type: "list",
        name: "dockerRepositoryVisibility",
        message: "What is your Docker repository visibility?",
        choices: [{ name: "Public (Appears in Docker Hub search results)", value: "public" }, { name: "Private (Only visible to you)", value: "private" }],
        default: "public"
      },
      {
        when: response => response.BTPRuntime === "Kyma" && response.dockerRepositoryVisibility === "private",
        type: "input",
        name: "dockerRegistrySecretName",
        message: "What is the name of your Docker Registry Secret? It will be created in the namespace if you specify your Docker Email Address and Docker Personal Access Token or Password.",
        default: "docker-registry-config"
      },
      {
        when: response => response.BTPRuntime === "Kyma" && response.dockerRepositoryVisibility === "private",
        type: "input",
        name: "dockerServerURL",
        message: "What is your Docker Server URL?",
        default: "https://index.docker.io/v1/"
      },
      {
        when: response => response.BTPRuntime === "Kyma" && response.dockerRepositoryVisibility === "private",
        type: "input",
        name: "dockerEmailAddress",
        message: "What is your Docker Email Address? Leave empty if your Docker Registry Secret already exists in the namespace.",
        default: ""
      },
      {
        when: response => response.BTPRuntime === "Kyma" && response.dockerRepositoryVisibility === "private",
        type: "password",
        name: "dockerPassword",
        message: "What is your Docker Personal Access Token or Password? Leave empty if your Docker Registry Secret already exists in the namespace.",
        mask: "*",
        default: ""
      },
      {
        when: response => response.BTPRuntime === "Kyma",
        type: "input",
        name: "kubeconfig",
        message: "What is the path of your Kubeconfig file? Leave blank to use the KUBECONFIG environment variable instead.",
        default: ""
      },
      {
        when: response => response.BTPRuntime === "Kyma",
        type: "list",
        name: "buildCmd",
        message: "How would you like to build container images?",
        choices: [{ name: "Paketo (Cloud Native Buildpacks)", value: "pack" }, { name: "Docker", value: "docker" }, { name: "Podman", value: "podman" }],
        default: "pack"
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
        name: "schemaAuth",
        message: "Would you like to create the SAP HANA Cloud technical user and grant authorizations?",
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
        choices: ["SAP S/4HANA Cloud Sales Order (A2X)", "SAP S/4HANA Cloud Business Partner (A2X)", "SAP SuccessFactors Recruiting", "SAP SuccessFactors Employee Central", "SAP Ariba Network Purchase Orders Buyer", "SAP Ariba Web Services", "SAP Fieldglass Connectors", "SAP Fieldglass Approvals", "SAP Concur", "SAP Graph", "SAP AI Core", "SAP Analytics Cloud Tenant API", "HERE Location Services", "NASA Near Earth Object Web Service", "Northwind"],
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
        name: "SFAPIAccess",
        message: "What is the name of your SAP SuccessFactors Extensibility service instance (api-access plan)? Leave blank for the SAP API Business Hub sandbox.",
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
        when: response => response.api === true && response.apiLoB.includes("SAP AI Core"),
        type: "input",
        name: "AICoreURL",
        message: "What is your SAP AI Core URL?",
        default: "https://api.ai.<service>.<region>.<provider>.ml.hana.ondemand.com"
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP AI Core"),
        type: "input",
        name: "AICoreTokenURL",
        message: "What is your SAP AI Core Token URL?",
        default: "https://ai.authentication.<region>.hana.ondemand.com"
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP AI Core"),
        type: "input",
        name: "AICoreResourceGroup",
        message: "What is your SAP AI Core Resource Group name?",
        default: "<resourceGroupName>"

      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP AI Core"),
        type: "input",
        name: "AICoreDeploymentId",
        message: "What is your SAP AI Core Deployment ID?",
        default: "<deploymentId>"
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP AI Core"),
        type: "input",
        name: "AICoreModel",
        message: "What is your SAP AI Core Model name?",
        default: "<modelName>"
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP AI Core"),
        type: "list",
        name: "AICoreModelType",
        message: "What is your SAP AI Core Model type?",
        choices: [{ name: "Image", value: "image" }, { name: "Sound", value: "sound" }],
        default: "image"
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP Analytics Cloud Tenant API"),
        type: "input",
        name: "SACHost",
        message: "What is your SAP Analytics Cloud Host?",
        default: "https://<tenant>.<region>.hcs.cloud.sap"
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP Analytics Cloud Tenant API"),
        type: "input",
        name: "SACTokenURL",
        message: "What is your SAP Analytics Cloud OAuth2SAML Token URL?",
        default: "https://<tenant>.authentication.<region>.hana.ondemand.com/oauth/token/alias/<alias>"
      },
      {
        when: response => response.api === true && response.apiLoB.includes("SAP Analytics Cloud Tenant API"),
        type: "input",
        name: "SACAudience",
        message: "What is your SAP Analytics Cloud OAuth2SAML Audience?",
        default: "https://<tenant>.authentication.<region>.hana.ondemand.com"
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
        when: response => response.api === true && response.BTPRuntime !== "Kyma",
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
        when: response => response.hana === true && response.authentication === true && response.authorization === true,
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
        when: response => response.authentication === true && response.authorization === true,
        type: "confirm",
        name: "app2app",
        message: "Would you like to configure an App2App authorization scenario?",
        default: false
      },
      {
        when: response => response.authentication === true && response.authorization === true && response.app2app === true,
        type: "list",
        name: "app2appType",
        message: "Which App2App authorization scenario would you like to configure?",
        choices: [{ name: "Authorize another app to use this app", value: "authorize" }, { name: "Access another app from this app", value: "access" }],
        default: "authorize"
      },
      {
        when: response => response.authentication === true && response.authorization === true && response.app2app === true,
        type: "input",
        name: "app2appName",
        message: "What is the name of the other app (deployed to same BTP subaccount)?",
        default: ""
      },
      {
        when: response => response.authentication === true && response.authorization === true && response.app2app === true,
        type: "checkbox",
        name: "app2appMethod",
        message: "What type of App2App authentication would you like?",
        choices: [{ name: "Principal Propagation of Business User", value: "user", checked: true }, { name: "Technical Communication", value: "machine" }],
        default: ["user"]
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
        when: response => response.BTPRuntime === "Kyma" && response.customDomain === "",
        type: "input",
        name: "clusterDomain",
        message: "What is the cluster domain of your SAP BTP, Kyma runtime?",
        default: "0000000.kyma.ondemand.com"
      },
      {
        when: response => response.BTPRuntime === "Kyma" && response.customDomain !== "",
        type: "input",
        name: "gateway",
        message: "What is the gateway for the custom domain in your SAP BTP, Kyma runtime?",
        default: "gateway-name.namespace.svc.cluster.local"
      },
      {
        when: response => response.hana === true && response.schemaName === "" && response.hanaTargetHDI === "" && response.ui === true && response.html5repo === false,
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
        message: "Would you like to include creation/deletion of tenant routes (CF) or API Rules (Kyma) / on subscribe/unsubscribe?",
        default: true
      },
      /*
      {
        when: response => response.multiTenant === true,
        type: "confirm",
        name: "toggles",
        message: "Would you like to enable feature toggles?",
        default: false
      },
      */
      {
        when: response => response.multiTenant === true,
        type: "confirm",
        name: "common",
        message: "Would you like to include common SAP HANA Cloud persistence?",
        default: false
      },
      {
        type: "confirm",
        name: "srv2",
        message: "Would you like to include an additional backend service using SAP Cloud Application Programming Model?",
        default: false
      },
      {
        type: "confirm",
        name: "srvjs",
        message: "Would you like to include an additional backend service using regular Node.js?",
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
        when: response => response.BTPRuntime !== "Kyma",
        type: "confirm",
        name: "applicationLogging",
        message: "Would you like to enable Application Logging?",
        default: false
      },
      {
        when: response => response.BTPRuntime !== "Kyma" && response.api === true,
        type: "input",
        name: "credStore",
        message: "What is the name of your SAP Credential Store service instance? Leave blank for none.",
        validate: (s) => {
          if (/^[a-zA-Z0-9_-]*$/g.test(s)) {
            return true;
          }
          return "Please only use alphanumeric characters for the SAP Credential Store service instance name.";
        },
        default: ""
      },
      {
        when: response => response.BTPRuntime !== "Kyma" && response.hana === true && response.hanaNative === true && response.authentication === true,
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
        name: "graphql",
        message: "Would you like to enable GraphQL?",
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
      if (answers.BTPRuntime !== "Kyma") {
        answers.clusterDomain = "";
        answers.gateway = "";
        answers.namespace = "";
        answers.dockerID = "";
        answers.dockerRepositoryName = "";
        answers.dockerRepositoryVisibility = "";
        answers.kubeconfig = "";
        answers.buildCmd = "";
      } else {
        if (answers.customDomain !== "") {
          answers.clusterDomain = answers.customDomain;
        } else {
          answers.gateway = "kyma-gateway.kyma-system.svc.cluster.local";
        }
        // not currently supported for Kyma
        answers.applicationLogging = false;
        answers.credStore = "";
        answers.haa = false;
      }
      if (answers.dockerRepositoryVisibility !== "private") {
        answers.dockerServerURL = "";
        answers.dockerEmailAddress = "";
        answers.dockerPassword = "";
        answers.dockerRegistrySecretName = "";
      }
      if (answers.hanaTargetHDI !== "") {
        answers.schemaName = "";
        answers.multiTenant = false;
      }
      if (answers.schemaName === "") {
        answers.hanaEndpoint = "";
        answers.hanaUser = "";
        answers.hanaPassword = "";
        answers.schemaAuth = false;
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
        answers.SFAPIAccess = "";
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
        answers.apiAICORE = "";
        answers.AICoreURL = "";
        answers.AICoreTokenURL = "";
        answers.AICoreResourceGroup = "";
        answers.AICoreDeploymentId = "";
        answers.AICoreModel = "";
        answers.AICoreModelType = "";
        answers.SACHost = "";
        answers.SACTokenURL = "";
        answers.SACAudience = "";
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
      answers.apiAICORE = answers.apiLoB.includes("SAP AI Core");
      answers.apiSACTenant = answers.apiLoB.includes("SAP Analytics Cloud Tenant API");
      answers.apiHERE = answers.apiLoB.includes("HERE Location Services");
      answers.apiNeoWs = answers.apiLoB.includes("NASA Near Earth Object Web Service");
      answers.apiNW = answers.apiLoB.includes("Northwind");
      if (answers.api) {
        if (!(answers.apiS4HCSO || answers.apiS4HCBP || answers.apiSFSFRC || answers.apiSFSFEC || answers.apiARIBPO || answers.apiFGAP)) {
          answers.APIKeyHubSandbox = "";
        }
      } else {
        answers.GraphSameSubaccount = false;
        answers.connectivity = false;
      }
      if (answers.apiSFSFRC === false && answers.apiSFSFEC === false) {
        answers.SFAPIAccess = "";
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
      if (answers.apiAICORE === false) {
        answers.AICoreURL = "";
        answers.AICoreTokenURL = "";
        answers.AICoreResourceGroup = "";
        answers.AICoreDeploymentId = "";
        answers.AICoreModel = "";
        answers.AICoreModelType = "";
      }
      if (answers.apiSACTenant === false) {
        answers.SACHost = "";
        answers.SACTokenURL = "";
        answers.SACAudience = "";
      }
      if (answers.apiHERE === false) {
        answers.APIKeyHERE = "";
      }
      if (answers.apiNeoWs === false) {
        answers.APIKeyNASA = "";
      } else if (answers.APIKeyNASA === "") {
        answers.APIKeyNASA = "DEMO_KEY";
      }
      if (answers.multiTenant === true && answers.authentication == false) {
        answers.authentication = true;
        answers.authorization = false;
        answers.app2app = false;
        answers.attributes = false;
      }
      if (answers.authentication === false) {
        answers.authorization = false;
        answers.app2app = false;
        answers.haa = false;
        answers.GraphSameSubaccount = false;
      }
      if (answers.apiSACTenant === true && answers.authentication == false) {
        answers.authentication = true;
      }
      if (!(answers.api === true && answers.BTPRuntime !== "Kyma")) {
        answers.connectivity = false;
      }
      if (answers.hana === false || answers.authentication === false || answers.authorization === false) {
        answers.attributes = false;
      }
      if (answers.authentication === false || answers.authorization === false) {
        answers.app2app = false;
      }
      if (answers.app2app === false) {
        answers.app2appType = "";
        answers.app2appName = "";
        answers.app2appMethod = "";
      }
      if (answers.ui === false) {
        answers.html5repo = false;
        answers.managedAppRouter = false;
        answers.multiTenant = false;
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
        answers.toggles = false;
        answers.common = false;
      } else {
        answers.haa = false;
        answers.toggles = false;
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
      if (answers.haa === false) {
        answers.haaHostname = "";
        answers.haaPersonalizeJWT = false;
        answers.haaUseNamedUser = false;
      }
      answers.destinationPath = this.destinationPath();
      this.config.set(answers);
    });
  }

  async writing() {
    var answers = this.config;

    if (answers.get('hanaTargetHDI') !== "") {
      await hanaUtils.hanaTargetHDI2Schema(this, answers);
    }

    let graphDataSources = [];
    if (answers.get('apiGRAPH')) {
      graphDataSources = await graphUtils.getgraphDataSources(this, answers);
      if (!graphDataSources) {
        this.env.error("Unable to obtain SAP Graph Data Sources.");
      }
    }
    answers.set('graphDataSources', graphDataSources);

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
                                              if (!((file === 'mta.yaml' || file === 'xs-security.json') && answers.get('BTPRuntime') !== 'CF')) {
                                                if (!(file === 'xs-security.json' && answers.get('authentication') === false && answers.get('api') === false && answers.get('html5repo') === false)) {
                                                  if (!(file.includes('-em.yaml') && answers.get('em') === false)) {
                                                    if (!(file === 'em.json' && (answers.get('em') === false || answers.get('BTPRuntime') === 'Kyma'))) {
                                                      if (!((file === 'Jenkinsfile' || file.substring(0, 9) === '.pipeline' || file.includes('-cicd.')) && answers.get('cicd') === false)) {
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
      });

    if (answers.get('schemaName') !== "") {
      hanaUtils.processSchema(this, answers);
      await hanaUtils.processSchemaAuth(this, answers);
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
    answers.delete('APIKeyHERE');
    answers.delete('APIKeyNASA');

  }

  async install() {
    var answers = this.config;
    var opt = { "cwd": answers.get("destinationPath") };
    if (answers.get("apiGRAPH")) {
      await graphUtils.graphImport(this, answers);
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
          cmd = ["get", "sa", answers.get("projectName") + "-cicd", "-n", answers.get("namespace"), "-o", "jsonpath='{.secrets[0].name}'"];
          if (answers.get("kubeconfig") !== "") {
            cmd.push("--kubeconfig", answers.get("kubeconfig"));
          }
          let resSecret = this.spawnCommandSync("kubectl", cmd, opt);
          if (resSecret.exitCode === 0) {
            cmd = ["get", "secret/" + resSecret.stdout.toString().replace(/'/g, ''), "-n", answers.get("namespace"), "-o", "jsonpath='{.data}'"];
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
                console.log(err.message);
                return;
              }
            });
          }
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
    if (this.config.get('routes') && this.config.get('BTPRuntime') === "CF") {
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