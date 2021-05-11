<% if(credStore !== ''){ -%>
const credStore = require('./../lib/credStore');
<% } -%>

class NearEarthObjectWebService extends cds.RemoteService {
    async init() {

        this.reject(['CREATE', 'UPDATE', 'DELETE'], '*');

        this.before('READ', '*', async (req) => {
            try {
                let today = new Date().toISOString().split('T')[0];
                req.query = 'GET /feed?api_key=' + <% if(credStore !== ''){ -%>await credStore.readCredentialValue('<%= credStoreNS %>', 'password', 'APIKeyNASA')<% } else { -%>process.env.APIKeyNASA<% } -%> + '&start_date=' + today + '&end_date=' + today;
            } catch (err) {
                console.error(err);
            }
        });

        this.on('READ', '*', async (req, next) => {
            let today = new Date().toISOString().split('T')[0];
            const response = await next(req);
            return response.near_earth_objects[today];
        });

        super.init();
    }
}

module.exports = NearEarthObjectWebService;