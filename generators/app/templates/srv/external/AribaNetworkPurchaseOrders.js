const cds = require('@sap/cds');

class AribaNetworkPurchaseOrders extends cds.RemoteService {
    async init() {

        this.reject(['CREATE', 'UPDATE', 'DELETE'], '*');

        this.before('READ', '*', (req) => {
            try {
                let select = req.query.SELECT;
                let query = 'GET /orders?$top=' + select.limit.rows.val;
                if (select.limit.offset) {
                    query += '&$skip=' + select.limit.offset.val;
                }
                if (select.where) {
                    query += '&$filter=';
                    select.where.forEach(element => {
                        if (element.ref) query += element.ref[0];
                        else if (element.val) query += `'` + element.val + `'`;
                        else if (element === '=') query += ' eq ';
                        else if (element === 'and') query += ' and ';
                    });
                }
                req.query = query;
            } catch (err) {
                console.error(err);
            }
        });

        this.on('READ', '*', async (req, next) => {
            const response = await next(req);
            return response.content;
        });

        super.init();
    }
}

module.exports = AribaNetworkPurchaseOrders;