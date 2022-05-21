const RestockOrder = require("../modules/RestockOrder");

exports.getRestockOrders = (state) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        let sql = `SELECT RestockOrderID FROM RestockOrder`;
        if (state) sql += ` where State = '${state}'`;
        sql += `;`;
        dbConnection.all(sql, function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

exports.getRestockOrderByID = (id) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        let sql = `SELECT * FROM RestockOrder WHERE RestockOrderID= ${id};`;
        dbConnection.get(sql, function (err, row) {
            if (err) {
                reject(err);
            } else {
                if (row === undefined) {
                    resolve(undefined);
                } else {
                    const tds = new RestockOrder(
                        row.RestockOrderID,
                        row.IssueDate,
                        row.State,
                        row.SupplierID,
                        row.TransportNote
                    );
                    resolve(tds);
                }
            }
        });
    });
}

exports.getRestockOrderProductsByRestockOrderID = (ID) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        let sql = `SELECT * FROM RestockOrderProduct where RestockOrderID=${ID}`;
        dbConnection.all(sql, function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

exports.getRestockOrderSKUItemsByRestockOrderID = (ID) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        let sql = `SELECT * FROM RestockOrderSKUItem where RestockOrderID=${ID}`;
        dbConnection.all(sql, function (err, rows) {
            if (err) {
                reject(err);
            } else {
                // console.log(rows);
                resolve(rows);
            }
        });
    });
}

exports.getRestockOrderReturnItems = (ID) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const select_sql = `select RestockOrderID from RestockOrder where RestockOrderID=${ID}`
        dbConnection.all(select_sql, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                if (rows.length === 0) {
                    resolve(undefined);
                }
                const sql = `select s.SKUID, s.RFID from ReturnOrder as ro
          inner join ReturnOrderProduct as rop
          inner join SKUItem as s
          inner join TestResult as t
          where ro.ReturnOrderID = rop.ReturnOrderID and
          s.RFID = rop.RFID and
          s.RFID = t.RFID and
          ro.RestockOrderID=${ID} and
          t.Result = 'false'
          group by s.RFID
          having count(*)>0;`;
                dbConnection.all(sql, function (err, rows) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    const tds = rows.map(
                        (r) =>
                            ({"SKUId": r.SKUID, "rfid": r.RFID})
                    );
                    resolve(tds);
                });
            }
        });
    });
}

exports.createRestockOrder = (issueDate, supplierID) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `INSERT INTO RestockOrder
      (IssueDate, SupplierID, State, TransportNote)
      values
      ('${issueDate}', ${supplierID}, 'ISSUED', 'ISSUED'); `;
        dbConnection.run(sql, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
}
exports.createRestockOrderProduct = (itemID, restockOrderID, QTY) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `insert into RestockOrderProduct (ItemID, RestockOrderID, QTY)
      values (${itemID}, ${restockOrderID}, ${QTY})`;
        dbConnection.run(sql, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
}

exports.modifyRestockOrderState = (id, newState) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `UPDATE RestockOrder
      SET State='${newState}'
      WHERE RestockOrderID=${id}`;
        dbConnection.run(sql, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes)
            }
        });
    });
}

exports.addSkuItemToRestockOrder = (ID, RFID) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `INSERT INTO RestockOrderSkuItem
      (RFID, RestockOrderID)
      values (${RFID}, ${ID});`;
        dbConnection.run(sql, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
}

exports.addTransportNoteToRestockOrder = (ID, transportNote) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `update RestockOrder set TransportNote='${transportNote}' where RestockOrderID=${ID}`;
        dbConnection.run(sql, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes);
            }
        });
    });
}

exports.deleteRestockOrder = (ID) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `delete from RestockOrder where RestockOrderID=${ID}`;
        console.log(sql);
        dbConnection.run(sql, function (err) {
            console.log("deleted!")
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
}
