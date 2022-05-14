"use strict";
const DbHelper = require("./src/DbHelper.js");
const db = new DbHelper("./code/server/dev.db");
try{
    new Promise(async (resolve, reject) => {
        await db.createTables();
        console.log("Tables created!");
        resolve();
    }).then(async (resolve, reject) => {
        const dummy_data = `
        INSERT INTO User (UserID, Name, Surname, Email, Type, Password)
        VALUES (1, "Shayan", "Taghinezhad", "shayan2370@gmail.com", "", "");

        INSERT INTO RestockOrder (RestockOrderID, IssueDate, State, TransportNote, SupplierID)
        VALUES (1, "2022-05-11", "ISSUED", "note: ISSUED", 1);

        insert into SKU ("Description", "Weight", "Volume", "Price", "AvailableQuantity")
        values ("None", 1,1,1,1);

        insert into SKUItem ("RFID", "SKUID", "Available", "DateOfStock")
        values ("1", "1", True, "1999-12-30");`;
        await db.runSQL(dummy_data);
        console.log("dummy data inserted!")
        process.exit();
    });


}
catch (err){
    console.log(err);
}
