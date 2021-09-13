const cds = require('@sap/cds');

<% if(swagger){ -%>
const cdsSwagger = require('cds-swagger-ui-express');
<% } -%>

<% if(v2support){ -%>
const odatav2adapterproxy = require('@sap/cds-odata-v2-adapter-proxy');
<% } -%>

cds.on('bootstrap', app => {

<% if(swagger){ -%>
    app.use(cdsSwagger({
        "basePath": "/swagger",
        "diagram": "true"
    }));
<% } -%>

<% if(v2support){ -%>
    app.use(odatav2adapterproxy());
<% } -%>

<% if(multiTenant){ -%>
    cds.mtx.in(app).then(async () => {
        const provisioning = await cds.connect.to('ProvisioningService');
        provisioning.impl(require('./provisioning'));
    });
<% } -%>

});

module.exports = cds.server;