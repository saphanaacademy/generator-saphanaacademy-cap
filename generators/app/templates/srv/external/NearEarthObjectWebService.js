const cds = require('@sap/cds');

class NearEarthObjectWebService extends cds.RemoteService {
    async init() {

        this.reject(['CREATE', 'UPDATE', 'DELETE'], '*');

        this.before('READ', '*', async (req) => {
            try {
                let today = new Date().toISOString().split('T')[0];
                req.query = 'GET /feed?start_date=' + today + '&end_date=' + today;
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