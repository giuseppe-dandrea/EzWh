const sqlite3 = require("sqlite3");
const UserService = require("../services/User_service");
const userService = new UserService();

class DatabaseConnection {
    static db = null;

    static async getInstance() {
        if (this.db===null){
            this.db = new sqlite3.Database("./database/ezwh.db", (err) => err && console.log(err));
            await this.runSQL(`PRAGMA foreign_keys=on;`);
            // console.log(`Foreign keys activated with "PRAGMA foreign_keys=on"`);
            // console.log("Creating tables...");
            await this.createTables();
            // console.log("Tables created!");
            await this.createHardcodedUsers();
            // console.log("Hardcoded users added");
            console.log("DB initiation is done!");
        }
        return this.db;
    }

    static async createTables() {
        for (let tableSQL of this.tables) {
            await this.runSQL(tableSQL);
        }
    }

    static async createHardcodedUsers() {
    try {
      await userService.createUser("manager1@ezwh.com", "Michael", "Scott", "testpassword", "manager");
      await userService.createUser("supplier1@ezwh.com", "Best", "Supplier", "testpassword", "supplier");
      await userService.createUser("deliveryEmployee1@ezwh.com", "UPS", "Guy", "testpassword", "deliveryEmployee");
      await userService.createUser("clerk1@ezwh.com", "Michael", "Reeves", "testpassword", "clerk");
      await userService.createUser("qualityEmployee1@ezwh.com", "Creed", "Bratton", "testpassword", "qualityEmployee");
      await userService.createUser("user1@ezwh.com", "John", "Doe", "testpassword", "customer");
    } catch (err) {
      // console.log("Hardcoded users already added");
    }
  }

