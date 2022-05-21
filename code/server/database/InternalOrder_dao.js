const InternalOrder = require("./InternalOrder");
const dbConnection = require("./DatabaseConnection").getInstance();

exports.createInternalOrderProduct = (internalOrderID, SKUID, QTY) => {
    return new Promise((resolve, reject) => {
        const sql = `insert into InternalOrderProduct (InternalOrderID, SKUID, QTY)
      values (${internalOrderID}, ${SKUID}, ${QTY});`;
        dbConnection.run(sql, function (err) {
            if (err) {
                reject(err.toString());
            } else {
                resolve();
            }
        });
    });
}

exports.createInternalOrder = (issueDate, customerID) => {
    return new Promise((resolve, reject) => {
        const sql = `insert into InternalOrder (IssueDate, CustomerID, State)
      values ('${issueDate}', ${customerID}, 'ISSUED');`;
        dbConnection.run(sql, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
}


exports.getInternalOrders = (state) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM InternalOrder`;
        if (state) sql += ` where State = '${state}'`;
        sql += `;`;
        dbConnection.all(sql, function (err, rows) {
            if (err) {
                reject(err);
            } else {
                const tds = rows.map((r) =>
                    new InternalOrder(
                        r.InternalOrderID,
                        r.IssueDate,
                        r.State,
                        r.CustomerID
                    )
                );
                resolve(tds);
            }
        });
    });
}

exports.getInternalOrderByID = (ID) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM InternalOrder where InternalOrderID=${ID};`;
        dbConnection.get(sql, function (err, row) {
            if (err) {
                reject(err.toString());
            } else {
                if (row === undefined) {
                    resolve(undefined);
                } else {
                    const tds = new InternalOrder(
                        row.InternalOrderID,
                        row.IssueDate,
                        row.State,
                        row.CustomerID
                    )
                    resolve(tds);
                }
            }
        });
    });
}

exports.getInternalOrderProductByInternalOrderID = (ID) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM InternalOrderProduct where InternalOrderID=${ID};`;
        dbConnection.all(sql, function (err, rows) {
            if (err) {
                reject(err.toString());
            } else {
                resolve(rows);
            }
        });
    });
}

exports.getInternalOrderSKUItemByInternalOrderID = (ID) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM InternalOrderSKUItem where InternalOrderID=${ID};`;
        dbConnection.all(sql, function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// deleteInternalOrderSKUItemByInternalOrderID(ID){
//   return new Promise((resolve, reject) => {
//     const sql = `DELETE FROM InternalOrderSKUItem where InternalOrderID=${ID};`;
//     dbConnection.run(sql, function (err){
//       if (err) {
//         reject(err);
//       } else {
//         resolve();
//       }
//     });
//   });
// }

exports.createInternalOrderSKUItem = (ID, RFID) => {
    return new Promise((resolve, reject) => {
        const sql = `
      insert into InternalOrderSKUItem
      (RFID, InternalOrderID)
      values ('${RFID}', ${ID})`;
        dbConnection.run(sql, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

exports.modifyInternalOrderState = (ID, newState) => {
    return new Promise((resolve, reject) => {
        const sql = `
      update InternalOrder
      SET State='${newState}'
      where InternalOrderID=${ID}`;
        dbConnection.run(sql, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

exports.deleteInternalOrder = (ID) => {
    return new Promise((resolve, reject) => {
        const sql = `delete from InternalOrder where InternalOrderID=${ID}`;
        console.log(sql);
        dbConnection.run(sql, [], (err) => {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
}