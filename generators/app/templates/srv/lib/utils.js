const debug = require('debug')('srv:utils');

module.exports = {
    getDestination: getDestination
<% if(apiCONC){ -%>
    ,
    getAccessToken: getAccessToken
<% } -%>
    };

const xsenv = require('@sap/xsenv');
const services = xsenv.getServices({
    uaa: { label: 'xsuaa' },
    dest: { label: 'destination' }
});

const axios = require('axios');
const qs = require('qs');

async function getDestination(destination) {
    try {
        debug('utils.getDestination:', destination);
        let dest = services.dest;
        // TODO when multitenant use tenant subdomain to authenticate
        let url = dest.url; //.split('://')[0] + '://' + tenantSubdomain + dest.url.slice(dest.url.indexOf('.'));
        try {
            let options1 = {
                method: 'POST',
                url: url + '/oauth/token?grant_type=client_credentials',
                headers: {
                    Authorization: 'Basic ' + Buffer.from(dest.clientid + ':' + dest.clientsecret).toString('base64')
                }
            };
            let res1 = await axios(options1);
            debug('utils.getDestination:', res1.data);
            try {
                options2 = {
                    method: 'GET',
                    url: dest.uri + '/destination-configuration/v1/destinations/' + destination,
                    headers: {
                        Authorization: 'Bearer ' + res1.data.access_token
                    }
                };
                let res2 = await axios(options2);
                debug('utils.getDestination:', res2.data);
                return res2.data;
            } catch (err) {
                console.log(err.stack);
                return err.message;
            }
        } catch (err) {
            console.log(err.stack);
            return err.message;
        }
    } catch (err) {
        console.log(err.stack);
        return err.message;
    }
};

<% if(apiCONC){ -%>
async function getAccessToken(destination, grantType) {
    try {
        debug('utils.getAccessToken:', destination);
        try {
            let dest = await getDestination(destination);
            let data = {
                grant_type: grantType,
                client_id: dest.destinationConfiguration.client_id,
                client_secret: dest.destinationConfiguration.client_secret
            };
            if (grantType.toLowerCase() === 'refresh_token') {
                data.refresh_token = dest.destinationConfiguration.refresh_token
            };
            let options = {
                method: 'POST',
                url: dest.destinationConfiguration.token_url,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: qs.stringify(data)
            };
            let res = await axios(options);
            debug('utils.getAccessToken:', res.data);
            return res.data.access_token;
        } catch (err) {
            console.log(err.stack);
            return err.message;
        }
    } catch (err) {
        console.log(err.stack);
        return err.message;
    }
};
<% } -%>