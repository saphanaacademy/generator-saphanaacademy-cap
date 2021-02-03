using {<%= projectName %>.db as <%= projectName %>} from '../db/data-model';

<% if(api){ -%>
using { API_SALES_ORDER_SRV as external } from './external/API_SALES_ORDER_SRV.csn';
<% } -%>

service CatalogService @(path : '/catalog')
<% if(authentication){ -%>
@(requires: 'authenticated-user')
<% } -%>
{
    @readonly
    entity Sales
<% if(authorization){ -%>
      @(restrict: [{ 
                     to: 'Viewer'
<% if(attributes){ -%>
                    ,where: 'region = $user.Region' 
<% } -%>
                  }])
<% } -%>
      as select * from <%= projectName %>.Sales;

<% if(hanaNative){ -%>
    function topSales
<% if(authorization){ -%>
      @(restrict: [{ to: 'Viewer' }])
<% } -%>
      (amount: Integer)
      returns many Sales;
<% } -%>

<% if(api){ -%>
    @readonly
    entity SalesOrders 
<% if(authorization){ -%>
      @(restrict: [{ to: 'Viewer' }])
<% } -%>
      as projection on external.A_SalesOrder {
          SalesOrder,
          SalesOrganization,
          DistributionChannel,
          SoldToParty,
          TotalNetAmount,
          TransactionCurrency
        };
<% } -%>

<% if(authorization){ -%>
    entity SalesAdmin
      @(restrict: [{ to: 'Admin' }])
      as select * from <%= projectName %>.Sales
      actions { action submitBoost(); };
<% } -%>

<% if(authentication){ -%>
    type userRoles { identified: Boolean; authenticated: Boolean; <% if(authorization){ -%>Viewer: Boolean; Admin: Boolean; <% } -%><% if(multiTenant){ -%>Callback: Boolean; ExtendCDS: Boolean; ExtendCDSdelete: Boolean; <% } -%>};
<% if(attributes){ -%>
    type userAttrs { Region: many String; };
<% } -%>
    type user { user: String; locale: String; <% if(multiTenant){ -%>tenant: String; <% } -%>roles: userRoles; <% if(attributes){ -%>attrs: userAttrs; <% } -%>};
    function userInfo() returns user;
<% } -%>
};
