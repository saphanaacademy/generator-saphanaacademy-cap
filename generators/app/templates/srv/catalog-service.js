const debug = require('debug')('srv:catalog-service');
<% if(applicationLogging){ -%>
const log = require('cf-nodejs-logging-support');
log.setLoggingLevel('info');
<% if(hana){ -%>
log.registerCustomFields(["country", "amount"]);
<% } -%>
<% } -%>
<% if(credStore !== ''){ -%>
const credStore = require('./lib/credStore');
<% } -%>
<% if(apiARIBWS){ -%>
const fs = require('fs');
const path = require('path');
const soapRequest = require('easy-soap-request');
<% } -%>
<% if(apiARIBWS || apiCONC){ -%>
const utils = require('./lib/utils');
<% } -%>
<% if(apiFGCN){ -%>
const fgcnAPI = require('./external/FieldglassConnectorsAPI');
<% } -%>

module.exports = cds.service.impl(async function () {

<% if(apiS4HCSO){ -%>
    const s4hcso = await cds.connect.to('API_SALES_ORDER_SRV');
<% } -%>
<% if(apiS4HCBP){ -%>
    const s4hcbp = await cds.connect.to('API_BUSINESS_PARTNER');
<% } -%>
<% if(apiSFSFRC){ -%>
    const sfrcm = await cds.connect.to('RCMCandidate');
<% } -%>
<% if(apiSFSFEC){ -%>
    const sfecei = await cds.connect.to('ECEmploymentInformation');
<% } -%>
<% if(apiARIBPO){ -%>
    const aribapo = await cds.connect.to('ARIBA_NETWORK_PURCHASE_ORDERS');
<% } -%>
<% if(apiFGCN){ -%>
    const fgcn = await cds.connect.to('FieldglassConnectors');
<% } -%>
<% if(apiFGAP){ -%>
    const fgap = await cds.connect.to('FieldglassApprovals');
<% } -%>
<% if(apiCONC){ -%>
    const conc = await cds.connect.to('Concur');
<% } -%>
<% if(apiGRAPH){ -%>
<% graphDataSources.forEach(element => { -%>
    const <%= element.shortName %> = await cds.connect.to('<%= element.name %>');
<% }); -%>
<% } -%>
<% if(apiHERE){ -%>
    const HERE = await cds.connect.to('HERELocationServices');
<% } -%>
<% if(apiNeoWs){ -%>
    const NeoWs = await cds.connect.to('NearEarthObjectWebService');
<% } -%>
<% if(em){ -%>
    const em = await cds.connect.to('messaging'); 
<% if(!multiTenant && hana){ -%>
    const db = await cds.connect.to('db'); 
<% } -%>
<% } -%>

    const {
<% if(hana){ -%>
            Sales
<% } -%>
<% if(apiS4HCSO){ -%>
<% if(hana){ -%>
            ,
<% } -%>
            SalesOrders
<% if(em && hana){ -%>
            ,
            SalesOrdersLog
<% } -%>
<% } -%>
<% if(apiS4HCBP){ -%>
<% if(hana || apiS4HCSO){ -%>
            ,
<% } -%>
            BusinessPartners
<% if(em && hana){ -%>
            ,
            CustomerProcesses
<% } -%>
<% } -%>
<% if(apiSFSFRC){ -%>
<% if(hana || apiS4HCBP || apiS4HCSO){ -%>
            ,
<% } -%>
            Candidates
<% if(em && hana){ -%>
            ,
            CandidatesLog
<% } -%>
<% } -%>
<% if(apiSFSFEC){ -%>
<% if(hana || apiS4HCBP || apiS4HCSO || apiSFSFRC){ -%>
            ,
<% } -%>
            EmployeeJobs
<% if(em && hana){ -%>
            ,
            EmployeeJobsLog
<% } -%>
<% } -%>
<% if(apiARIBPO){ -%>
<% if(hana || apiS4HCBP || apiS4HCSO || apiSFSFRC || apiSFSFEC){ -%>
            ,
<% } -%>
            PurchaseOrders
<% } -%>
<% if(apiFGCN){ -%>
<% if(hana || apiS4HCBP || apiS4HCSO || apiSFSFRC || apiSFSFEC || apiARIBPO){ -%>
            ,
<% } -%>
            JobPosting,
            WorkOrder
<% } -%>
<% if(apiFGAP){ -%>
<% if(hana || apiS4HCBP || apiS4HCSO || apiSFSFRC || apiSFSFEC || apiARIBPO || apiFGCN){ -%>
            ,
<% } -%>
            Approvals,
            RejectReasons
<% } -%>
<% if(apiCONC){ -%>
<% if(hana || apiS4HCBP || apiS4HCSO || apiSFSFRC || apiSFSFEC || apiARIBPO || apiFGCN || apiFGAP){ -%>
            ,
<% } -%>
            ExpenseUsers,
            ExpenseReports
<% } -%>
<% if(apiGRAPH){ -%>
<% if(hana || apiS4HCBP || apiS4HCSO || apiSFSFRC || apiSFSFEC || apiARIBPO || apiFGCN || apiFGAP || apiCONC){ -%>
            ,
<% } -%>
<% let i = 0 -%>
<% graphDataSources.forEach(element => { -%>
            <%= element.entity %>
<% i = i + 1 -%>
<% if(i !== graphDataSources.length){ -%>
            ,
<% } -%>
<% }); -%>
<% } -%>
<% if(apiHERE){ -%>
<% if(hana || apiS4HCBP || apiS4HCSO || apiSFSFRC || apiSFSFEC || apiARIBPO || apiFGCN || apiFGAP || apiCONC || apiGRAPH){ -%>
            ,
<% } -%>
            Geocodes
<% } -%>
<% if(apiNeoWs){ -%>
<% if(hana || apiS4HCBP || apiS4HCSO || apiSFSFRC || apiSFSFEC || apiARIBPO || apiFGCN || apiFGAP || apiCONC || apiGRAPH || apiHERE){ -%>
            ,
<% } -%>
            Asteroids
<% } -%>
          } = this.entities;

<% if(hana){ -%>
    this.after('READ', Sales, (each) => {
        if (each.amount > 500) {
            each.criticality = 3;
            if (each.comments === null)
                each.comments = '';
            else
                each.comments += ' ';
            each.comments += 'Exceptional!';
            debug(each.comments, {"country": each.country, "amount": each.amount});
<% if(applicationLogging){ -%>
            log.info(each.comments, {"country": each.country, "amount": each.amount});
<% } -%>
        } else if (each.amount < 150) {
            each.criticality = 1;
        } else {
            each.criticality = 2;
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
            debug('Boosted ID:', ID);
<% if(em){ -%>
            em.tx(req).emit('<%= emNamespace %>/<%= projectName %>/topic/boost', { "ID": ID });
<% } -%>
            return {};
        } catch (err) {
            console.error(err);
            return {};
        }
    });
<% if(em && !multiTenant){ -%>

    em.on('<%= emNamespace %>/<%= projectName %>/topic/boost', async msg => {
        debug('Event Mesh: Boost:', msg.data);
        try {
            await db.tx(msg).run (
                UPDATE(Sales).with({ comments: 'Boosted! Mesh!' }).where({ ID: { '=': msg.data.ID } })
            );
        } catch (err) {
            console.error(err);
        }
    });
<% } -%>
<% } -%>

<% if(em && !multiTenant){ -%>
<% if(apiS4HCSO && hana){ -%>
    em.on('sap/S4HANAOD/<%= emClientId %>/ce/sap/s4/beh/salesorder/v1/SalesOrder/Changed/v1', async msg => {
        debug('Event Mesh: SalesOrder Changed:', msg.data);
        try {
            const cql = SELECT.one(SalesOrders).where({ SalesOrder: msg.data.SalesOrder });
            const tx = s4hcso.transaction(msg);
            const res = await tx.send({
                query: cql,
                headers: {
                    'Application-Interface-Key': <% if(credStore !== ''){ -%>await credStore.readCredentialValue('<%= credStoreNS %>', 'password', 'ApplicationInterfaceKey')<% } else { -%>process.env.ApplicationInterfaceKey<% } -%>,
<% if (APIKeyHubSandbox !== ""){ -%>
                    'APIKey': <% if(credStore !== ''){ -%>await credStore.readCredentialValue('<%= credStoreNS %>', 'password', 'APIKeyHubSandbox')<% } else { -%>process.env.APIKeyHubSandbox<% } -%>
<% } -%>

                }
            });
            await db.tx(msg).run (
                INSERT.into(SalesOrdersLog).entries({ salesOrder: msg.data.SalesOrder, incotermsLocation1: res.IncotermsLocation1 })
            );
        } catch (err) {
            console.error(err);
            return {};
        }
    });
<% } -%>

<% if(apiS4HCBP && hana){ -%>
    const { BusinessPartner, BusinessPartnerRole, BusinessPartnerAddress, AddressPhoneNumber, AddressEmailAddress } = require('@sap/cloud-sdk-vdm-business-partner-service');

    const STATUS = { KICK_OFF: 1, OK: 2, FOLLOW_UP: 3, CRITICAL: 4, CLOSED: 5};

    function setCriticality(status) {
        switch (status) {
            case STATUS.KICK_OFF:
                return 0; // grey
            case STATUS.OK:
                return 3; // green
            case STATUS.FOLLOW_UP:
                return 2; // yellow
            case STATUS.CRITICAL:
                return 1; // red
            case STATUS.CLOSED:
                return 0;
            default:
                return 0;
        }
    };

    const getBusinessPartner = async function (key) {
        return new Promise((resolve, reject) => {
            BusinessPartner.requestBuilder()
                .getByKey(key)
                .select(
                    BusinessPartner.BUSINESS_PARTNER,
                    BusinessPartner.CUSTOMER,
                    BusinessPartner.FIRST_NAME,
                    BusinessPartner.LAST_NAME,
                    BusinessPartner.CORRESPONDENCE_LANGUAGE,
                    BusinessPartner.TO_BUSINESS_PARTNER_ROLE.select(
                        BusinessPartnerRole.BUSINESS_PARTNER_ROLE
                    ),
                    BusinessPartner.TO_BUSINESS_PARTNER_ADDRESS.select(
                        BusinessPartnerAddress.BUSINESS_PARTNER,
                        BusinessPartnerAddress.ADDRESS_ID,
                        BusinessPartnerAddress.COUNTRY,
                        BusinessPartnerAddress.CITY_NAME,
                        BusinessPartnerAddress.TO_EMAIL_ADDRESS.select(
                            AddressEmailAddress.EMAIL_ADDRESS
                        ),
                        BusinessPartnerAddress.TO_PHONE_NUMBER.select(
                            AddressPhoneNumber.PHONE_NUMBER
                        )
                    )
                )
                .withCustomHeaders({
                    'Application-Interface-Key': <% if(credStore !== ''){ -%>await credStore.readCredentialValue('<%= credStoreNS %>', 'password', 'ApplicationInterfaceKey')<% } else { -%>process.env.ApplicationInterfaceKey<% } -%>,
<% if (APIKeyHubSandbox !== ""){ -%>
                    'APIKey': <% if(credStore !== ''){ -%>await credStore.readCredentialValue('<%= credStoreNS %>', 'password', 'APIKeyHubSandbox')<% } else { -%>process.env.APIKeyHubSandbox<% } -%>
<% } -%>

                })
                .execute({ 
                    destinationName: cds.env.requires.API_BUSINESS_PARTNER.credentials.destination
                })
                .then((res) => {
                    if (res) {
                        resolve(res);
                    } else {
                        const errmsg = 'getBusinessPartner - Error: Business Partner not found!';
                        debug(errmsg);
                        reject(errmsg);
                        }
                }).catch((err) => {
                    console.error(err.message);
                    debug('getBusinessPartner - Error:', err.message, err.stack);
                })
        })
    };

    function setBusinessPartnerProperties(msg, bp) {
        const address = bp.toBusinessPartnerAddress && bp.toBusinessPartnerAddress[0];
        const properties = {
            customerName: bp.firstName + ' ' + bp.lastName,
            customerId: bp.businessPartner,
            customerLanguage: bp.correspondenceLanguage,
            customerCountry: address.country,
            customerCity: address.cityName,
            backendEventTime: msg.headers.time || new Date().toISOString(),
            backendEventType: msg.headers.type || '-',
            backendEventSource: msg.headers.source || '-'
        };
        if (address.toEmailAddress && address.toEmailAddress.length > 0) {
            properties.customerMail = address.toEmailAddress[0].emailAddress;
        }
        if (address.toPhoneNumber && address.toPhoneNumber.length > 0) {
            properties.customerPhone = address.toPhoneNumber[0].phoneNumber;
        }
        let backendURL = '';
        let bpCreds = cds.env.requires.API_BUSINESS_PARTNER.credentials;
        if (bpCreds.destination && bpCreds.path) {
            backendURL = bpCreds.destination + '/' + bpCreds.path;
        } else if (bpCreds.url) {
            backendURL = bpCreds.url;
        }
        properties.backendURL = backendURL + `/A_BusinessPartner('` + bp.businessPartner + `')`;
        return properties;
    };

    function isBusinessPartnerRelevant(bp) {
        if (!bp.toBusinessPartnerRole || bp.toBusinessPartnerRole.length < 1) {
            return false;
        }
        if (!bp.toBusinessPartnerAddress || bp.toBusinessPartnerAddress.length < 1) {
            return false;
        }
        if (!bp.toBusinessPartnerRole.find(o => o.businessPartnerRole === process.env.BusinessPartnerRole)) {
            return false;
        }
        if (!bp.toBusinessPartnerAddress.find(o => o.country === process.env.BusinessPartnerCountry)) {
            return false;
        }
        return true;
    };

    async function processBusinessPartner(event, msg) {
        const bp = await getBusinessPartner(msg.data.BusinessPartner);
        debug('processBusinessPartner - Info:', event, bp);
        const properties = setBusinessPartnerProperties(msg, bp);
        try {
            const bpExists = await db.tx(msg).run (
                SELECT.one.from(CustomerProcesses).where({ customerId: bp.businessPartner })
            );
            if (bpExists) {
                if (event === 'Changed') {
                    if (!bp.toBusinessPartnerAddress.find(o => o.country === process.env.BusinessPartnerCountry)) {
                        properties.status_statusId = STATUS.CLOSED;
                    } else if (bpExists.status_statusId === STATUS.CRITICAL) {
                        properties.status_statusId = bpExists.status_statusId;
                    } else {
                        properties.status_statusId = STATUS.FOLLOW_UP;
                    }
                    properties.criticality = setCriticality(properties.status_statusId);
                    const updated = await db.tx(msg).run (
                        UPDATE(CustomerProcesses).where({ ID:  bpExists.ID }).set(properties)
                    );
                    debug('processBusinessPartner - BusinessPartner updated:', bpExists.ID, properties, updated);
                } else {
                    debug('processBusinessPartner - BusinessPartner already exists:', event, bpExists.ID);
                }
            } else if (isBusinessPartnerRelevant(bp)) {
                properties.customerCondition_conditionId = 1;
                properties.status_statusId = STATUS.KICK_OFF;
                properties.criticality = setCriticality(properties.status_statusId);
                const inserted = await db.tx(msg).run (
                    INSERT.into(CustomerProcesses).entries(properties)
                );
                debug('processBusinessPartner - BusinessPartner created:', properties, inserted.results);
            }
        } catch (err) {
            console.error(err);
        }
        return;
    };

    em.on('sap/S4HANAOD/S4H1/ce/sap/s4/beh/businesspartner/v1/BusinessPartner/Created/v1', async msg => {
        debug('Event Mesh: BusinessPartner Created:', msg.data);
        try {
            await processBusinessPartner('Created', msg);
        } catch (err) {
            console.error(err);
        }
    });

    em.on('sap/S4HANAOD/S4H1/ce/sap/s4/beh/businesspartner/v1/BusinessPartner/Changed/v1', async msg => {
        debug('Event Mesh: BusinessPartner Changed:', msg.data);
        try {
            await processBusinessPartner('Changed', msg);
        } catch (err) {
            console.error(err);
        }
    });

    this.before('UPDATE', CustomerProcesses, async (req) => {
        if (req.data.status_statusId) {
            req.query.UPDATE.data.criticality = setCriticality(req.data.status_statusId);
        }
    });
<% } -%>

<% if(apiSFSFRC && hana){ -%>
    em.on('<%= emNamespace %>/<%= projectName %>/candidate/updated', async msg => {
        debug('Event Mesh: Candidate Updated:', msg.headers);
        try {
            await db.tx(msg).run (
                INSERT.into(CandidatesLog).entries({ candidateId: msg.headers.candidateId, cellPhone: msg.headers.cellPhone })
            );
        } catch (err) {
            console.error(err);
        }
    });
<% } -%>

<% if(apiSFSFEC){ -%>
    em.on('<%= emNamespace %>/<%= projectName %>/employee/transfer', async msg => {
        debug('Event Mesh: Employee Transfer: Message Payload:', msg.headers);
        try {
<% if(hana){ -%>
            await db.tx(msg).run (
                INSERT.into(EmployeeJobsLog).entries({ seqNumber: msg.headers.seqNumber, startDate: msg.headers.startDate, userId: msg.headers.userId, location: msg.headers.location, eventReason: msg.headers.eventReason })
            );
<% } -%>
<% if(apiARIBWS){ -%>
            let dest = await utils.getDestination('<%= projectName %>-ariba-ws');
            let soapURL = dest.destinationConfiguration.URL + '/Buyer/soap/' + dest.destinationConfiguration.Realm + '/RequisitionImportPull';
            let soapHeaders = {
                'user-agent': '<%= projectName %>-ariba-ws',
                'Authorization': dest.authTokens[0].http_header.value,
                'Content-Type': 'text/xml;charset=UTF-8',
                'Application-Interface-Key': <% if(credStore !== ''){ -%>await credStore.readCredentialValue('<%= credStoreNS %>', 'password', 'ApplicationInterfaceKey')<% } else { -%>process.env.ApplicationInterfaceKey<% } -%>,

                'soapAction': ''
            };
            let soapXML = fs.readFileSync(path.resolve(__dirname, 'templates/AribaBuyerEnvelope.xml'), 'utf-8');
            // TODO configure relevant SOAP XML
            debug('Event Mesh: Employee Transfer: SOAP Request:', soapURL, soapHeaders, soapXML);
            (async () => {
                const { response } = await soapRequest({ url: soapURL, headers: soapHeaders, xml: soapXML, timeout: 10000 });
                const { headers, body, statusCode } = response;
                debug('Event Mesh: Employee Transfer: SOAP Response:', headers, body, statusCode);
            })();
<% } -%>
        } catch (err) {
            console.error(err);
        }
    });
<% } -%>
<% } -%>

<% if(hanaNative){ -%>
    this.on('topSales', async (req) => {
        try {
            const tx = cds.tx(req);
            const results = await tx.run(`CALL "<%= projectName.toUpperCase() %>_DB_SP_TopSales"(?,?)`, [req.data.amount]);
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
            const tx = s4hcso.transaction(req);
            return await tx.send({
                query: req.query,
                headers: {
                    'Application-Interface-Key': <% if(credStore !== ''){ -%>await credStore.readCredentialValue('<%= credStoreNS %>', 'password', 'ApplicationInterfaceKey')<% } else { -%>process.env.ApplicationInterfaceKey<% } -%>,
<% if (APIKeyHubSandbox !== ""){ -%>
                    'APIKey': <% if(credStore !== ''){ -%>await credStore.readCredentialValue('<%= credStoreNS %>', 'password', 'APIKeyHubSandbox')<% } else { -%>process.env.APIKeyHubSandbox<% } -%>
<% } -%>

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
            const tx2 = s4hcso.transaction(req);
            const res2 = await tx2.send({
                query: cql,
                headers: {
                    'Application-Interface-Key': <% if(credStore !== ''){ -%>await credStore.readCredentialValue('<%= credStoreNS %>', 'password', 'ApplicationInterfaceKey')<% } else { -%>process.env.ApplicationInterfaceKey<% } -%>,
<% if (APIKeyHubSandbox !== ""){ -%>
                    'APIKey': <% if(credStore !== ''){ -%>await credStore.readCredentialValue('<%= credStoreNS %>', 'password', 'APIKeyHubSandbox')<% } else { -%>process.env.APIKeyHubSandbox<% } -%>
<% } -%>

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

<% if(apiS4HCBP){ -%>
    this.on('READ', BusinessPartners, async (req) => {
        try {
            const tx = s4hcbp.transaction(req);
            return await tx.send({
                query: req.query,
                headers: {
                    'Application-Interface-Key': <% if(credStore !== ''){ -%>await credStore.readCredentialValue('<%= credStoreNS %>', 'password', 'ApplicationInterfaceKey')<% } else { -%>process.env.ApplicationInterfaceKey<% } -%>,
<% if (APIKeyHubSandbox !== ""){ -%>
                    'APIKey': <% if(credStore !== ''){ -%>await credStore.readCredentialValue('<%= credStoreNS %>', 'password', 'APIKeyHubSandbox')<% } else { -%>process.env.APIKeyHubSandbox<% } -%>
<% } -%>

                }
            })
        } catch (err) {
            req.reject(err);
        }
    });
<% } -%>

<% if(apiSFSFRC){ -%>
    this.on('READ', Candidates, async (req) => {
        try {
            const tx = sfrcm.transaction(req);
            return await tx.send({
                query: req.query,
                headers: {
                    'Application-Interface-Key': <% if(credStore !== ''){ -%>await credStore.readCredentialValue('<%= credStoreNS %>', 'password', 'ApplicationInterfaceKey')<% } else { -%>process.env.ApplicationInterfaceKey<% } -%>,
<% if (APIKeyHubSandbox !== ""){ -%>
                    'APIKey': <% if(credStore !== ''){ -%>await credStore.readCredentialValue('<%= credStoreNS %>', 'password', 'APIKeyHubSandbox')<% } else { -%>process.env.APIKeyHubSandbox<% } -%>
<% } -%>

                }
            })
        } catch (err) {
            req.reject(err);
        }
    });
<% } -%>

<% if(apiSFSFEC){ -%>
    this.on('READ', EmployeeJobs, async (req) => {
        try {
            const tx = sfecei.transaction(req);
            return await tx.send({
                query: req.query,
                headers: {
                    'Application-Interface-Key': <% if(credStore !== ''){ -%>await credStore.readCredentialValue('<%= credStoreNS %>', 'password', 'ApplicationInterfaceKey')<% } else { -%>process.env.ApplicationInterfaceKey<% } -%>,
<% if (APIKeyHubSandbox !== ""){ -%>
                    'APIKey': <% if(credStore !== ''){ -%>await credStore.readCredentialValue('<%= credStoreNS %>', 'password', 'APIKeyHubSandbox')<% } else { -%>process.env.APIKeyHubSandbox<% } -%>
<% } -%>

                }
            })
        } catch (err) {
            req.reject(err);
        }
    });
<% } -%>

<% if(apiARIBPO){ -%>
    this.on('READ', PurchaseOrders, async (req) => {
        try {
            const tx = aribapo.transaction(req);
            return await tx.send({
                query: req.query,
                headers: {
                    'Application-Interface-Key': <% if(credStore !== ''){ -%>await credStore.readCredentialValue('<%= credStoreNS %>', 'password', 'ApplicationInterfaceKey')<% } else { -%>process.env.ApplicationInterfaceKey<% } -%>,
<% if (APIKeyHubSandbox !== ""){ -%>
                    'APIKey': <% if(credStore !== ''){ -%>await credStore.readCredentialValue('<%= credStoreNS %>', 'password', 'APIKeyAriba')<% } else { -%>process.env.APIKeyAriba<% } -%>,
                    'X-ARIBA-NETWORK-ID': <% if(credStore !== ''){ -%>await credStore.readCredentialValue('<%= credStoreNS %>', 'password', 'AribaNetworkId')<% } else { -%>process.env.AribaNetworkId<% } -%>
<% } -%>

                }
            })
        } catch (err) {
            req.reject(err);
        }
    });
<% } -%>

<% if(apiFGCN){ -%>
    this.on('READ', [JobPosting, WorkOrder], async (req) => {
        try {
            const tx = fgcn.transaction(req);
            return await tx.send({
                query: req.query
            })
        } catch (err) {
            req.reject(err);
        }
    });

    this.on('jobSeekerSubmit', async (req) => {
        try {
            return await fgcnAPI.jobSeekerSubmit(req);
        } catch (err) {
            req.reject(err);
        }
    });

    this.on('workOrderRespond', async (req) => {
        try {
            return await fgcnAPI.workOrderRespond(req);
        } catch (err) {
            req.reject(err);
        }
    });
<% } -%>

<% if(apiFGAP){ -%>
    this.on('READ', [Approvals, RejectReasons], async (req) => {
        try {
            const tx = fgap.transaction(req);
            return await tx.send({
                query: req.query,
                headers: {
<% if (APIKeyHubSandbox !== ""){ -%>
                    'APIKey': <% if(credStore !== ''){ -%>await credStore.readCredentialValue('<%= credStoreNS %>', 'password', 'APIKeyHubSandbox')<% } else { -%>process.env.APIKeyHubSandbox<% } -%>
<% } -%>

                }
            })
        } catch (err) {
            req.reject(err);
        }
    });
<% } -%>

<% if(apiCONC){ -%>
    this.on('READ', [ExpenseUsers, ExpenseReports], async (req) => {
        try {
            let accessToken = await utils.getAccessToken('<%= projectName %>-concur-api','refresh_token');
            const tx = conc.transaction(req);
            return await tx.send({
                query: req.query,
                headers: {
                    'Application-Interface-Key': <% if(credStore !== ''){ -%>await credStore.readCredentialValue('<%= credStoreNS %>', 'password', 'ApplicationInterfaceKey')<% } else { -%>process.env.ApplicationInterfaceKey<% } -%>,
                    'Authorization': 'Bearer ' + accessToken

                }
            })
        } catch (err) {
            req.reject(err);
        }
    });
<% } -%>

<% if(apiGRAPH){ -%>
<% graphDataSources.forEach(element => { -%>
    this.on('READ', [<%= element.entity %>], async (req) => {
        try {
            const tx = <%= element.shortName %>.transaction(req);
            return await tx.send({
                query: req.query
            })
        } catch (err) {
            req.reject(err);
        }
    });

<% }); -%>
<% } -%>

<% if(apiHERE){ -%>
    this.on('READ', Geocodes, async (req) => {
        try {
            const tx = HERE.transaction(req);
            return await tx.send({
                query: req.query
            })
        } catch (err) {
            req.reject(err);
        }
    });

<% if(hana){ -%>
    this.on('geocode', Sales, async (req) => {
        try {
            const tx1 = cds.tx(req);
            const ID = req.params[0];
            debug('Geocode ID:', ID);
            const res1 = await tx1.read(Sales)
                .where({ ID: { '=': ID } })
                ;
            let results = {};
            results.region = res1[0].region;
            results.country = res1[0].country;
            results.amount = res1[0].amount;
            let cql = SELECT.one(Geocodes).where({ title: results.country });
            const tx2 = HERE.transaction(req);
            const res2 = await tx2.send({
                query: cql
            });
            results.countryCode = res2[0].address.countryCode;
            results.position = {};
            results.position.lat = res2[0].position.lat;
            results.position.lng = res2[0].position.lng;
            return results;
        } catch (err) {
            req.reject(err);
        }
    });
<% } -%>
<% } -%>

<% if(apiNeoWs){ -%>
    this.on('READ', Asteroids, async (req) => {
        try {
            const tx = NeoWs.transaction(req);
            return await tx.send({
                query: req.query
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
        results.scopes = {};
        results.scopes.identified = req.user.is('identified-user');
        results.scopes.authenticated = req.user.is('authenticated-user');
<% if(authorization){ -%>
        results.scopes.Viewer = req.user.is('Viewer');
        results.scopes.Admin = req.user.is('Admin');
<% } -%>
<% if(multiTenant){ -%>
        results.tenant = req.user.tenant;
        results.scopes.ExtendCDS = req.user.is('ExtendCDS');
        results.scopes.ExtendCDSdelete = req.user.is('ExtendCDSdelete');
<% } -%>
<% if(attributes){ -%>
        results.attrs = {};
        if (req.user.hasOwnProperty('attr')) {
            results.attrs.Region = req.user.attr.Region;
        }
<% } -%>
<% if(em){ -%>
        em.tx(req).emit('<%= emNamespace %>/<%= projectName %>/topic/user', results);
<% } -%>
        return results;
    });
<% if(em && !multiTenant){ -%>

    em.on('<%= emNamespace %>/<%= projectName %>/topic/user', async msg => {
        debug('Event Mesh: User:', msg.data);
    });
<% } -%>
<% } -%>

});