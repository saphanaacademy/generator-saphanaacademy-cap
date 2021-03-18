namespace <%= projectName %>.db;

entity Sales {
    key ID       : Integer;
        region   : String(100);
        country  : String(100);
        org      : String(4);
        amount   : Integer;
        comments : String(100);
};

<% if(apiS4HCSO && em){ -%>
using { cuid, managed } from '@sap/cds/common';

entity SalesOrdersLog : cuid, managed {
      salesOrder         : String;
      incotermsLocation1 : String;
};
<% } -%>