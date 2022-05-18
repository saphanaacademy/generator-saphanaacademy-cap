const cds = require('@sap/cds');
const debug = require('debug')('srv:provisioning');
<% if(credStore !== ''){ -%>
const credStore = require('./lib/credStore');
<% } -%>
const cfenv = require('cfenv');
const appEnv = cfenv.getAppEnv();
const xsenv = require('@sap/xsenv');
xsenv.loadEnv();
const services = xsenv.getServices({
    registry: { tag: 'SaaS' }
<% if(api){ -%>
    ,
    dest: { tag: 'destination' }
<% } -%>
});

<% if(routes){ -%>
const core = require('@sap-cloud-sdk/core');

async function getCFInfo(appname) {
    try {
        // get app GUID
        let res1 = await core.executeHttpRequest({ destinationName: '<%= projectName %>-cfapi'}, {
            method: 'GET',
            url: '/v3/apps?organization_guids=' + appEnv.app.organization_id + '&space_guids=' + appEnv.app.space_id + '&names=' + appname
        });
        // get domain GUID
        let res2 = await core.executeHttpRequest({ destinationName: '<%= projectName %>-cfapi'}, {
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

async function createRoute(tenantHost, appname) {
    getCFInfo(appname).then(
        async function (CFInfo) {
            try {
                // create route
                let res1 = await core.executeHttpRequest({ destinationName: '<%= projectName %>-cfapi'}, {
                    method: 'POST',
                    url: '/v3/routes',
                    data: {
                        'host': tenantHost,
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
                let res2 = await core.executeHttpRequest({ destinationName: '<%= projectName %>-cfapi'}, {
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
                console.log('Route created for ' + tenantHost);
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

async function deleteRoute(tenantHost, appname) {
    getCFInfo(appname).then(
        async function (CFInfo) {
            try {
                // get route id
                let res1 = await core.executeHttpRequest({ destinationName: '<%= projectName %>-cfapi'}, {
                    method: 'GET',
                    url: '/v3/apps/' + CFInfo.app_id + '/routes?hosts=' + tenantHost
                });
                if (res1.data.pagination.total_results === 1) {
                    try {
                        // delete route
                        let res2 = await core.executeHttpRequest({ destinationName: '<%= projectName %>-cfapi'}, {
                            method: 'DELETE',
                            url: '/v3/routes/' + res1.data.resources[0].guid
                        });
                        console.log('Route deleted for ' + tenantHost);
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
<% } -%>

module.exports = (service) => {

    service.on('UPDATE', 'tenant', async (req, next) => {
<% if(customDomain !== ""){ -%>
        let tenantHost = req.data.subscribedSubdomain;
<% } else { -%>
        let tenantHost = req.data.subscribedSubdomain + '-' + appEnv.app.space_name.toLowerCase().replace(/_/g, '-') + '-' + services.registry.appName.toLowerCase().replace(/_/g, '-');
<% } -%>
        let tenantURL = 'https:\/\/' + tenantHost + /\.(.*)/gm.exec(appEnv.app.application_uris[0])[0];
        console.log('Subscribe: ', req.data.subscribedSubdomain, req.data.subscribedTenantId, tenantHost);
        await next();
<% if(routes){ -%>
        createRoute(tenantHost, services.registry.appName).then(
            function (res2) {
                console.log('Subscribe: - Create Route: ', req.data.subscribedTenantId, tenantHost, tenantURL);
                return tenantURL;
            },
            function (err) {
                debug(err.stack);
                return '';
            });
<% } -%>
        return tenantURL;
    });

    service.on('DELETE', 'tenant', async (req, next) => {
<% if(customDomain !== ""){ -%>
        let tenantHost = req.data.subscribedSubdomain;
<% } else { -%>
        let tenantHost = req.data.subscribedSubdomain + '-' + appEnv.app.space_name.toLowerCase().replace(/_/g, '-') + '-' + services.registry.appName.toLowerCase().replace(/_/g, '-');
<% } -%>
        console.log('Unsubscribe: ', req.data.subscribedSubdomain, req.data.subscribedTenantId, tenantHost);
        await next();
<% if(routes){ -%>
        deleteRoute(tenantHost, services.registry.appName).then(
            async function (res2) {
                console.log('Unsubscribe: - Delete Route: ', req.data.subscribedTenantId);
                return req.data.subscribedTenantId;
            },
            function (err) {
                debug(err.stack);
                return '';
            });
<% } -%>
        return req.data.subscribedTenantId;
    });

    service.on('upgradeTenant', async (req, next) => {
        await next();
        const { instanceData, deploymentOptions } = cds.context.req.body;
        console.log('UpgradeTenant: ', req.data.subscribedTenantId, req.data.subscribedSubdomain, instanceData, deploymentOptions);
    });

<% if(api){ -%>
    service.on('dependencies', async (req) => {
        let dependencies = [{
            'xsappname': services.dest.xsappname
        }];
        console.log('Dependencies: ', dependencies);
        return dependencies;
    });
<% } -%>

}