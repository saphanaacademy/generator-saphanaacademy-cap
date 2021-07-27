using CatalogService as catalog from '../../../srv/catalog-service';

annotate catalog.Sales with @(
    UI: {
        Identification: [ {Value: country} ],
        SelectionFields: [ ],
        LineItem: [
            {Value: ID},
            {Value: region},
            {Value: country},
            {Value: amount},
            {$Type: 'UI.DataFieldForAction', Label: '{i18n>boost}', Action: 'CatalogService.boost', Inline: true},
            {Value: comments}
        ],
        HeaderInfo: {
            TypeName: '{i18n>country}',
            TypeNamePlural: '{i18n>countries}',
            Title: {Value: country},
            Description: {Value: ID}
        }
    }
);

annotate catalog.Sales with {
    ID       @title:'{i18n>ID}' @UI.HiddenFilter;
    region   @title:'{i18n>region}';
    country  @title:'{i18n>country}';
    amount   @title:'{i18n>amount}';
    comments @title:'{i18n>comments}';
};

<% if(apiS4HCSO && em){ -%>
annotate catalog.SalesOrdersLog with @(
    UI: {
        Identification: [ {Value: ID} ],
        SelectionFields: [ ],
        LineItem: [
            {Value: ID},
            {Value: modifiedAt},
            {Value: salesOrder},
            {Value: incotermsLocation1}
        ],
        HeaderInfo: {
            TypeName: '{i18n>salesOrder}',
            TypeNamePlural: '{i18n>salesOrders}',
            Title: {Value: ID},
            Description: {Value: salesOrder}
        }
    }
);

annotate catalog.SalesOrdersLog with {
    ID                 @title:'{i18n>ID}' @UI.HiddenFilter;
    salesOrder         @title:'{i18n>salesOrder}';
    incotermsLocation1 @title:'{i18n>incotermsLocation1}';
};
<% } -%>

<% if(apiS4HCBP && em){ -%>
annotate catalog.CustomerProcesses with @(
    UI: {
        Identification: [
            {Value: ID},
            {Value: backendEventTime},
        ],
        LineItem: [
            {Value: customerId},
            {Value: customerName},
            {Value: customerCondition_conditionId},
            {Value: status_statusId, Criticality: criticality }
        ],
        HeaderInfo: {
            TypeName: '{i18n>type_customer}', 
            TypeNamePlural: '{i18n>type_customer_plural}',
            TypeImageUrl: 'sap-icon://customer',
            Title: { Value: customerName },
            Description: { Value: customerCountry}
        },
        SelectionFields: [ customerId, customerCondition_conditionId, status_statusId ],
        HeaderFacets: [
            {$Type: 'UI.ReferenceFacet', Label: '{i18n>header_facet_relations}', Target: '@UI.FieldGroup#Header'},
        ],
        Facets: [
            {$Type: 'UI.ReferenceFacet', Label: '{i18n>facet_label_customer_details}', Target: '@UI.FieldGroup#Info'},
            {$Type: 'UI.ReferenceFacet', Label: '{i18n>facet_label_manage_relations}', Target: '@UI.FieldGroup#Relation'},
            {$Type: 'UI.ReferenceFacet', Label: '{i18n>facet_label_technical_info}',   Target: '@UI.FieldGroup#TechnicalData'}
        ],
        FieldGroup#Header: {
            Data: [ {Value: status.name, Criticality: criticality} ]
        },
        FieldGroup#Info: {
            Data: [
                {Value: customerName},
                {Value: customerId},
                {Value: customerCountry},
                {Value: customerCity},
                {Value: customerPhone},
                {Value: customerMail},
                {Value: customerLanguage},
                {Value: comment}
            ]
        },
        FieldGroup#Relation: {
            Data: [
                {Value: customerCondition_conditionId},
                {Value: status_statusId}
            ]
        },
        FieldGroup#TechnicalData: {
            Data: [
                {Value: ID},
                {Value: backendEventTime},
                {Value: backendEventType},
                {Value: backendEventSource},
                {Value: backendURL}
            ]
        }
    }
);

