const cds = require('@sap/cds');
const debug = require('debug')('srv:FieldglassConnectors');

class FieldglassConnectors extends cds.RemoteService {
    async init() {

        this.reject(['CREATE', 'UPDATE', 'DELETE'], ['JobPosting', 'WorkOrder']);

        this.before('READ', 'JobPosting', (req) => {
            try {
                let query = 'GET /<%= FGCNJobPostingSupplierDownload %>';
                if (req.query.SELECT.from.ref[0].where) {
                    query += '?object_ref=' + req.query.SELECT.from.ref[0].where[2].val;
                };
                debug(query);
                req.query = query;
            } catch (err) {
                console.error(err);
            }
        });

        this.on('READ', 'JobPosting', async (req, next) => {
            const response = await next(req);
            debug(response);
            if (response.StaffingOrder) {
                return response.StaffingOrder;
            } else {
                return {};
            }
        });

        this.before('READ', 'WorkOrder', (req) => {
            try {
                let query = 'GET /<%= FGCNWorkerfromWorkOrderXMLDownload %>';
                if (req.query.SELECT.from.ref[0].where) {
                    query += '?object_ref=' + req.query.SELECT.from.ref[0].where[2].val;
                };
                debug(query);
                req.query = query;
            } catch (err) {
                console.error(err);
            }
        });

        this.on('READ', 'WorkOrder', async (req, next) => {
            const response = await next(req);
            debug(response);
            if (response.ShowWorker) {
                return response.ShowWorker;
            } else {
                return {};
            }
        });

        super.init();
    }
}

module.exports = FieldglassConnectors;