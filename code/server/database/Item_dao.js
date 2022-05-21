const Item = require("../modules/Item");

exports.getItems = () => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = "SELECT * FROM Item;";
        dbConnection.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const tds = rows.map((r) => new Item(r.ItemID, r.Description, r.Price, r.SKUID, r.SupplierID));
            resolve(tds);
        });
    });
}
exports.getItemByID = (id) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `SELECT * FROM Item WHERE ItemID = ${id};`;
        dbConnection.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const i = rows.map((r) => new Item(r.ItemID, r.Description, r.Price, r.SKUID, r.SupplierID));
            resolve(i);
        });
    });
}
exports.getItemBySKUIDAndSupplierID = (SKUID, supplierID) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `select ItemID from Item
      where SKUID=${SKUID} and
      SupplierID=${supplierID}`;
        dbConnection.get(sql, function (err, row) {
            if (err) {
                reject(err);
            } else {
                if (row === undefined) {
                    resolve(undefined);
                } else {
                    const tds = new Item(
                        row.ItemID,
                        row.Description,
                        row.Price,
                        row.SKUID,
                        row.SupplierID
                    );
                    resolve(tds);
                }
            }
        });
    });
}
exports.createItem = (item) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `INSERT INTO Item(ItemID, Description, Price, SKUID, SupplierID) 
        VALUES (?, ?, ?, ?, ?);`;
        dbConnection.run(sql, [item.id, item.description, item.price, item.skuId, item.supplierId], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
}

exports.modifyItem = (id, newDescription, newPrice) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `UPDATE Item SET Description = ?, Price = ?  WHERE ItemID = ?;`;
        dbConnection.run(sql, [newDescription, newPrice, id], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

exports.deleteItem = (id) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `DELETE FROM Item WHERE ItemID = ?;`;
        dbConnection.run(sql, [id], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}
