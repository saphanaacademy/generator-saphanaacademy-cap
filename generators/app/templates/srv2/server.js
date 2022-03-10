const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const xsenv = require('@sap/xsenv');
xsenv.loadEnv();
const services = xsenv.getServices({
    uaa: { tag: 'xsuaa' },
    sm: { label: 'service-manager' }
});

<% if(authentication){ -%>
const xssec = require('@sap/xssec');
const passport = require('passport');
passport.use('JWT', new xssec.JWTStrategy(services.uaa));
app.use(passport.initialize());
app.use(passport.authenticate('JWT', {
    session: false
}));
<% } -%>

app.use(bodyParser.json());

const lib = require('./library');

const hdbext = require('@sap/hdbext');

// app user info
app.get('/srv2/info', function (req, res) {
<% if(authorization){ -%>
    if (req.authInfo.checkScope('$XSAPPNAME.Viewer')) {
<% } -%>
        let info = {
            'userInfo': req.user,
            'subdomain': req.authInfo.getSubdomain(),
            'tenantId': req.authInfo.getZoneId()
        };
        res.status(200).json(info);
<% if(authorization){ -%>
    } else {
        res.status(403).send('Forbidden');
    }
<% } -%>
});

// app database
app.get('/srv2/database', async function (req, res) {
<% if(authorization){ -%>
    if (req.authInfo.checkScope('$XSAPPNAME.Viewer')) {
<% } -%>
        // tenant data
        let tenantId = req.authInfo.getZoneId();
        let sqlstmt = 'SELECT * FROM CATALOGSERVICE_SALES';
        /*
        // tenant metadata
        let tenantId = 'TENANT-' + req.authInfo.getZoneId() + '-META';
        let sqlstmt = 'SELECT * FROM TENANT_METADATA';
        // MTX metadata (all tenants)
        let tenantId = '__META__';
        let sqlstmt = 'SELECT * FROM TENANT_UPDATES';
        */
        // get DB instance
        let serviceBinding = await lib.getSMInstance(services.sm, tenantId);
        if (!serviceBinding.hasOwnProperty('error')) {
            // connect to DB instance
            let hanaOptions = serviceBinding.credentials;
            hdbext.createConnection(hanaOptions, function (err, db) {
                if (err) {
                    console.log(err.message);
                    res.status(500).send(err.message);
                    return;
                }
                // query
                db.exec(sqlstmt, function (err, results) {
                    if (err) {
                        console.log(err.message);
                        res.status(500).send(err.message);
                        return;
                    }
                    res.status(200).json(results);
                });
            });
        } else {
            res.status(500).send(serviceBinding);
        }
<% if(authorization){ -%>
    } else {
        res.status(403).send('Forbidden');
    }
<% } -%>
});

const port = process.env.PORT || 5002;
app.listen(port, function () {
    console.info('Listening on http://localhost:' + port);
});