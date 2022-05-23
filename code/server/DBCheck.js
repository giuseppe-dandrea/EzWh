const dbConnection = require("./database/DatabaseConnection");
dbConnection.getInstance();
let connectionTest = dbConnection.db;
console.log("DB INITIALIZED AND CHECKED !");