const cds = require('@sap/cds');
const debug = require('debug')('srv:server');
<% if (BTPRuntime === 'CF' && routes) {-%>
const cfenv = require('cfenv');
const appEnv = cfenv.getAppEnv();
const httpClient = require('@sap-cloud-sdk/http-client');
<% } -%>
<% if(multiTenant && (routes || api)){ -%>
const xsenv = require('@sap/xsenv');
xsenv.loadEnv();
<% } -%>
<% if(swagger){ -%>
const cdsSwagger = require('cds-swagger-ui-express');
<% } -%>
<% if(v2support){ -%>
const odatav2adapterproxy = require('@sap/cds-odata-v2-adapter-proxy');
<% } -%>

<% if(swagger || v2support || toggles || common){ -%>
cds.on('bootstrap', app => app.use((req, res, next) => {
<% if(swagger){ -%>
    app.use(cdsSwagger({
        "basePath": "/swagger",
        "diagram": "true"
    }));
<% } -%>
<% if(v2support){ -%>
    app.use(odatav2adapterproxy());
<% } -%>
<% if(toggles){ -%>
    // feature toggles management - per tenant / user / request
    // req.features = req.headers.features || '';
<% } -%>
    next();
}));
<% } -%>

<% if(multiTenant){ -%>
<% if(routes){ -%>
<% if (BTPRuntime === 'CF') {-%>
async function getCFInfo(appname) {
    try {
        // get app GUID
        let res1 = await httpClient.executeHttpRequest({ destinationName: '<%= projectName %>-cfapi'}, {
            method: 'GET',
            url: '/v3/apps?organization_guids=' + appEnv.app.organization_id + '&space_guids=' + appEnv.app.space_id + '&names=' + appname
        });
        // get domain GUID
        let res2 = await httpClient.executeHttpRequest({ destinationName: '<%= projectName %>-cfapi'}, {
            method: 'GET',
            url: '/v3/domains?names=' + /\.(.*)/gm.exec(appEnv.app.application_uris[0])[1]
        });
        let results = {
            'app_id': res1.data.resources[0].guid,
            'domain_id': res2.data.resources[0].guid
        };
        return results;
    } catch (err) {
        console.log(err.stack);
        return err.message;
    }
};

async function createRoute(subscribedSubdomain, appname) {
    getCFInfo(appname).then(
        async function (CFInfo) {
            try {
                // create route
                let res1 = await httpClient.executeHttpRequest({ destinationName: '<%= projectName %>-cfapi'}, {
                    method: 'POST',
                    url: '/v3/routes',
                    data: {
                        'host': subscribedSubdomain + '-' + process.env.APP_URI.split('.')[0],
                        'relationships': {
                            'space': {
                                'data': {
                                    'guid': appEnv.app.space_id
                                }
                            },
                            'domain': {
                                'data': {
                                    'guid': CFInfo.domain_id
                                }
                            }
                        }
                    },
                });
                // map route to app
                let res2 = await httpClient.executeHttpRequest({ destinationName: '<%= projectName %>-cfapi'}, {
                    method: 'POST',
                    url: '/v3/routes/' + res1.data.guid + '/destinations',
                    data: {
                        'destinations': [{
                            'app': {
                                'guid': CFInfo.app_id
                            }
                        }]
                    },
                });
                console.log('Route created for ' + subscribedSubdomain);
                return res2.data;
            } catch (err) {
                console.log(err.stack);
                return err.message;
            }
        },
        function (err) {
            console.log(err.stack);
            return err.message;
        });
};

async function deleteRoute(subscribedSubdomain, appname) {
    getCFInfo(appname).then(
        async function (CFInfo) {
            try {
                // get route id
                let res1 = await httpClient.executeHttpRequest({ destinationName: '<%= projectName %>-cfapi'}, {
                    method: 'GET',
                    url: '/v3/apps/' + CFInfo.app_id + '/routes?hosts=' + subscribedSubdomain + '-' + process.env.APP_URI.split('.')[0]
                });
                if (res1.data.pagination.total_results === 1) {
                    try {
                        // delete route
                        let res2 = await httpClient.executeHttpRequest({ destinationName: '<%= projectName %>-cfapi'}, {
                            method: 'DELETE',
                            url: '/v3/routes/' + res1.data.resources[0].guid
                        });
                        console.log('Route deleted for ' + subscribedSubdomain);
                        return res2.data;
                    } catch (err) {
                        console.log(err.stack);
                        return err.message;
                    }
                } else {
                    let errmsg = { 'error': 'Route not found' };
                    console.log(errmsg);
                    return errmsg;
                }
            } catch (err) {
                console.log(err.stack);
                return err.message;
            }
        },
        function (err) {
            console.log(err.stack);
            return err.message;
        });
};
<% } else { -%>
const k8s = require('@kubernetes/client-node');

async function createRoute(subscribedSubdomain, appName) {
    try {
        let tenantHost = subscribedSubdomain  + '-<%= projectName %>-app';
        const apiRule = {
            apiVersion: process.env.apiRuleGroup + '/' +  process.env.apiRuleVersion,
            kind: 'APIRule',
            metadata: {
                name: tenantHost,
                labels: {
                    'app.kubernetes.io/managed-by': '<%= projectName %>-srv'
                }
            },
            spec: {
                gateway: process.env.gateway,
                host: tenantHost + '.' + process.env.clusterDomain,
                rules: [
                    {
                        path: '/.*',
                        accessStrategies: [
                            {
                                config: {},
                                handler: 'noop'
                            }
                        ],
                        mutators: [
                            {
                                handler: 'header',
                                config: {
                                    headers: {
                                        "x-forwarded-host": tenantHost + '.' + process.env.clusterDomain
                                    }
                                }
                            }
                        ],
                        methods: [
                            'HEAD',
                            'GET',
                            'POST',
                            'PUT',
                            'PATCH',
                            'DELETE'
                        ]
                    }
                ],
                service: {
                    name: process.env.appServiceName,
                    port: parseInt(process.env.appServicePort)
                }
            }
        };
        const kc = new k8s.KubeConfig();
        kc.loadFromCluster();
        const k8sApi = kc.makeApiClient(k8s.CustomObjectsApi);
        const result = await k8sApi.createNamespacedCustomObject(
            process.env.apiRuleGroup,
            process.env.apiRuleVersion,
            process.env.namespace,
            process.env.apiRules,
            apiRule
        );
        console.log('APIRule created:', appName, subscribedSubdomain, tenantHost, result.response.statusCode, result.response.statusMessage);
        return {};
    } catch (err) {
        console.log(err.stack);
        return err.message;
    }
};

async function deleteRoute(subscribedSubdomain, appName) {
    try {
        let tenantHost = subscribedSubdomain  + '-<%= projectName %>-app';
        const kc = new k8s.KubeConfig();
        kc.loadFromCluster();
        const k8sApi = kc.makeApiClient(k8s.CustomObjectsApi);
        const result = await k8sApi.deleteNamespacedCustomObject(
            process.env.apiRuleGroup,
            process.env.apiRuleVersion,
            process.env.namespace,
            process.env.apiRules,
            tenantHost
        );
        console.log('APIRule deleted:', appName, subscribedSubdomain, tenantHost, result.response.statusCode, result.response.statusMessage);
        return {};
    } catch (err) {
        console.log(err.stack);
        return err.message;
    }
};
<% } -%>
<% } -%>

cds.on('served', () => {

    const { 'cds.xt.SaasProvisioningService': provisioning } = cds.services;
    provisioning.prepend(() => {

        provisioning.on('UPDATE', 'tenant', async (req, next) => {
            let tenantURL = process.env.APP_PROTOCOL + ':\/\/' + req.data.subscribedSubdomain + '-' + process.env.APP_URI;
            console.log('Subscribe:', req.data.subscribedSubdomain, req.data.subscribedTenantId, tenantURL);
            await next();
<% if(routes){ -%>
            const services = xsenv.getServices({
                registry: { label: 'saas-registry' }
            });
            createRoute(req.data.subscribedSubdomain, services.registry.appName + '-app').then(
                function (res2) {
                    return tenantURL;
                },
                function (err) {
                    debug(err.stack);
                    return '';
                });
<% } -%>
            return tenantURL;
        });

        provisioning.on('DELETE', 'tenant', async (req, next) => {
            console.log('Unsubscribe:', req.data.subscribedSubdomain, req.data.subscribedTenantId);
            await next();
<% if(routes){ -%>
            const services = xsenv.getServices({
                registry: { label: 'saas-registry' }
            });
            deleteRoute(req.data.subscribedSubdomain, services.registry.appName + '-app').then(
                async function (res2) {
                    return req.data.subscribedTenantId;
                },
                function (err) {
                    debug(err.stack);
                    return '';
                });
<% } -%>
            return req.data.subscribedTenantId;
        });

<% if(api){ -%>
        provisioning.on('dependencies', async (req, next) => {
            await next();
            const services = xsenv.getServices({
                dest: { label: 'destination' }
            });
            let dependencies = [{
                'xsappname': services.dest.xsappname
            }];
            console.log('Dependencies:', dependencies);
            return dependencies;
        });
<% } -%>
    });

    /* upgrade tenant - override
    const { 'cds.xt.DeploymentService': deployment } = cds.services;
    deployment.prepend(() => {
        deployment.on('upgrade', async (req) => {
            console.log('UpgradeTenant:', req.data);
            return '';
        });
    });
    */

});
<% } -%>

module.exports = cds.server;