<% if(applicationLogging){ -%>
const log = require('cf-nodejs-logging-support');
log.setLoggingLevel('info');
<% if(hana){ -%>
log.registerCustomFields(["country", "amount"]);
<% } -%>
<% } -%>

module.exports = cds.service.impl(async function () {

    const { 
<% if(hana){ -%>
            Sales
<% } -%>
<% if(apiS4HCSO){ -%>
<% if(hana){ -%>
           ,
<% } -%>
           SalesOrders
<% } -%>
<% if(apiSFSFRC){ -%>
<% if(hana || apiS4HCSO){ -%>
           ,
<% } -%>
           Candidates
<% } -%>
          } = this.entities;

<% if(hana){ -%>
    this.after('READ', Sales, (each) => {
        if (each.amount > 500) {
            if (each.comments === null)
                each.comments = '';
            else
                each.comments += ' ';
            each.comments += 'Exceptional!';
<% if(applicationLogging){ -%>
            log.info(each.comments, {"country": each.country, "amount": each.amount});
<% } -%>
        }
    });

    this.on('boost', async req => {
        try {
            const ID = req.params[0];
            const tx = cds.tx(req);
            await tx.update(Sales)
                .with({ amount: { '+=': 250 }, comments: 'Boosted!' })
                .where({ ID: { '=': ID } })
                ;
            return {};
        } catch (err) {
            console.error(err);
            return {};
        }
    });
<% } -%>

<% if(hanaNative){ -%>
    this.on('topSales', async (req) => {
        try {
            const tx = cds.tx(req);
            const results = await tx.run(`CALL "<%= projectName %>.db::SP_TopSales"(?,?)`, [req.data.amount]);
            return results;
        } catch (err) {
            console.error(err);
            return {};
        }
    });
<% } -%>

<% if(apiS4HCSO){ -%>
    this.on('READ', SalesOrders, async (req) => {
        try {
            const external = await cds.connect.to('API_SALES_ORDER_SRV');
            const tx = external.transaction(req);
            return await tx.send({
                query: req.query,
                headers: {
                    'APIKey': process.env.APIKey
                }
            })
        } catch (err) {
            req.reject(err);
        }
    });

<% if(hana){ -%>
    this.on('largestOrder', Sales, async (req) => {
        try {
            const tx1 = cds.tx(req);
            const res1 = await tx1.read(Sales)
                .where({ ID: { '=': req.params[0] } })
                ;
            let cql = SELECT.one(SalesOrders).where({ SalesOrganization: res1[0].org }).orderBy({ TotalNetAmount: 'desc' });
            const external = await cds.connect.to('API_SALES_ORDER_SRV');
            const tx2 = external.transaction(req);
            const res2 = await tx2.send({
                query: cql,
                headers: {
                    'APIKey': process.env.APIKey
                }
            });
            if (res2) {
                return res2.SoldToParty + ' @ ' + res2.TransactionCurrency + ' ' + Math.round(res2.TotalNetAmount).toString();
            } else {
                return 'Not found';
            }
        } catch (err) {
            req.reject(err);
        }
    });
<% } -%>
<% } -%>

<% if(apiSFSFRC){ -%>
    this.on('READ', Candidates, async (req) => {
        try {
            const external = await cds.connect.to('RCMCandidate');
            const tx = external.transaction(req);
            return await tx.send({
                query: req.query,
                headers: {
                    'APIKey': process.env.APIKey
                }
            })
        } catch (err) {
            req.reject(err);
        }
    });
<% } -%>

<% if(authentication){ -%>
    this.on('userInfo', req => {
        let results = {};
        results.user = req.user.id;
        if (req.user.hasOwnProperty('locale')) {
            results.locale = req.user.locale;
        }
        results.roles = {};
        results.roles.identified = req.user.is('identified-user');
        results.roles.authenticated = req.user.is('authenticated-user');
<% if(authorization){ -%>
        results.roles.Viewer = req.user.is('Viewer');
        results.roles.Admin = req.user.is('Admin');
<% } -%>
<% if(multiTenant){ -%>
        results.tenant = req.user.tenant;
        results.roles.Callback = req.user.is('Callback');
        results.roles.ExtendCDS = req.user.is('ExtendCDS');
        results.roles.ExtendCDSdelete = req.user.is('ExtendCDSdelete');
<% } -%>
<% if(attributes){ -%>
        results.attrs = {};
        if (req.user.hasOwnProperty('attr')) {
            results.attrs.Region = req.user.attr.Region;
        }
<% } -%>
        return results;
    });
<% } -%>

});
