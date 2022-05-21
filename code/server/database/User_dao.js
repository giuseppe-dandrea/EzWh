const sqlite = require("sqlite3");
const { User } = require("../modules/User");

const dbConnection = require("./DatabaseConnection").getInstance();

exports.getUserInfo = (id) => {
} //TODO

exports.getSuppliers = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM User WHERE Type = ?';
        dbConnection.all(sql, "supplier", (err, rows) => {
            if (err) {
                console.log("Error in DB");
                console.log(err);
                reject(err);
            }
            const users = rows.map((u) => new User(u.UserID, u.Name, u.Surname, u.Email, u.Type, u.Password));
            resolve(users);
        });
    });
}

exports.getUsers = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM User WHERE Type <> ?'; // also, ADMIN??
        dbConnection.all(sql, "manager", (err, rows) => {
            if (err) {
                console.log("Error in DB");
                console.log(err);
                reject(err);
            }
            const users = rows.map((u) => new User(u.UserID, u.Name, u.Surname, u.Email, u.Type, u.Password));
            resolve(users);
        });
    });
}

exports.createUser = (email, name, surname, password, type) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO User (Name, Surname, Email, Type, Password)
      VALUES (?, ?, ?, ?, ?)`;
        dbConnection.run(sql, [name, surname, email, type, password], function (err) {
            if (err) {
                console.log("Error in DB");
                console.log(err);
                reject(err);
            }
        });
        resolve();
    });
}

exports.modifyUserRights = (email, oldType, newType) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE User SET Type=?
         WHERE Email=? AND Type=?`;
        dbConnection.run(sql, [newType, email, oldType], function (err) {
            if (err) {
                console.log("Error in DB");
                console.log(err);
                reject(err);
            }
        });
        resolve();
    });
}

exports.deleteUser = (email, type) => {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM User WHERE Email=? AND Type=?`;
        dbConnection.run(sql, [email, type], function (err) {
            if (err) {
                console.log("Error in DB");
                console.log(err);
                reject(err);
            }
        });
        resolve();
    });
}

exports.getUserByEmail = (email, type) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM User WHERE Email=? AND Type=?`;
        dbConnection.all(sql, [email, type], (err, rows) => {
            if (err) {
                console.log("Error in DB");
                console.log(err);
                reject(err);
            }
            const users = rows.map((u) => new User(u.UserID, u.Name, u.Surname, u.Email, u.Type, u.Password));
            resolve(users[0]);
        });
    });
}