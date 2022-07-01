const cds = require('@sap/cds');

class SACTenant extends cds.RemoteService {
    async init() {

        this.reject(['CREATE', 'UPDATE', 'DELETE'], '*');

        this.before('READ', 'Stories', (req) => {
            try {
                req.query = 'GET /stories?include=models';
            } catch (err) {
                console.error(err);
            }
        });

        this.on('READ', '*', async (req, next) => {
            const response = await next(req);
            return response.Items;
        });

        super.init();
    }
}

module.exports = SACTenant;