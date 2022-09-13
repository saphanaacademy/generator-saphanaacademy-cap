using CatalogService from '../../srv/catalog-service';

extend service CatalogService with {
    entity Comments as projection on CatalogService.Sales {
        key ID,
            comments
    }
}