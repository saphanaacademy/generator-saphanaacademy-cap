class FieldglassApprovals extends cds.RemoteService {
    async init() {

        this.reject(['CREATE', 'UPDATE', 'DELETE'], '*');

        this.before('READ', 'Approvals', (req) => {
            try {
                let query = 'GET /approvals';
                let select = req.query.SELECT;
                let hasModuleID = false;
                let hasID = false;
                if (select.where) {
                    select.where.forEach(element => {
                        if (element.ref && element.ref[0] === 'ModuleID') {
                            query += '/module_';
                            hasModuleID = true;
                        }
                        else if (element.ref && element.ref[0] === 'ID') {
                            query += '/';
                            hasID = true;
                        }
                        else if (element.val) {
                            query += element.val;
                        }
                    });
                }
                if (hasID && !hasModuleID) {
                    req.reject(`Please provide a filter for both ModuleID and ID as follows: Approvals?$filter=ModuleID eq '<value>' and $filter=ID eq '<value>'`);
                }
                query += '?limit=' + select.limit.rows.val;
                if (select.limit.offset) {
                    query += '&offset=' + select.limit.offset.val;
                }
                req.query = query;
            } catch (err) {
                console.error(err);
            }
        });

        this.before('READ', 'RejectReasons', (req) => {
            try {
                let query = 'GET /approvals/reject_reasons';
                let select = req.query.SELECT;
                let hasModuleID = false;
                if (select.where) {
                    select.where.forEach(element => {
                        if (element.ref && element.ref[0] === 'ModuleID') {
                            query += '/module_';
                            hasModuleID = true;
                        }
                        else if (element.val) {
                            query += element.val;
                        }
                    });
                }
                if (!hasModuleID) {
                    req.reject(`Please provide a filter for ModuleID as follows: RejectReasons?$filter=ModuleID eq '<value>'`);
                }
                req.query = query;
            } catch (err) {
                console.error(err);
            }
        });

        this.on('READ', '*', async (req, next) => {
            const response = await next(req);
            return response.PAYLOAD;
        });

        super.init();
    }
}

module.exports = FieldglassApprovals;