    static runSQL(SQL) {
        return new Promise((resolve, reject) => {
            this.db.run(SQL, (err) => {
                if (err) {
                    console.log("Error running SQL", err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    static tables = [
        `CREATE TABLE IF NOT EXISTS SKU (
            SKUID INTEGER NOT NULL,
            Description VARCHAR(100) NOT NULL,
            Weight DOUBLE NOT NULL,
            Volume DOUBLE NOT NULL,
            Price DOUBLE NOT NULL,
            Notes VARCHAR(100),
            Position VARCHAR(20),
            AvailableQuantity INTEGER NOT NULL,
            PRIMARY KEY(SKUID),
            FOREIGN KEY(Position) REFERENCES Position(PositionID)
            );`,

        `CREATE TABLE IF NOT EXISTS SKUItem (
    		RFID VARCHAR(33) NOT NULL,
    		SKUID INTEGER NOT NULL,
    		Available INTEGER NOT NULL,
    		DateOfStock VARCHAR(11),
    		PRIMARY KEY (RFID),
    		FOREIGN KEY (SKUID) references SKU(SKUID)
		    );`,

        `CREATE TABLE IF NOT EXISTS Position (
    		PositionID VARCHAR(20) NOT NULL,
    		AisleID VARCHAR(20) NOT NULL,
    		Row VARCHAR(20) NOT NULL,
    		Col VARCHAR(20) NOT NULL,
    		MaxWeight DOUBLE NOT NULL,
    		MaxVolume DOUBLE NOT NULL,
    		OccupiedWeight DOUBLE DEFAULT 0,
    		OccupiedVolume DOUBLE DEFAULT 0,
    		SKUID INTEGER,
    		PRIMARY KEY (PositionID),
    		FOREIGN KEY (SKUID) REFERENCES SKU(SKUID)
		    );`,

        `CREATE TABLE IF NOT EXISTS User (
			UserID INTEGER NOT NULL,
			Name VARCHAR(50) NOT NULL,
			Surname VARCHAR(50) NOT NULL,
			Email VARCHAR(50) NOT NULL,
			Type VARCHAR(50) NOT NULL,
			Password VARCHAR(50) NOT NULL,
			PRIMARY KEY (UserID),
            UNIQUE (Email, Type)
		    );`,

        `CREATE TABLE IF NOT EXISTS TestDescriptor (
			TestDescriptorID INTEGER NOT NULL,
			Name VARCHAR(20) NOT NULL,
			ProcedureDescription VARCHAR(20) NOT NULL,
			SKUID INTEGER NOT NULL,
			PRIMARY KEY (TestDescriptorID),
			FOREIGN KEY (SKUID) REFERENCES SKU(SKUID)
		    );`,

        `CREATE TABLE IF NOT EXISTS TestResult (
			TestResultID INTEGER NOT NULL,
			RFID VARCHAR(20) NOT NULL,
			TestDescriptorID INTEGER NOT NULL,
			Date VARCHAR(20) NOT NULL,
			Result BOOLEN NOT NULL,
			PRIMARY KEY (TestResultID, RFID),
			FOREIGN KEY (RFID) REFERENCES SKUItem(RFID),
			FOREIGN KEY (TestDescriptorID) REFERENCES TestDescriptor(TestDescriptorID)
		    );`,

        `CREATE TABLE IF NOT EXISTS Item (
            ItemID INTEGER NOT NULL,
    		Description VARCHAR(200) ,
    		Price DOUBLE NOT NULL,
    		SKUID INTEGER NOT NULL,
    		SupplierID INTEGER NOT NULL,
    		PRIMARY KEY (ItemID),
            UNIQUE(SupplierID,SKUID),
            FOREIGN KEY (SKUID) REFERENCES SKU(SKUID),
    		FOREIGN KEY (SupplierID) REFERENCES User(UserID)
            );`,
        
        `CREATE TABLE IF NOT EXISTS TransportNote (
    		ShipmentDate VARCHAR(100) NOT NULL, 
    		RestockOrderID INTEGER NOT NULL ,
    		PRIMARY KEY (RestockOrderID),
            FOREIGN KEY (RestockOrderID) REFERENCES RestockOrder(RestockOrderID)
		    );`,
        
        `CREATE TABLE IF NOT EXISTS InternalOrder (
            InternalOrderID INTEGER NOT NULL,
            IssueDate VARCHAR(20) NOT NULL,
            State VARCHAR(20) NOT NULL,
            CustomerID INTEGER NOT NULL,
            PRIMARY KEY(InternalOrderID),
            FOREIGN KEY (CustomerID) REFERENCES User(UserID)
            on delete cascade
            );`,
        
        `CREATE TABLE IF NOT EXISTS InternalOrderProduct (
            SKUID INTEGER NOT NULL,
            InternalOrderID INTEGER NOT NULL,
            QTY INTEGER NOT NULL,
            PRIMARY KEY(SKUID, InternalOrderID),
            FOREIGN KEY (SKUID) REFERENCES SKU(SKUID)
            on delete cascade,
            FOREIGN KEY (InternalOrderID) REFERENCES InternalOrder(InternalOrderID)
            on delete cascade
            );`,

        `CREATE TABLE IF NOT EXISTS InternalOrderSKUItem (
            RFID INTEGER NOT NULL,
            InternalOrderID INTEGER NOT NULL,
            PRIMARY KEY(RFID, InternalOrderID),
            FOREIGN KEY (RFID) REFERENCES SKUItem(RFID)
            on delete cascade,
            FOREIGN KEY (InternalOrderID) REFERENCES InternalOrder(InternalOrderID)
            on delete cascade
            );`,

        `CREATE TABLE IF NOT EXISTS RestockOrder (
            RestockOrderID INTEGER NOT NULL,
            IssueDate VARCHAR(20) NOT NULL,
            State VARCHAR(20) NOT NULL,
            TransportNote VARCHAR(20),
            SupplierID INTEGER NOT NULL,
            FOREIGN KEY (SupplierID) REFERENCES User(UserID)
            on delete cascade,
            PRIMARY KEY(RestockOrderID)
            );`,

        `CREATE TABLE IF NOT EXISTS RestockOrderProduct (
            ItemID INTEGER NOT NULL,
            RestockOrderID INTEGER NOT NULL,
            QTY INTEGER NOT NULL,
            PRIMARY KEY(ItemID, RestockOrderID),
            FOREIGN KEY (ItemID) REFERENCES Item(ItemID)
            on delete cascade,
            FOREIGN KEY (RestockOrderID) REFERENCES RestockOrder(RestockOrderID)
            on delete cascade
            );`,

        `CREATE TABLE IF NOT EXISTS RestockOrderSKUItem (
            RFID INTEGER NOT NULL,
            RestockOrderID INTEGER NOT NULL,
            PRIMARY KEY(RFID, RestockOrderID),
            FOREIGN KEY (RFID) REFERENCES SKUItem(RFID)
            on delete cascade,
            FOREIGN KEY (RestockOrderID) REFERENCES RestockOrder(RestockOrderID)
            on delete cascade
            );`,

        `CREATE TABLE IF NOT EXISTS ReturnOrder (
            ReturnOrderID INTEGER NOT NULL,
            ReturnDate VARCHAR(20) NOT NULL,
            RestockOrderID INTEGER NOT NULL,
            PRIMARY KEY(ReturnOrderID),
            FOREIGN KEY (RestockOrderID) REFERENCES RestockOrder(RestockOrderID)
            on delete cascade
            );`,
        
        `CREATE TABLE IF NOT EXISTS ReturnOrderProduct (
            RFID VARCHAR(20) NOT NULL,
            ReturnOrderID INTEGER NOT NULL,
            PRIMARY KEY(RFID, ReturnOrderID),
            FOREIGN KEY (ReturnOrderID) REFERENCES ReturnOrder(ReturnOrderID)
            on delete cascade,
            FOREIGN KEY (RFID) REFERENCES SKUItem(RFID)
            on delete cascade
            );`
    ]
}

module.exports = DatabaseConnection;
