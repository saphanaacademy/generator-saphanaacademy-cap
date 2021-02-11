namespace <%= projectName %>.db;

entity Sales {
    key ID       : Integer;
        region   : String(100);
        country  : String(100);
        org      : String(4);
        amount   : Integer;
        comments : String(100);
};
