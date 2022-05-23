(async ()=>{
    const dbConnection = require("./database/DatabaseConnection");
    await dbConnection.getInstance();
    await dbConnection.initiateDB();
    let connectionTest = dbConnection.db;
    console.log("DB INITIALIZED AND CHECKED !");
})();