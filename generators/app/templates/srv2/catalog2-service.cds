<% if(hana){ -%>
using {<%= projectName %>.db as db} from '../db/data-model';
<% } -%>

service Catalog2Service @(path : '/catalog2')
<% if(authentication){ -%>
@(requires: 'authenticated-user')
<% } -%>
{
<% if(hana){ -%>
    entity Students
<% if(authorization){ -%>
      @(restrict: [{ grant: ['READ'],
                     to: 'Viewer'
                   },
                   { grant: ['WRITE'],
                     to: 'Admin' 
                   }
                  ])
<% } -%>
      as select * from db.Students
    ;
<% } -%>

};
