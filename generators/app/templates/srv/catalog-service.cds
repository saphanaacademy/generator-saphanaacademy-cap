<% if(hana){ -%>
using {<%= projectName %>.db as db} from '../db/data-model';
<% } -%>

<% if(hanaNative){ -%>
using {CV_SALES, CV_SESSION_INFO} from '../db/data-model';
<% } -%>

<% if(apiS4HCSO){ -%>
using { API_SALES_ORDER_SRV } from './external/API_SALES_ORDER_SRV.csn';
<% } -%>

<% if(apiS4HCBP){ -%>
using { API_BUSINESS_PARTNER } from './external/API_BUSINESS_PARTNER.csn';
<% } -%>

<% if(apiSFSFRC){ -%>
using { RCMCandidate } from './external/RCMCandidate.csn';
<% } -%>

<% if(apiSFSFEC){ -%>
using { ECEmploymentInformation } from './external/ECEmploymentInformation.csn';
<% } -%>

<% if(apiARIBPO){ -%>
using { AribaNetworkPurchaseOrders } from './external/AribaNetworkPurchaseOrders.csn';
<% } -%>

<% if(apiFGCN){ -%>
using { FieldglassConnectors } from './external/FieldglassConnectors.csn';
<% } -%>

<% if(apiFGAP){ -%>
using { FieldglassApprovals } from './external/FieldglassApprovals.csn';
<% } -%>

<% if(apiCONC){ -%>
using { Concur } from './external/Concur.csn';
<% } -%>

<% if(apiGRAPH){ -%>
<% graphDataSources.forEach(element => { -%>
using {<%= element.name %> as <%= element.shortName %>} from './external/<%= element.name %>';
<% }); -%>
<% } -%>

<% if(apiSACTenant){ -%>
using { SACTenant } from './external/SACTenant.csn';
<% } -%>

<% if(apiHERE){ -%>
using { HERELocationServices } from './external/HERELocationServices.csn';
<% } -%>

<% if(apiNeoWs){ -%>
using { NearEarthObjectWebService } from './external/NearEarthObjectWebService.csn';
<% } -%>

<% if(apiCustom){ -%>
using { <%= customNamespace %> } from './external/<%= customNamespace %>.csn';
<% } -%>

<% if(app2appType === "access"){ -%>
//using { <%= app2appName %>_CatalogService } from './external/<%= app2appName %>-CatalogService.csn';
<% } -%>

