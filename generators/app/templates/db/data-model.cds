<% if(hanaNative || hanaTargetHDI !== ""){ -%>
context <%= projectName %>.db {
<% } else { -%>
namespace <%= projectName %>.db;
<% } -%>

<% if(hana){ -%>
entity Sales {
  key ID       : Integer;
      region   : String(100);
      country  : String(100);
      org      : String(4);
      amount   : Integer;
      comments : String(100);
};
<% } -%>

<% if(hanaExternalHDI){ -%>
entity Widgets {
  key ID    : Integer;
      code  : String(10);
      stock : Integer;
};
<% } -%>

<% if(em){ -%>
using { cuid, managed } from '@sap/cds/common';

<% if(apiS4HCSO){ -%>
entity SalesOrdersLog : cuid, managed {
      salesOrder         : String;
      incotermsLocation1 : String;
};
<% } -%>

<% if(apiS4HCBP){ -%>
using { sap.common.CodeList } from '@sap/cds/common';

entity CustomerProcesses : cuid {
      customerName       : String;
      customerId         : String;
      customerPhone      : String;
      customerLanguage   : String;
      customerCountry    : String;
      customerMail       : String;
      customerCity       : String;
      comment            : String(1111) default 'Initial';
      criticality        : Integer      default 1;
      backendEventTime   : String;
      backendEventType   : String;
      backendEventSource : String;
      backendURL         : String;
      status             : Association to Status;
      customerCondition  : Association to Conditions;
};

entity Conditions : CodeList {
  key conditionId : Integer;
};

entity Status : CodeList {
  key statusId : Integer;
};
<% } -%>

<% if(apiSFSFRC){ -%>
entity CandidatesLog : cuid, managed {
      candidateId : Integer;
      cellPhone   : String;
};
<% } -%>
<% } -%>

<% if(hanaNative || hanaTargetHDI !== ""){ -%>
}

<% if(hanaNative){ -%>
@cds.persistence.exists
@cds.persistence.calcview
entity CV_SALES {
  key REGION  : String(100);
      AMOUNT  : Integer;
}
<% } -%>

<% if(hanaTargetHDI !== ""){ -%>
@cds.persistence.exists
entity <%= hanaTargetHDI.toUpperCase().replace(/-/g, '_') %>_WIDGETS {
  key ID    : Integer;
      code  : String(10);
      stock : Integer;
}
<% } -%>
<% } -%>