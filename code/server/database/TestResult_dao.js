const TestResult = require("../modules/TestResult");

exports.getTestResultsByRFID = (RFID) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `SELECT * FROM TestResult WHERE RFID=?`;
        dbConnection.all(sql, [RFID], (err, rows) => {
            if (err) {
                console.log("Error in DB");
                console.log(err);
                reject(err);
            }
            const trs = rows.map((r) => new TestResult(r.RFID, r.TestResultID, r.TestDescriptorID, r.Date, r.Result));
            resolve(trs);
        });
    });
}

exports.getTestResultByIDAndRFID = (RFID, id) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `SELECT * FROM TestResult WHERE RFID=?
       AND TestResultID=?`;
        dbConnection.all(sql, [RFID, id], (err, rows) => {
            if (err) {
                console.log("Error in DB");
                console.log(err);
                reject(err);
            }
            const trs = rows.map((r) => new TestResult(r.RFID, r.TestResultID, r.TestDescriptorID, r.Date, r.Result));
            resolve(trs[0]);
        });
    });
}

exports.addTestResult = (RFID, idTestDescriptor, date, result) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `INSERT INTO TestResult (TestResultID, RFID, TestDescriptorID, Date, Result)
      VALUES (?, ?, ?, ?, ?)`;
        dbConnection.run(sql, [this.idTR, RFID, idTestDescriptor, date, result], (err) => {
            if (err) {
                console.log("Error in DB");
                console.log(err);
                reject(err);
            }
            this.idTR++;
            resolve();
        });
    });
}

exports.modifyTestResult = (testResult) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `UPDATE TestResult SET
         TestDescriptorID=?, Date=?,
         Result=? WHERE TestResultID=?AND RFID=?`;
        dbConnection.run(
            sql,
            [testResult.idTestDescriptor, testResult.date, testResult.result, testResult.id, testResult.rfid],
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

exports.deleteTestResult = (RFID, id) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `DELETE FROM TestResult WHERE
       TestResultID=? AND RFID=?`;
        dbConnection.run(sql, [id, RFID], function (err) {
            if (err) {
                console.log("Error in DB");
                console.log(err);
                reject(err);
            }
        });
        resolve();
    });
}
