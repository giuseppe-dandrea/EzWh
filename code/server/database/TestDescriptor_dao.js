const TestDescriptor = require("./TestDescriptor");
const dbConnection = require("./DatabaseConnection").getInstance();

exports.getTestDescriptors = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM TestDescriptor";
        dbConnection.all(sql, [], (err, rows) => {
            if (err) {
                console.log("Error in DB");
                console.log(err);
                reject(err);
                return;
            }
            const tds = rows.map((r) => new TestDescriptor(r.TestDescriptorID, r.Name, r.ProcedureDescription, r.SKUID));
            resolve(tds);
        });
    });
}

exports.createTestDescriptor = (name, procedureDescription, idSKU) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO TestDescriptor (Name, ProcedureDescription, SKUID)
      VALUES (?, ?, ?)`;
        dbConnection.run(sql, [name, procedureDescription, idSKU], function (err) {
            if (err) {
                console.log("Error in DB");
                console.log(err);
                reject(err);
            }
        });
        resolve();
    });
}

exports.modifyTestDescriptor = (testDescriptor) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE TestDescriptor SET Name=?,
         ProcedureDescription=?, SKUID=?
         WHERE TestDescriptorID=?`;
        dbConnection.run(
            sql,
            [testDescriptor.name, testDescriptor.procedureDescription, testDescriptor.idSKU, testDescriptor.id],
            function (err) {
                if (err) {
                    console.log("Error in DB");
                    console.log(err);
                    reject(err);
                }
            }
        );
        resolve();
    });
}

exports.deleteTestDescriptor = (id) => {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM TestDescriptor WHERE TestDescriptorID=?`;
        dbConnection.run(sql, [id], function (err) {
            if (err) {
                console.log("Error in DB");
                console.log(err);
                reject(err);
            }
        });
        resolve();
    });
}
