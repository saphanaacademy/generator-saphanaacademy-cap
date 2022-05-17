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
        // get service offering id
        let options1 = {
            method: 'GET',
            url: sm.sm_url + "/v1/service_offerings?fieldQuery=catalog_name eq 'hana'",
            headers: {
                'Authorization': 'Bearer ' + res.data.access_token
            }
        };
        let res1 = await axios(options1);
        if (res1.data.num_items === 1) {
            // get service plan id
            let options2 = {
                method: 'GET',
                url: sm.sm_url + "/v1/service_plans?fieldQuery=catalog_name eq 'hdi-shared' and service_offering_id eq '" + res1.data.items[0].id + "'",
                headers: {
                    'Authorization': 'Bearer ' + res.data.access_token
                }
            };
            let res2 = await axios(options2);
            if (res2.data.num_items === 1) {
                // get service binding details
                let options3 = {
                    method: 'GET',
                    url: sm.sm_url + "/v1/service_bindings?labelQuery=service_plan_id eq '" + res2.data.items[0].id + "' and tenant_id eq '" + tenantId + "'",
                    headers: {
                        'Authorization': 'Bearer ' + res.data.access_token
                    }
                };
                let res3 = await axios(options3);
                if (res3.data.num_items === 1) {
                    return res3.data.items[0];
                } else {
                    let errmsg = { 'error': 'Service binding not found for tenant ' + tenantId };
                    console.log(errmsg);
                    return errmsg;
                }
            } else {
                let errmsg = { 'error': 'Service plan hdi-shared not found' };
                console.log(errmsg);
                return errmsg;
            }
        } else {
            let errmsg = { 'error': 'Service offering hana not found' };
            console.log(errmsg);
            return errmsg;
        }
    } catch (err) {
        console.log(err.stack);
        return err.message;
    }
};