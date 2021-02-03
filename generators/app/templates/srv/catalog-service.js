module.exports = cds.service.impl(async function () {

    const { Sales
<% if(api){ -%>
           ,SalesOrders
<% } -%>
<% if(authorization){ -%>
           ,SalesAdmin
<% } -%>
          } = this.entities;

    this.after('READ', Sales, (each) => {
        if (each.amount > 500) {
            if (each.comments === null)
                each.comments = '';
            else
                each.comments += ' ';
            each.comments += 'Exceptional!';
        }
    });

<% if(authorization){ -%>
    this.on('submitBoost', async req => {
        try {
            const ID = req.params[0];
            const tx = cds.tx(req);
            await tx.update(SalesAdmin)
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

<% if(api){ -%>
    this.on('READ', SalesOrders, async (req) => {
        try {
            const external = await cds.connect.to('API_SALES_ORDER_SRV');
            const tx = external.transaction(req);
            return await tx.emit({
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
