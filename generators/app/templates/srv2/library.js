module.exports = {
    getSMInstance: getSMInstance,
};

const axios = require('axios');

async function getSMInstance(sm, tenantId) {
    try {
        // get access token
        let options = {
            method: 'POST',
            url: sm.url + '/oauth/token?grant_type=client_credentials&response_type=token',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(sm.clientid + ':' + sm.clientsecret).toString('base64')
            }
        };
        let res = await axios(options);
        // get service binding details
        let options1 = {
            method: 'GET',
            url: sm.sm_url + "/v1/service_bindings?labelQuery=tenant_id eq '" + tenantId + "'",
            headers: {
                'Authorization': 'Bearer ' + res.data.access_token
            }
        };
        let res1 = await axios(options1);
        if (res1.data.num_items === 1) {
            return res1.data.items[0];
        } else {
            let errmsg = { 'error': 'Service binding not found for tenant ' + tenantId };
            console.log(errmsg);
            return errmsg;
        }
    } catch (err) {
        console.log(err.stack);
        return err.message;
    }
};