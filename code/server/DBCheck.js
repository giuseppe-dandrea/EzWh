(async ()=>{
    const dbConnection = require("./database/DatabaseConnection");
    await dbConnection.getInstance();
    let connectionTest = dbConnection.db;
    console.log("DB INITIALIZED AND CHECKED !");
})();