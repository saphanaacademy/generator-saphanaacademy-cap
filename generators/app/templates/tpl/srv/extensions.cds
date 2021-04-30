/* uncomment and modify as needed
using CatalogService from '_base/srv/catalog-service'; 

using Z_<%= projectName %>.db as db from '../db/new'; 

extend service CatalogService with {

    @readonly
    entity Z_Custom
<% if(authorization){ -%>
      @(restrict: [{ to: 'Viewer' }])
<% } -%>
      as select * from db.Z_Custom;

};
*/