<% if(em){ -%>
using { cuid, managed } from '@sap/cds/common';
<% if(apiS4HCBP){ -%>
using { sap.common.CodeList } from '@sap/cds/common';
<% } -%>
<% } -%>

<% if(hanaNative){ -%>
context <%= projectName %>.db {
<% } else { -%>
namespace <%= projectName %>.db;
<% } -%>

<% if(hana){ -%>
entity Sales {
  key ID          : Integer;
      region      : String(100);
      country     : String(100);
      org         : String(4);
      amount      : Integer;
      comments    : String(100);
      criticality : Integer;
};

<% if(srv2){ -%>
entity Students {
  key ID          : Integer;
      name        : String(100);
      site        : String(100);
      gender      : String(100);
      age         : String(100);
      score       : Integer;
};
<% } -%>

<% if(apiAICORE){ -%>
entity Anomalies {
  key ID             : Integer;
      detectedAt     : Timestamp;
      plant          : String(4);
      plantSection   : String(3);
      itemId         : String(20);
      confidence     : Decimal(9, 3);
<% if(AICoreModelType === 'image'){ -%>
      image          : LargeString;
      segmentedImage : LargeString;
<% } else if(AICoreModelType === 'sound'){ -%>
      sound          : LargeString;
      anomalyType    : String(50);
<% } -%>
      criticality    : Integer;
};
<% } -%>
<% } -%>

<% if(em){ -%>

<% if(apiS4HCSO){ -%>
entity SalesOrdersLog : cuid, managed {
      salesOrder         : String;
      incotermsLocation1 : String;
};
<% } -%>

<% if(apiS4HCBP){ -%>
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

<% if(apiSFSFEC){ -%>
entity EmployeeJobsLog : cuid, managed {
      seqNumber   : Integer64;
      startDate   : Date;
      userId      : String;
      location    : String;
      eventReason : LargeString;
};
<% } -%>
<% } -%>

<% if(hanaNative){ -%>
}

@cds.persistence.exists
@cds.persistence.calcview
entity CV_SALES {
  key REGION  : String(100);
      AMOUNT  : Integer;
}

@cds.persistence.exists
@cds.persistence.calcview
entity CV_SESSION_INFO {
  key ITEM     : String(5000);
      VALUE    : String(5000);
}
<% } -%>