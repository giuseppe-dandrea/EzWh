"use strict";
const DbHelper = require("./src/DbHelper.js");
const db = new DbHelper("./code/server/dev.db");
try{
    (async function() {
        db.createTables();
        console.log("Tables being created... Waiting for 5 seconds!");
        //create table doesn't resolve, we don't know when it's finished so we wait a few seconds!
        await new Promise(resolve => setTimeout(resolve, 5000));
        const dummy_data = [
        `INSERT INTO User (UserID, Name, Surname, Email, Type, Password)
        VALUES (1, "Shayan", "Taghinezhad", "shayan2370@gmail.com", "", "");`,

        `INSERT INTO RestockOrder (RestockOrderID, IssueDate, State, TransportNote, SupplierID)
        VALUES (1, "2022-05-11", "ISSUED", "note: ISSUED", 1);`,

        `insert into SKU ("Description", "Weight", "Volume", "Price", "AvailableQuantity")
        values ("None", 1,1,1,1);`,

        `insert into SKUItem ("RFID", "SKUID", "Available", "DateOfStock")
        values ("123456789", "1", True, "1999-12-30");`,
        
        `insert into ReturnOrder ("ReturnDate", "RestockOrderID")
        values ("2020-02-02", "1");`,

        `insert into ReturnOrderProduct ("RFID", "ReturnOrderID")
        values ("123456789", 1)`,

        `INSERT INTO "main"."TestDescriptor"
        ("TestDescriptorID", "Name", "ProcedureDescription", "SKUID")
        VALUES (1, 'test1', 'blah blah', 1);`,

        `INSERT INTO "main"."TestResult"
        ("TestResultID", "RFID", "TestDescriptorID", "date", "result")
        VALUES (1, '123456789', 1, '2020-05-05', 'false');`
        ]
        dummy_data.forEach(q=>{
            db.runSQL(q);
        })
        console.log("Dummy data being inserted... waiting for 5 seconds before exiting.")
        await new Promise(resolve => setTimeout(resolve, 5000));
        console.log("End of operations! Exited.")
        process.exit();
    })();
}
catch (err){
    console.log(err);
}
