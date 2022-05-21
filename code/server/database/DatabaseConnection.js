const sqlite3 = require("sqlite3");


class DatabaseConnection {
    static db = null;

    static async getInstance() {
        let tmp;
        if (!this.db) {
            tmp = new sqlite3.Database("./database/ezwh.db", (err) => err && console.log(err));
            await this.createTables();
        }
        this.db = tmp;
        return this.db;
    }
    //TODO: write create tables as a chain of promises
}

module.exports = DatabaseConnection;
