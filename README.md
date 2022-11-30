# generator-saphanaacademy-cap [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]
> Yeoman Generator to jump-start BTP Full-Stack Cloud Applications

## Installation

This generator creates projects using [SAP Cloud Application Programming Model](https://cap.cloud.sap/) (CAP)

First, install [Yeoman](http://yeoman.io) and generator-saphanaacademy-cap using [npm](https://www.npmjs.com/)

```bash
npm install -g yo
npm install -g generator-saphanaacademy-cap
```

## SAP BTP, Cloud Foundry runtime
We assume you have pre-installed [node.js](https://nodejs.org/) and the [Cloud Foundry CLI](https://github.com/cloudfoundry/cli) with the [multiapps](https://github.com/cloudfoundry-incubator/multiapps-cli-plugin) plugin.

In order to build the project ensure [@sap/cds-dk](https://www.npmjs.com/package/@sap/cds-dk) and [Cloud MTA Build Tool (MBT)](https://sap.github.io/cloud-mta-build-tool/) are installed.

This is already the case for SAP Business Application Studio.

If using SAP HANA Cloud ensure you have created an instance and have configured a database mapping to the SAP BTP, Cloud Foundry runtime org and space that you will be deploying to.

If using the HTML5 Application Repository ensure you have subscribed to the SAP Launchpad service in the subaccount where you'll be deploying the app.

If enabling Continuous Integration and Delivery (CI/CD) ensure you have subscribed to the Continuous Integration & Delivery service and optionally the Transport Management service in the subaccount where you'll be deploying the app.

Also ensure that you are logged in to the SAP BTP, Cloud Foundry runtime CLI and are targeting the org and space into which you want to deploy the app.

To generate your new project:

```bash
yo saphanaacademy-cap
```
NB: If you prefer a rich user experience when generating your projects consider the [Application Wizard](https://marketplace.visualstudio.com/items?itemName=SAPOS.yeoman-ui).

To refresh project files for an existing SAP HANA Cloud schema:

```bash
cd <projectName>
yo saphanaacademy-cap:schema
```

To refresh project files for an existing SAP HANA Cloud HDI Container:

```bash
cd <projectName>
yo saphanaacademy-cap:hdi
```

To refresh project files for SAP Graph:

```bash
cd <projectName>
yo saphanaacademy-cap:graph
```

## SAP BTP, Kyma runtime
We assume you have pre-installed [node.js](https://nodejs.org/), have a [Docker Hub](https://hub.docker.com/) ID and the ability to build and push containers either via Docker [Desktop](https://www.docker.com/products/docker-desktop) or an alternative such as Rancher [Desktop](https://rancherdesktop.io/) or [podman](https://podman.io) or a CI/CD pipeline with [kaniko](https://github.com/GoogleContainerTools/kaniko).

The Kubernetes command-line tool [kubectl](https://kubernetes.io/docs/tasks/tools/) is required with the [kubelogin](https://github.com/int128/kubelogin) extension.

In order to build or deploy the project via the Makefile ensure that GNU [Make](https://www.gnu.org/software/make) is installed.

In order to deploy the project ensure that [Helm](https://helm.sh/docs/intro/install) is installed or use a CI/CD pipeline.

If using SAP HANA Cloud ensure you have created an instance and have configured a database mapping to the SAP BTP, Kyma runtime namespace that you will be deploying to.

If using the HTML5 Application Repository ensure you have subscribed to the SAP Launchpad service in the subaccount where you'll be deploying the app.

If enabling Continuous Integration and Delivery (CI/CD) ensure you have subscribed to the Continuous Integration & Delivery service and optionally the Transport Management service in the subaccount where you'll be deploying the app.

Ensure that you have set the KUBECONFIG environment variable, have optionally created a namespace into which you would like to deploy the project and are logged in to Docker Hub. For example:

Mac/Linux:
```bash
chmod go-r {KUBECONFIG_FILE_PATH}
export KUBECONFIG={KUBECONFIG_FILE_PATH}
kubectl create ns dev
docker login
```
Windows:
```powershell
$ENV:KUBECONFIG="{KUBECONFIG_FILE_PATH}"
kubectl create ns dev
docker login
```

You can also specify the path to your Kubeconfig file in the generator.

To generate your new project:

```bash
yo saphanaacademy-cap
```
NB: If you prefer a rich user experience when generating your projects consider the [Application Wizard](https://marketplace.visualstudio.com/items?itemName=SAPOS.yeoman-ui).

To refresh project files for an existing SAP HANA Cloud schema:

```bash
cd <projectName>
yo saphanaacademy-cap:schema
```

To refresh project files for an existing SAP HANA Cloud HDI Container:

```bash
cd <projectName>
yo saphanaacademy-cap:hdi
```

To refresh project files for SAP Graph:

```bash
cd <projectName>
yo saphanaacademy-cap:graph
```

To build and push your project containers to Docker Hub:
```bash
cd <projectName>
make docker-push
```
If you prefer, you can issue the build & push commands manually (see the generated <projectName>/Makefile) or use a CI/CD pipeline.

To deploy your new project to SAP BTP, Kyma runtime:
```bash
cd <projectName>
make helm-deploy
```
If you prefer, you can issue the helm commands manually (see the generated <projectName>/Makefile) or use a CI/CD pipeline.

To undeploy your new project from SAP BTP, Kyma runtime:
```bash
cd <projectName>
make helm-undeploy
```

## Important
Please pay special attention to messages produced by the generator!

![SAP Business Application Studio](demo.gif)

## Video Tutorials

For hands-on video tutorials click [here](https://www.youtube.com/playlist?list=PLkzo92owKnVwQ-0oT78691fqvHrYXd5oN).

## Getting To Know Yeoman

 * Yeoman has a heart of gold.
 * Yeoman is a person with feelings and opinions, but is very easy to work with.
 * Yeoman can be too opinionated at times but is easily convinced not to be.
 * Feel free to [learn more about Yeoman](http://yeoman.io/).

## License

Copyright (c) 2022 SAP SE or an SAP affiliate company. All rights reserved. This project is licensed under the Apache Software License, Version 2.0 except as noted otherwise in the [LICENSE](LICENSE) file.

[npm-image]: https://badge.fury.io/js/generator-saphanaacademy-cap.svg
[npm-url]: https://npmjs.org/package/generator-saphanaacademy-cap
[travis-image]: https://travis-ci.com/saphanaacademy/generator-saphanaacademy-cap.svg?branch=main
[travis-url]: https://travis-ci.com/saphanaacademy/generator-saphanaacademy-cap
[daviddm-image]: https://david-dm.org/saphanaacademy/generator-saphanaacademy-cap.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/saphanaacademy/generator-saphanaacademy-cap
