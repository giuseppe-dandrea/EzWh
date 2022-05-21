const ReturnOrder = require("../modules/ReturnOrder");

exports.createReturnOrder = (returnDate, restockOrderID) => {
    return new Promise(d => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `insert into ReturnOrder (ReturnDate, RestockOrderId)
      values ('${returnDate}', ${restockOrderID});`;
        dbConnection.run(sql, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
}

exports.createReturnOrderProducts = (ID, RFID) => {
    return new Promise(d => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `insert into ReturnOrderProduct (RFID, ReturnOrderID)
      values ('${RFID}', ${ID});`;
        dbConnection.run(sql, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
}

exports.getReturnOrderProducts = (ID) => {
    return new Promise(d => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `select * from ReturnOrderProduct where ReturnOrderID=${ID};`;
        dbConnection.all(sql, function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

exports.getReturnOrders = () => {
    return new Promise(d => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `select * from ReturnOrder;`;
        dbConnection.all(sql, function (err, rows) {
            if (err) {
                reject(err);
            } else {
                const tds = rows.map((r) => new ReturnOrder(
                    r.ReturnOrderID,
                    r.ReturnDate,
                    r.RestockOrderID
                ));
                resolve(tds);
            }
        });
    });
}

exports.getReturnOrderByID = (ID) => {
    return new Promise(d => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `select * from ReturnOrder where ReturnOrderID=${ID};`;
        dbConnection.get(sql, function (err, row) {
            if (err) {
                reject(err);
            } else {
                if (row === undefined) {
                    resolve(undefined);
                } else {
                    const tds = new ReturnOrder(
                        row.ReturnOrderID,
                        row.ReturnDate,
                        row.RestockOrderID
                    );
                    resolve(tds);
                }
            }
        });
    });
}

exports.deleteReturnOrder = (ID) => {
    return new Promise(d => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `delete from ReturnOrder where ReturnOrderID=${ID}`;
        console.log(sql);
        dbConnection.run(sql, [], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}
