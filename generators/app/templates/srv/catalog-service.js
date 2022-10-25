const cds = require('@sap/cds');
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
<% if(app2appType === "access"){ -%>
const httpClient = require('@sap-cloud-sdk/http-client');
<% } -%>
<% if(app2appType === "access" && app2appMethod.includes("machine")){ -%>
const axios = require('axios');
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
<% if(multiTenant && common){ -%>
const dbClass = require('sap-hdbext-promisfied');
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
<% if(apiSACTenant){ -%>
    const SACTenant = await cds.connect.to('SACTenant');
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
<% if(app2appType === "access"){ -%>
    //const <%= app2appName %>CatalogService = await cds.connect.to('<%= app2appName %>_CatalogService');
    //const { Sales } = <%= app2appName %>CatalogService.entities;
<% } -%>

    const {
<% if(hana){ -%>
            Sales
<% if(apiAICORE){ -%>
            ,
            Anomalies
<% } -%>
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
<% if(apiSACTenant){ -%>
<% if(hana || apiS4HCBP || apiS4HCSO || apiSFSFRC || apiSFSFEC || apiARIBPO || apiFGCN || apiFGAP || apiGRAPH){ -%>
            ,
<% } -%>
            Stories
<% } -%>
<% if(apiHERE){ -%>
<% if(hana || apiS4HCBP || apiS4HCSO || apiSFSFRC || apiSFSFEC || apiARIBPO || apiFGCN || apiFGAP || apiCONC || apiGRAPH || apiSACTenant){ -%>
            ,
<% } -%>
            Geocodes
<% } -%>
<% if(apiNeoWs){ -%>
<% if(hana || apiS4HCBP || apiS4HCSO || apiSFSFRC || apiSFSFEC || apiARIBPO || apiFGCN || apiFGAP || apiCONC || apiGRAPH || apiSACTenant || apiHERE){ -%>
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

    this.on('boost', Sales, async req => {
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
            const cs = await cds.connect.to('CatalogService');
            let results = await cs.read(SELECT.from(Sales, ID));
            return results;
        } catch (err) {
            req.reject(err);
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
<% if(apiAICORE){ -%>

    this.after('READ', Anomalies, (each) => {
<% if(AICoreModelType === 'image'){ -%>
        if (each.confidence === null) {
            each.criticality = 0;
        } else if (each.confidence == 0) {
            each.criticality = 3;
        } else if (each.confidence > 0.2) {
            each.criticality = 1;
        } else {
            each.criticality = 2;
        }
<% } else if(AICoreModelType === 'sound'){ -%>
        if (each.anomalyType === null) {
            each.criticality = 0;
        } else if (each.anomalyType === 'OK') {
            each.criticality = 3;
        } else {
            each.criticality = 2;
        }
<% } -%>
    });

    this.on('predict', Anomalies, async (req) => {
        try {
            const ID = req.params[0];
            let headers = {
                'Content-Type': 'application/json'
            };
            const tx = cds.tx(req);
            let data = await tx.read(Anomalies)
                .byKey(ID)
                .columns(['<%= AICoreModelType %>'])
                ;
            data['<%= AICoreModelType %>'] = data['<%= AICoreModelType %>'].substring(22);
            const AICore = await cds.connect.to("AICore");
            const res = await AICore
                .tx(req)
                .send("POST", process.env.AICoreDeploymentId + '/v1/models/' + process.env.AICoreModel + ':predict', data, headers)
                ;
            debug('predict ID:', ID, res);
            var confidence;
<% if(AICoreModelType === 'image'){ -%>
            var segmentedImage;
            if (res.defected_area != 0) {
                confidence = res.defected_area * 100;
                segmentedImage = 'data:image/bmp;base64,' + res.segmented_image;
            } else {
                confidence = 0.000;
            }
<% } else if(AICoreModelType === 'sound'){ -%>
            var anomalyType;
            if (res.hasOwnProperty('ok')) {
                confidence = res.ok;
                anomalyType = 'OK';
            } else if (res.hasOwnProperty('Slow_Sound')) {
                confidence = res.Slow_Sound;
                anomalyType = 'Slow sound with under perfomance';
            } else if (res.hasOwnProperty('Damage_Noise')) {
                confidence = res.Damage_Noise;
                anomalyType = 'Damage noise with cracking';
            }
<% } -%>
            await tx.update(Anomalies, ID)
                .with({
                    detectedAt: new Date(),
                    confidence: confidence,
<% if(AICoreModelType === 'image'){ -%>
                    segmentedImage: segmentedImage
<% } else if(AICoreModelType === 'sound'){ -%>
                    anomalyType: anomalyType
<% } -%>
                })
                ;
            const cs = await cds.connect.to('CatalogService');
            let results = await cs.read(SELECT.from(Anomalies, ID));
            return results;
        } catch (err) {
            req.reject(err);
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
                query: cql
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
        debug('Event Mesh: Candidate Updated:', msg.data);
        try {
            await db.tx(msg).run (
                INSERT.into(CandidatesLog).entries({ candidateId: msg.data.candidateId, cellPhone: msg.data.cellPhone })
            );
        } catch (err) {
            console.error(err);
        }
    });
<% } -%>

<% if(apiSFSFEC){ -%>
    em.on('<%= emNamespace %>/<%= projectName %>/employee/transfer', async msg => {
        debug('Event Mesh: Employee Transfer: Message Payload:', msg.data);
        try {
<% if(hana){ -%>
            await db.tx(msg).run (
                INSERT.into(EmployeeJobsLog).entries({ seqNumber: msg.data.seqNumber, startDate: msg.data.startDate, userId: msg.data.userId, location: msg.data.location, eventReason: msg.data.eventReason })
            );
<% } -%>
<% if(apiARIBWS){ -%>
            let dest = await utils.getDestination('<%= projectName %>-ariba-ws');
            let soapURL = dest.destinationConfiguration.URL + '/Buyer/soap/' + dest.destinationConfiguration.Realm + '/RequisitionImportPull';
            let soapHeaders = {
                'user-agent': '<%= projectName %>-ariba-ws',
                'Authorization': dest.authTokens[0].http_header.value,
                'Content-Type': 'text/xml;charset=UTF-8',
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
            return results.RESULT;
        } catch (err) {
            req.reject(err);
        }
    });
<% } -%>

<% if(apiS4HCSO){ -%>
    this.on('READ', SalesOrders, async (req) => {
        try {
            const tx = s4hcso.transaction(req);
            return await tx.send({
                query: req.query
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
                query: cql
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
                query: req.query
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
                query: req.query
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
                query: req.query
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
                query: req.query
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
                query: req.query
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

<% if(apiSACTenant){ -%>
    this.on('READ', Stories, async (req) => {
        try {
            const tx = SACTenant.transaction(req);
            return await tx.send({
                query: req.query
            })
        } catch (err) {
            req.reject(err);
        }
    });
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

<% if(multiTenant && common){ -%>
    this.on('common', async req => {
        try {
            let db = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(null)));
            let sql = `SELECT COUNT(*) AS "count" FROM "<%= projectName %>.dbcommon::Jurisdictions"`;
            const statement = await db.preparePromisified(sql);
            const results = await db.statementExecPromisified(statement, []);
            return results;
        } catch (err) {
            console.error(err);
        }
    });
<% } -%>

<% if(authentication){ -%>
    this.on('userInfo', req => {
        let results = {};
        results.user = cds.context.user.id;
        results.locale = cds.context.locale;
        results.scopes = {};
        results.scopes.identified = req.user.is('identified-user');
        results.scopes.authenticated = req.user.is('authenticated-user');
<% if(authorization){ -%>
        results.scopes.Viewer = req.user.is('Viewer');
        results.scopes.Admin = req.user.is('Admin');
<% } -%>
<% if(multiTenant){ -%>
        results.tenant = cds.context.tenant;
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

<% if(app2appType === "access"){ -%>
<% if(app2appMethod.includes("user")){ -%>
    this.on('<%= app2appName %>User', async req => {
        try {
            debug('TokenPayload:', cds.context.http.req.authInfo.getTokenInfo().getPayload());
            let res = await httpClient.executeHttpRequest({ destinationName: '<%= projectName %>-<%= app2appName %>'}, {
                method: 'GET',
                url: 'catalog/',
                headers: {
                    Authorization: req.headers.authorization
                }
            });
            return res.data;
            /*
            options = {
                method: 'GET',
                url: 'https://<%= cforg %>-<%= cfspace %>-<%= app2appName %>-srv.cfapps.<%= cfregion %>.hana.ondemand.com/catalog/',
                headers: {
                    Authorization: req.headers.authorization
                }
            };
            let res = await axios(options);
            return res.data;
            */
            /*
            let res = await <%= app2appName %>CatalogService.tx(req).send({
                query: SELECT.from(Sales),
                headers: {'Authorization': req.headers.authorization}
            });
            return [res];
            */
        } catch (err) {
            req.reject(err);
        }
    });
<% } -%>

<% if(app2appMethod.includes("machine")){ -%>
    this.on('<%= app2appName %>Tech', async req => {
        try {
            let options1 = {
                method: 'POST',
                url: cds.env.requires.auth.credentials.url + '/oauth/token?grant_type=client_credentials',
                headers: {
                    Authorization: 'Basic ' + Buffer.from(cds.env.requires.auth.credentials.clientid + ':' + cds.env.requires.auth.credentials.clientsecret).toString('base64')
                }
            };
            let res1 = await axios(options1);
            debug('JWT:', res1.data.access_token);
            let res2 = await httpClient.executeHttpRequest({ destinationName: '<%= projectName %>-<%= app2appName %>'}, {
                method: 'GET',
                url: 'catalog/',
                headers: {
                    Authorization: 'Bearer ' + res1.data.access_token
                }
            });
            return res2.data;
            /*
            let options2 = {
                method: 'GET',
                url: 'https://<%= cforg %>-<%= cfspace %>-<%= app2appName %>-srv.cfapps.<%= cfregion %>.hana.ondemand.com/catalog/',
                headers: {
                    Authorization: 'Bearer ' + res1.data.access_token
                }
            };
            let res2 = await axios(options2);
            return res2.data;
            */
            /*
            let res2 = await <%= app2appName %>CatalogService.tx(req).send({
                query: SELECT.from(Sales),
                headers: {'Authorization': 'Bearer ' + res1.data.access_token}
            });
            return [res2];
            */
        } catch (err) {
            req.reject(err);
        }
    });
<% } -%>
<% } -%>
<% } -%>

});