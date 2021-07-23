class Concur extends cds.RemoteService {
    async init() {

        const ExpenseUsers = this.model.definitions['CatalogService.ExpenseUsers'];
        const ExpenseReports = this.model.definitions['CatalogService.ExpenseReports'];

        this.reject(['CREATE', 'UPDATE', 'DELETE'], '*');

        this.before('READ', ExpenseUsers, (req) => {
            try {
                let select = req.query.SELECT;
                let query = 'GET /users?limit=' + select.limit.rows.val;
                if (select.limit.offset) {
                    query += '&offset=' + select.limit.offset.val;
                }
                if (select.where) {
                    select.where.forEach(element => {
                        if (element.ref) query += '&' + element.ref[0].toLowerCase();
                        else if (element.val) query += element.val;
                        else if (element === '=') query += '=';
                    });
                }
                req.query = query;
            } catch (err) {
                console.error(err);
            }
        });

        this.before('READ', ExpenseReports, (req) => {
            try {
                let select = req.query.SELECT;
                if (select.limit.rows.val > 100) select.limit.rows.val = 100;
                let query = 'GET api/v3.0/expense/reports?limit=' + select.limit.rows.val;
                if (select.limit.offset) {
                    query += '&offset=' + select.limit.offset.val;
                }
                if (select.where) {
                    select.where.forEach(element => {
                        if (element.ref) {
                            query += '&';
                            if (element.ref[0].toLowerCase() === 'ownerloginid') query += 'user';
                            else query += element.ref[0];
                        }
                        else if (element.val) query += element.val;
                        else if (element === '=') query += '=';
                    });
                }
                req.query = query;
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

module.exports = Concur;