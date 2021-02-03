namespace <%= projectName %>.db;

entity Sales {
    key ID       : Integer;
        region   : String(100);
        country  : String(100);
        amount   : Integer;
        comments : String(100);
};