service CatalogService @(path : '/catalog')
<% if(authentication){ -%>
@(requires: 'authenticated-user')
<% } -%>
{
<% if(hana){ -%>
<% if(apiHERE){ -%>
    type geocodePosition { lat: Decimal; lng: Decimal; };
    type geocodeSales { region: String; country: String; amount: Integer; countryCode: String; position: geocodePosition; };
<% } -%>
    entity Sales
<% if(authorization){ -%>
      @(restrict: [{ grant: ['READ'],
                     to: 'Viewer'
<% if(attributes){ -%>
                    ,where: 'region = $user.Region' 
<% } -%>
                   },
                   { grant: ['WRITE'],
                     to: 'Admin' 
                   }
                  ])
<% } -%>
      as select * from db.Sales
      actions {
<% if(apiS4HCSO){ -%>
<% if(authorization){ -%>
        @(restrict: [{ to: 'Viewer' }])
<% } -%>
        function largestOrder() returns String;
<% } -%>
<% if(apiHERE){ -%>
<% if(authorization){ -%>
        @(restrict: [{ to: 'Viewer' }])
<% } -%>
        function geocode() returns geocodeSales;
<% } -%>
<% if(authorization){ -%>
        @(restrict: [{ to: 'Admin' }])
<% } -%>
        action boost() returns Sales;
      }
    ;

<% if(apiAICORE){ -%>
    entity Anomalies
<% if(authorization){ -%>
      @(restrict: [{ grant: ['READ'],
                     to: 'Viewer'
                   },
                   { grant: ['WRITE'],
                     to: 'Admin' 
                   }
                  ])
<% } -%>
      as select * from db.Anomalies
      actions {
<% if(authorization){ -%>
        @(restrict: [{ to: 'Admin' }])
<% } -%>
        action predict() returns Anomalies;
      }
    ;
<% } -%>
<% } -%>

<% if(hanaNative){ -%>
    @readonly
    entity VSales
<% if(authorization){ -%>
      @(restrict: [{ to: 'Viewer' }])
<% } -%>
      as select * from CV_SALES
    ;

    @readonly
    entity SessionInfo
<% if(authorization){ -%>
      @(restrict: [{ to: 'Viewer' }])
<% } -%>
      as select * from CV_SESSION_INFO
    ;

    function topSales
<% if(authorization){ -%>
      @(restrict: [{ to: 'Viewer' }])
<% } -%>
      (amount: Integer)
      returns many Sales;
<% } -%>

<% if(apiS4HCSO){ -%>
    @readonly
    entity SalesOrders
<% if(authorization){ -%>
      @(restrict: [{ to: 'Viewer' }])
<% } -%>
      as projection on API_SALES_ORDER_SRV.A_SalesOrder {
          SalesOrder,
          SalesOrganization,
          DistributionChannel,
          SoldToParty,
          IncotermsLocation1,
          TotalNetAmount,
          TransactionCurrency
        };

<% if(em && hana){ -%>
    entity SalesOrdersLog
<% if(authorization){ -%>
      @(restrict: [{ to: 'Viewer' }])
<% } -%>
      as select * from db.SalesOrdersLog
    ;
<% } -%>
<% } -%>

<% if(apiS4HCBP){ -%>
    @readonly
    entity BusinessPartners
<% if(authorization){ -%>
      @(restrict: [{ to: 'Viewer' }])
<% } -%>
      as projection on API_BUSINESS_PARTNER.A_BusinessPartner {
          BusinessPartner,
          Customer,
          FirstName,
          LastName,
          CorrespondenceLanguage
        };
<% if(em && hana){ -%>

    @odata.draft.enabled
    entity CustomerProcesses
<% if(authorization){ -%>
      @(restrict: [{ to: 'Viewer' }])
<% } -%>
      as projection on db.CustomerProcesses
    ;

    @readonly
    entity Conditions
<% if(authorization){ -%>
      @(restrict: [{ to: 'Viewer' }])
<% } -%>
      as projection on db.Conditions
    ;

    @readonly
    entity Status
<% if(authorization){ -%>
      @(restrict: [{ to: 'Viewer' }])
<% } -%>
      as projection on db.Status
      ;
<% } -%>
<% } -%>

<% if(apiSFSFRC){ -%>
    @readonly
    entity Candidates
<% if(authorization){ -%>
      @(restrict: [{ to: 'Viewer' }])
<% } -%>
      as projection on RCMCandidate.Candidate {
          candidateId,
          firstName,
          lastName,
          cellPhone,
          city,
          zip,
          country
        };

<% if(em && hana){ -%>
    entity CandidatesLog
<% if(authorization){ -%>
      @(restrict: [{ to: 'Viewer' }])
<% } -%>
      as select * from db.CandidatesLog
    ;
<% } -%>
<% } -%>

<% if(apiSFSFEC){ -%>
    @readonly
    entity EmployeeJobs
<% if(authorization){ -%>
      @(restrict: [{ to: 'Viewer' }])
<% } -%>
      as projection on ECEmploymentInformation.EmpJob {
          seqNumber,
          startDate,
          userId,
          location,
          costCenter,
          event,
          eventReason
        };

<% if(em && hana){ -%>
    entity EmployeeJobsLog
<% if(authorization){ -%>
      @(restrict: [{ to: 'Viewer' }])
<% } -%>
      as select * from db.EmployeeJobsLog
    ;
<% } -%>
<% } -%>

<% if(apiARIBPO){ -%>
    @readonly
    entity PurchaseOrders
<% if(authorization){ -%>
      @(restrict: [{ to: 'Viewer' }])
<% } -%>
      as projection on AribaNetworkPurchaseOrders.Orders;
<% } -%>

<% if(apiFGCN){ -%>
    @readonly
    entity JobPosting
<% if(authorization){ -%>
      @(restrict: [{ to: 'Viewer' }])
<% } -%>
      as projection on FieldglassConnectors.JobPosting;

    @readonly
    entity WorkOrder
<% if(authorization){ -%>
      @(restrict: [{ to: 'Viewer' }])
<% } -%>
      as projection on FieldglassConnectors.WorkOrder;

<% if(authorization){ -%>
    @(restrict: [{ to: 'Admin' }])
<% } -%>
    action jobSeekerSubmit( jobPostingId: String, startDate: Date, endDate: Date, fullName: String, securityId: String, resumeName: String, resumeMimeType: String, resumeText: String )
      returns {
        TransactionID: String;
        ReturnCode   : String;
        Message      : String;
      };

<% if(authorization){ -%>
    @(restrict: [{ to: 'Admin' }])
<% } -%>
    action workOrderRespond( workOrderId: String, jobSeekerId: String, email: String, startDate: Date, endDate: Date, modificationType: String, comments: String )
      returns {
        TransactionID: String;
        ReturnCode   : String;
        Message      : String;
      };
<% } -%>

<% if(apiFGAP){ -%>
    @readonly
    entity Approvals
<% if(authorization){ -%>
      @(restrict: [{ to: 'Viewer' }])
<% } -%>
      as projection on FieldglassApprovals.Approvals;

    @readonly
    entity RejectReasons
<% if(authorization){ -%>
      @(restrict: [{ to: 'Viewer' }])
<% } -%>
      as projection on FieldglassApprovals.RejectReasons;
<% } -%>

<% if(apiCONC){ -%>
    @readonly
    entity ExpenseUsers
<% if(authorization){ -%>
      @(restrict: [{ to: 'Viewer' }])
<% } -%>
      as projection on Concur.ExpenseUsers;

    @readonly
    entity ExpenseReports
<% if(authorization){ -%>
      @(restrict: [{ to: 'Viewer' }])
<% } -%>
      as projection on Concur.ExpenseReports;
<% } -%>

<% if(apiGRAPH){ -%>
<% graphDataSources.forEach(element => { -%>
    @readonly
    entity <%= element.entity %>
<% if(authorization){ -%>
      @(restrict: [{ to: 'Viewer' }])
<% } -%>
      as projection on <%= element.shortName %>.<%= element.entity %>;

<% }); -%>
<% } -%>

<% if(apiSACTenant){ -%>
    @readonly
    entity Stories
<% if(authorization){ -%>
      @(restrict: [{ to: 'Viewer' }])
<% } -%>
      as projection on SACTenant.Stories;
<% } -%>

<% if(apiHERE){ -%>
    @readonly
    entity Geocodes
<% if(authorization){ -%>
      @(restrict: [{ to: 'Viewer' }])
<% } -%>
      as projection on HERELocationServices.Geocodes;
<% } -%>

<% if(apiNeoWs){ -%>
    @readonly
    entity Asteroids
<% if(authorization){ -%>
      @(restrict: [{ to: 'Viewer' }])
<% } -%>
      as projection on NearEarthObjectWebService.Feed;
<% } -%>

<% customEntities.forEach(element => { -%>
    @readonly
    entity <%= element %>
<% if(authorization){ -%>
      @(restrict: [{ to: 'Viewer' }])
<% } -%>
      as projection on <%= customNamespace %>.<%= element %>;

<% }); -%>

<% if(multiTenant && common){ -%>
    function common() returns Integer;
<% } -%>

<% if(authentication){ -%>
    type userScopes { identified: Boolean; authenticated: Boolean; <% if(authorization){ -%>Viewer: Boolean; Admin: Boolean; <% } -%>};
<% if(attributes){ -%>
    type userAttrs { Region: many String; };
<% } -%>
    type userType { user: String; locale: String; <% if(multiTenant){ -%>tenant: String; <% } -%>scopes: userScopes; <% if(attributes){ -%>attrs: userAttrs; <% } -%>};
    function userInfo() returns userType;
<% } -%>

<% if(app2appType === "access"){ -%>
<% if(app2appMethod.includes("user")){ -%>
<% if(authorization){ -%>
    @(restrict: [{ to: 'Viewer' }])
<% } -%>
    function <%= app2appName %>User() returns String;
<% } -%>

<% if(app2appMethod.includes("machine")){ -%>
<% if(authorization){ -%>
    @(restrict: [{ to: 'Viewer' }])
<% } -%>
    function <%= app2appName %>Tech() returns String;
<% } -%>
<% } -%>

};