annotate catalog.CustomerProcesses with {   
    ID                 @readonly @title:'{i18n>title_id}'                 @UI.HiddenFilter;
    customerId         @readonly @title:'{i18n>title_customer_id}';
    customerName       @readonly @title:'{i18n>title_customer_name}';
    customerPhone      @readonly @title:'{i18n>title_phone_number}'       @UI.HiddenFilter;
    customerMail       @readonly @title:'{i18n>title_e_mail}'             @UI.HiddenFilter;
    customerCity       @readonly @title:'{i18n>title_city}'               @UI.HiddenFilter;
    customerCountry    @readonly @title:'{i18n>title_country}'            @UI.HiddenFilter;
    customerLanguage   @readonly @title:'{i18n>title_language}'           @UI.HiddenFilter;
    customerCondition            @title:'{i18n>title_customer_condition}' @Common.Text: customerCondition.name;
    comment                      @title:'{i18n>title_comment}'            @UI.HiddenFilter @UI.MultiLineText;
    status                       @title:'{i18n>title_status}'             @Common.Text: status.name;
    backendEventTime   @readonly @title:'{i18n>title_event_time}'         @UI.HiddenFilter;
    backendEventType   @readonly @title:'{i18n>title_event_type}'         @UI.HiddenFilter;
    backendEventSource @readonly @title:'{i18n>title_event_source}'       @UI.HiddenFilter;
    backendURL         @readonly @title:'{i18n>title_url}'                @UI.HiddenFilter;
    criticality        @readonly @title:'{i18n>title_criticality}'        @UI.HiddenFilter;
};

annotate catalog.Conditions with @(
    cds.odata.valuelist,
    UI: {
        LineItem: [
            {Value: name},
            {Value: descr}
        ],
        HeaderInfo: {
            TypeName: '{i18n>type_condition}',
            TypeNamePlural: '{i18n>type_condition_plural}',
            Title: {Value: name },
            Description: {Value: name }
        }
    }
){
    conditionId @title : '{i18n>condition_id}' @UI.HiddenFilter;
    name        @title : '{i18n>condition_name}';
    descr       @title : '{i18n>condition_description}';
};

annotate catalog.Status with @(
    cds.odata.valuelist,
    UI: {
        LineItem: [
            {Value: name},
            {Value: descr}
        ],
        HeaderInfo: {
            TypeName: '{i18n>type_status}',
            TypeNamePlural: '{i18n>type_status_plural}',
            Title: {Value: name },
            Description: {Value: name }
        },
    }
){
    statusId @title : '{i18n>status_id}' @UI.HiddenFilter;
    name     @title : '{i18n>status_name}' ;
    descr    @title : '{i18n>status_description}' ;
};
<% } -%>

<% if(apiSFSFRC && em){ -%>
annotate catalog.CandidatesLog with @(
    UI: {
        Identification: [ {Value: candidateId} ],
        SelectionFields: [ ],
        LineItem: [
            {Value: candidateId},
            {Value: modifiedAt},
            {Value: cellPhone}
        ],
        HeaderInfo: {
            TypeName: '{i18n>candidate}',
            TypeNamePlural: '{i18n>candidates}',
            Title: {Value: candidateId},
            Description: {Value: cellPhone}
        }
    }
);

annotate catalog.CandidatesLog with {
    candidateId @title:'{i18n>candidateId}' @UI.HiddenFilter;
    cellPhone   @title:'{i18n>cellPhone}';
};
<% } -%>

<% if(apiSFSFEC && em && hana){ -%>
annotate catalog.EmployeeJobsLog with @(
    UI: {
        Identification: [ {Value: userId} ],
        SelectionFields: [ ],
        LineItem: [
            {Value: seqNumber},
            {Value: startDate},
            {Value: userId},
            {Value: modifiedAt},
            {Value: location},
            {Value: eventReason}
        ],
        HeaderInfo: {
            TypeName: '{i18n>employeeJob}',
            TypeNamePlural: '{i18n>employeeJobs}',
            Title: {Value: userId},
            Description: {Value: location}
        }
    }
);

annotate catalog.EmployeeJobsLog with {
    seqNumber   @title:'{i18n>seqNumber}' @UI.HiddenFilter;
    startDate   @title:'{i18n>startDate}' @UI.HiddenFilter;
    userId      @title:'{i18n>userId}' @UI.HiddenFilter;
    location    @title:'{i18n>location}';
    eventReason @title:'{i18n>eventReason}';
};
<% } -%>