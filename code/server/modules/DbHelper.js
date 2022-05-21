const sqlite3 = require("sqlite3");
const TestDescriptor = require("./TestDescriptor");
const TestResult = require("./TestResult");
const { User } = require("./User");
const Item = require("./Item");
const Position = require("./Position");
const RestockOrder = require("./RestockOrder");
const ReturnOrder = require("./ReturnOrder");
const InternalOrder = require("./InternalOrder");

class DbHelper {
  constructor(dbName = "./dev.db") {
    this.dbName = dbName;
    this.idTR = 1;
    this.createConnection();
  }

  createConnection() {
    this.dbConnection = new sqlite3.Database(this.dbName, (err) => {
      if (err) {
        console.log("Cannot connect to database", err);
      } else {
        console.log("Connected to database");
      }
    });
  }

  closeConnection() {
    this.dbConnection.close();
  }

  runSQL(SQL) {
    return new Promise((resolve, reject) => {
      this.dbConnection.run(SQL, (err) => {
        if (err) {
          console.log("Error running SQL", err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async createTables() {
    return new Promise((resolve, reject) => {
      const createSKUTable = `CREATE TABLE IF NOT EXISTS SKU (
    		SKUID INTEGER NOT NULL,
    		Description VARCHAR(100) NOT NULL,
    		Weight DOUBLE NOT NULL,
    		Volume DOUBLE NOT NULL,
    		Price DOUBLE NOT NULL,
    		Notes VARCHAR(100),
    		Position VARCHAR(20),
    		AvailableQuantity INTEGER NOT NULL,
    		PRIMARY KEY(SKUID),
    		FOREIGN KEY (Position) REFERENCES Position(PositionID)
		);`;
      this.dbConnection.run(createSKUTable, (err) => {
        if (err) {
          console.log("Error creating SKU table", err);
          reject(err);
        }
      });

      const createSKUItemTable = `CREATE TABLE IF NOT EXISTS SKUItem (
    		RFID VARCHAR(33) NOT NULL,
    		SKUID INTEGER NOT NULL,
    		Available INTEGER NOT NULL,
    		DateOfStock VARCHAR(11),
    		PRIMARY KEY (RFID),
    		FOREIGN KEY (SKUID) references SKU(SKUID)
		);`;
      this.dbConnection.run(createSKUItemTable, (err) => {
        if (err) {
          console.log("Error creating SKUItem table", err);
          reject(err);
        }
      });

      const createPositionTable = `CREATE TABLE IF NOT EXISTS Position (
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
		);`;
      this.dbConnection.run(createPositionTable, (err) => {
        if (err) {
          console.log("Error creating Position table", err);
          reject(err);
        }
      });

      const createUserTable = `CREATE TABLE IF NOT EXISTS User (
			UserID INTEGER NOT NULL,
			Name VARCHAR(50) NOT NULL,
			Surname VARCHAR(50) NOT NULL,
			Email VARCHAR(50) NOT NULL,
			Type VARCHAR(50) NOT NULL,
			Password VARCHAR(50) NOT NULL,
			PRIMARY KEY (UserID),
      UNIQUE (Email, Type)
		);`;
      this.dbConnection.run(createUserTable, (err) => {
        if (err) {
          console.log("Error creating User table", err);
          reject(err);
        }
      });

      const createTestDescriptorTable = `CREATE TABLE IF NOT EXISTS TestDescriptor (
			TestDescriptorID INTEGER NOT NULL,
			Name VARCHAR(20) NOT NULL,
			ProcedureDescription VARCHAR(20) NOT NULL,
			SKUID INTEGER NOT NULL,
			PRIMARY KEY (TestDescriptorID),
			FOREIGN KEY (SKUID) REFERENCES SKU(SKUID)
		);`;
      this.dbConnection.run(createTestDescriptorTable, (err) => {
        if (err) {
          console.log("Error creating TestDescriptor table", err);
          reject(err);
        }
      });

      const createTestResultTable = `CREATE TABLE IF NOT EXISTS TestResult (
			TestResultID INTEGER NOT NULL,
			RFID VARCHAR(20) NOT NULL,
			TestDescriptorID INTEGER NOT NULL,
			Date VARCHAR(20) NOT NULL,
			Result BOOLEN NOT NULL,
			PRIMARY KEY (TestResultID, RFID),
			FOREIGN KEY (RFID) REFERENCES SKUItem(RFID),
			FOREIGN KEY (TestDescriptorID) REFERENCES TestDescriptor(TestDescriptorID)
		);`;
      this.dbConnection.run(createTestResultTable, (err) => {
        if (err) {
          console.log("Error creating TestResult table", err);
          reject(err);
        }
      });

      const createItemTable = `CREATE TABLE IF NOT EXISTS Item (
    		ItemID INTEGER NOT NULL,
    		Description VARCHAR(200) ,
    		Price DOUBLE NOT NULL,
    		SKUID INTEGER NOT NULL,
    		SupplierID INTEGER NOT NULL,
    		PRIMARY KEY (ItemID),
        UNIQUE(SupplierID,SKUID),
        FOREIGN KEY (SKUID) REFERENCES SKU(SKUID),
    		FOREIGN KEY (SupplierID) REFERENCES User(UserID)
    		);`;

      /**/
      this.dbConnection.run(createItemTable, (err) => {
        if (err) {
          console.log("Error creating Item table", err);
          reject(err);
        }
      });

      //date format ?
      const createTransportNoteTable = `CREATE TABLE IF NOT EXISTS TransportNote (
    		ShipmentDate VARCHAR(100) NOT NULL, 
    		RestockOrderID INTEGER NOT NULL ,
    		PRIMARY KEY (RestockOrderID),
			  FOREIGN KEY (RestockOrderID) REFERENCES RestockOrder(RestockOrderID)
		);`;
      this.dbConnection.run(createTransportNoteTable, (err) => {
        if (err) {
          console.log("Error creating TransportNote table", err);
          reject(err);
        }
      });
      const createInternalOrderTable = `CREATE TABLE IF NOT EXISTS InternalOrder (
		InternalOrderID INTEGER NOT NULL,
		IssueDate VARCHAR(20) NOT NULL,
		State VARCHAR(20) NOT NULL,
		CustomerID INTEGER NOT NULL,
		PRIMARY KEY(InternalOrderID),
		FOREIGN KEY (CustomerID) REFERENCES User(UserID)
    on delete cascade
	);`;
      this.dbConnection.run(createInternalOrderTable, (err) => {
        if (err) {
          console.log("Error creating InternalOrder table", err);
          reject(err);
        }
      });

      const createInternalOrderProductTable = `CREATE TABLE IF NOT EXISTS InternalOrderProduct (
		SKUID INTEGER NOT NULL,
		InternalOrderID INTEGER NOT NULL,
		QTY INTEGER NOT NULL,
		PRIMARY KEY(SKUID, InternalOrderID),
		FOREIGN KEY (SKUID) REFERENCES SKU(SKUID)
    on delete cascade,
		FOREIGN KEY (InternalOrderID) REFERENCES InternalOrder(InternalOrderID)
    on delete cascade
	);`;
      this.dbConnection.run(createInternalOrderProductTable, (err) => {
        if (err) {
          console.log("Error creating InternalOrderProduct table", err);
          reject(err);
        }
      });

      const createInternalOrderSKUItemTable = `CREATE TABLE IF NOT EXISTS InternalOrderSKUItem (
		RFID INTEGER NOT NULL,
		InternalOrderID INTEGER NOT NULL,
		PRIMARY KEY(RFID, InternalOrderID),
		FOREIGN KEY (RFID) REFERENCES SKUItem(RFID)
    on delete cascade,
		FOREIGN KEY (InternalOrderID) REFERENCES InternalOrder(InternalOrderID)
    on delete cascade
	);`;
      this.dbConnection.run(createInternalOrderSKUItemTable, (err) => {
        if (err) {
          console.log("Error creating Internal OrderSKUItem table", err);
          reject(err);
        }
      });

      const createRestockOrderTable = `CREATE TABLE IF NOT EXISTS RestockOrder (
		RestockOrderID INTEGER NOT NULL,
		IssueDate VARCHAR(20) NOT NULL,
    State VARCHAR(20) NOT NULL,
		TransportNote VARCHAR(20) NOT NULL,
		SupplierID INTEGER NOT NULL,
		FOREIGN KEY (SupplierID) REFERENCES User(UserID)
    on delete cascade,
		PRIMARY KEY(RestockOrderID)
	);`;
      this.dbConnection.run(createRestockOrderTable, (err) => {
        if (err) {
          console.log("Error creating Restock Order table", err);
          reject(err);
        }
      });

      const createRestockOrderProductTable = `CREATE TABLE IF NOT EXISTS RestockOrderProduct (
		ItemID INTEGER NOT NULL,
		RestockOrderID INTEGER NOT NULL,
		QTY INTEGER NOT NULL,
		PRIMARY KEY(ItemID, RestockOrderID),
		FOREIGN KEY (ItemID) REFERENCES Item(ItemID)
    on delete cascade,
		FOREIGN KEY (RestockOrderID) REFERENCES RestockOrder(RestockOrderID)
    on delete cascade
    );`;
      this.dbConnection.run(createRestockOrderProductTable, (err) => {
        if (err) {
          console.log("Error creating RestockOrderProduct table", err);
          reject(err);
        }
      });

      const createRestockOrderSKUItemTable = `CREATE TABLE IF NOT EXISTS RestockOrderSKUItem (
		RFID INTEGER NOT NULL,
		RestockOrderID INTEGER NOT NULL,
		PRIMARY KEY(RFID, RestockOrderID),
		FOREIGN KEY (RFID) REFERENCES SKUItem(RFID)
    on delete cascade,
		FOREIGN KEY (RestockOrderID) REFERENCES RestockOrder(RestockOrderID)
		on delete cascade
	);`;
      this.dbConnection.run(createRestockOrderSKUItemTable, (err) => {
        if (err) {
          console.log("Error creating RestockOrderSKUItem table", err);
          reject(err);
        }
      });

      const createReturnOrderTable = `CREATE TABLE IF NOT EXISTS ReturnOrder (
		ReturnOrderID INTEGER NOT NULL,
		ReturnDate VARCHAR(20) NOT NULL,
		RestockOrderID INTEGER NOT NULL,
		PRIMARY KEY(ReturnOrderID),
		FOREIGN KEY (RestockOrderID) REFERENCES RestockOrder(RestockOrderID)
    on delete cascade
	  );`;
      this.dbConnection.run(createReturnOrderTable, (err) => {
        if (err) {
          console.log("Error creating Return Order table", err);
          reject(err);
        }
      });

      const createReturnOrderProductTable = `CREATE TABLE IF NOT EXISTS ReturnOrderProduct (
      RFID VARCHAR(20) NOT NULL,
      ReturnOrderID INTEGER NOT NULL,
      PRIMARY KEY(RFID, ReturnOrderID),
      FOREIGN KEY (ReturnOrderID) REFERENCES ReturnOrder(ReturnOrderID)
      on delete cascade,
      FOREIGN KEY (RFID) REFERENCES SKUItem(RFID)
      on delete cascade
      );`;
      this.dbConnection.run(createReturnOrderProductTable, (err) => {
        if (err) {
          console.log("Error creating Return Order Product table", err);
          reject(err);
        }
      });
      resolve();
    });
  }

  dropTables() {
    const dropSKUTable = `DROP TABLE SKU;`;
    this.dbConnection.run(dropSKUTable, (err) => {
      if (err) {
        console.log("Error dropping SKU table", err);
      }
    });

    const dropSKUItemTable = `DROP TABLE SKUItem;`;
    this.dbConnection.run(dropSKUItemTable, (err) => {
      if (err) {
        console.log("Error dropping SKUItem table", err);
      }
    });

    const dropPositionTable = `DROP TABLE Position;`;
    this.dbConnection.run(dropPositionTable, (err) => {
      if (err) {
        console.log("Error dropping Position table", err);
      }
    });

    const dropUserTable = `DROP TABLE User;`;
    this.dbConnection.run(dropUserTable, (err) => {
      if (err) {
        console.log("Error dropping User table", err);
      }
    });

    const dropTestDescriptorTable = `DROP TABLE TestDescriptor;`;
    this.dbConnection.run(dropTestDescriptorTable, (err) => {
      if (err) {
        console.log("Error dropping TestDescriptor table", err);
      }
    });

    const dropTestResultTable = `DROP TABLE TestResult;`;
    this.dbConnection.run(dropTestResultTable, (err) => {
      if (err) {
        console.log("Error dropping TestResult table", err);
      }
    });

    const dropItemTable = `DROP TABLE Item;`;
    this.dbConnection.run(dropItemTable, (err) => {
      if (err) {
        console.log("Error dropping Item table", err);
      }
    });

    const dropTransportNoteTable = `DROP TABLE TransportNote;`;
    this.dbConnection.run(dropTransportNoteTable, (err) => {
      if (err) {
        console.log("Error dropping TransportNote table", err);
      }
    });
    const dropInternalOrderTable = `DROP TABLE InternalOrder;`;
    this.dbConnection.run(dropInternalOrderTable, (err) => {
      if (err) {
        console.log("Error dropping Internal Order table", err);
      }
    });

    const dropInternalOrderSKUItemTable = `DROP TABLE InternalOrderSKUItem;`;
    this.dbConnection.run(dropInternalOrderSKUItemTable, (err) => {
      if (err) {
        console.log("Error dropping InternalOrderSKUItem table", err);
      }
    });

    const dropRestockOrderTable = `DROP TABLE RestockOrder;`;
    this.dbConnection.run(dropRestockOrderTable, (err) => {
      if (err) {
        console.log("Error dropping RestockOrder table", err);
      }
    });

    const dropRestockOrderProductsTable = `DROP TABLE RestockOrderProduct;`;
    this.dbConnection.run(dropRestockOrderProductsTable, (err) => {
      if (err) {
        console.log("Error dropping RestockOrderProduct table", err);
      }
    });

    const dropRestockOrderSKUItemTable = `DROP TABLE RestockOrderSKUItem;`;
    this.dbConnection.run(dropRestockOrderSKUItemTable, (err) => {
      if (err) {
        console.log("Error dropping RestockOrderSKUItem table", err);
      }
    });

    const dropReturnOrderTable = `DROP TABLE ReturnOrder;`;
    this.dbConnection.run(dropReturnOrderTable, (err) => {
      if (err) {
        console.log("Error dropping ReturnOrder table", err);
      }
    });
  }
}



  // TestDescriptor

  //TestResult

  // User


  /***POSITION***/
  //SKUs

  /***ITEMS***/

  /***RestockOrder***/



  /***Item***/

  /***ReturnOrder***/

  /***InternalOrder***/

}
module.exports = DbHelper;
