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
}