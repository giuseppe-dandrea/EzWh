const sqlite3 = require("sqlite3");

class DbHelper {
  constructor(dbName = "../devDB") {
    this.dbName = dbName;
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

  createTables() {
    const createSKUTable = `CREATE TABLE SKU (
    		id INTEGER NOT NULL,
    		description VARCHAR(100) NOT NULL,
    		weight DOUBLE NOT NULL,
    		volume DOUBLE NOT NULL,
    		price DOUBLE NOT NULL,
    		notes VARCHAR(100),
    		position VARCHAR(20) NOT NULL,
    		availableQuantity INTEGER NOT NULL,
    		PRIMARY KEY(id)
		);`;
    this.dbConnection.run(createSKUTable, (err) => {
      if (err) {
        console.log("Error creating SKU table", err);
      }
    });

    const createSKUTestDescriptorTable = `CREATE TABLE SKUTestDescriptor (
    		idSKU INTEGER NOT NULL,
    		idTestDescriptor INTEGER NOT NULL,
    		PRIMARY KEY(idSKU, idTestDescriptor),
    		FOREIGN KEY (idSKU) REFERENCES SKU(id),
    		FOREIGN KEY (idTestDescriptor) REFERENCES TestDescriptor(id)
		);`;
    this.dbConnection.run(createSKUTestDescriptorTable, (err) => {
      if (err) {
        console.log("Error creating SKUTestDescriptor table", err);
      }
    });

    const createSKUItemTable = `CREATE TABLE SKUItem (
    		rfid VARCHAR(20) NOT NULL,
    		skuId INTEGER NOT NULL,
    		available INTEGER NOT NULL,
    		dateOfStock VARCHAR(11) NOT NULL,
    		PRIMARY KEY (rfid),
    		FOREIGN KEY (skuId) references SKU(id)
		);`;
    this.dbConnection.run(createSKUItemTable, (err) => {
      if (err) {
        console.log("Error creating SKUItem table", err);
      }
    });

    const createSKUItemTestResultTable = `CREATE TABLE SKUItemTestResult (
    		rfid VARCHAR(20) NOT NULL,
    		testResultId INTEGER NOT NULL,
    		PRIMARY KEY (rfid, testResultId),
    		FOREIGN KEY (rfid) REFERENCES SKUItem(rfid),
    		FOREIGN KEY (testResultId) REFERENCES TestResult(id)
		);`;
    this.dbConnection.run(createSKUItemTestResultTable, (err) => {
      if (err) {
        console.log("Error creating SKUItemTestResult table", err);
      }
    });

    const createPositionTable = `CREATE TABLE Position (
    		positionId VARCHAR(20) NOT NULL,
    		aisleId VARCHAR(20) NOT NULL,
    		row VARCHAR(20) NOT NULL,
    		col VARCHAR(20) NOT NULL,
    		maxWeight DOUBLE NOT NULL,
    		maxVolume DOUBLE NOT NULL,
    		occupiedWeight DOUBLE,
    		occupiedVolume DOUBLE,
    		skuId INTEGER,
    		PRIMARY KEY (positionId),
    		FOREIGN KEY (skuId) REFERENCES SKU(id)
		);`;
    this.dbConnection.run(createPositionTable, (err) => {
      if (err) {
        console.log("Error creating Position table", err);
      }
    });

    const createUserTable = `CREATE TABLE User (
			id INTEGER NOT NULL,
			name VARCHAR(20) NOT NULL,
			surname VARCHAR(20) NOT NULL,
			email VARCHAR(20) NOT NULL,
			type VARCHAR(30) NOT NULL,
			password VARCHAR(30) NOT NULL,
			PRIMARY KEY (id)
		);`;
    this.dbConnection.run(createUserTable, (err) => {
      if (err) {
        console.log("Error creating User table", err);
      }
    });

    const createTestDescriptorTable = `CREATE TABLE TestDescriptor (
			id INTEGER NOT NULL,
			name VARCHAR(20) NOT NULL,
			procedure_Description VARCHAR(20) NOT NULL,
			id_SKU INTEGER NOT NULL,
			PRIMARY KEY (id),
			FOREIGN KEY (id_SKU) REFERENCES SKU(id)
		);`;
    this.dbConnection.run(createTestDescriptorTable, (err) => {
      if (err) {
        console.log("Error creating TestDescriptor table", err);
      }
    });

    const createTestResultTable = `CREATE TABLE TestResult (
			id INTEGER NOT NULL,
			rfid VARCHAR(20) NOT NULL,
			id_Test_Descriptor INTEGER NOT NULL,
			date VARCHAR(20) NOT NULL,
			result BOOLEN NOT NULL,
			PRIMARY KEY (id, rfid),
			FOREIGN KEY (rfid) REFERENCES SKUItem(rfid),
			FOREIGN KEY (id_test_descriptor) REFERENCES TestDescriptor(id)
		);`;
    this.dbConnection.run(createTestResultTable, (err) => {
      if (err) {
        console.log("Error creating TestResult table", err);
      }
    });

    const createItemTable = `CREATE TABLE Item (
    		ItemID INTEGER NOT NULL,
    		Description VARCHAR(200) ,
    		Price DOUBLE NOT NULL,
    		SKUID INTEGER NOT NULL,
    		SupplierID INTEGER NOT NULL,
    		PRIMARY KEY (ItemID),
    		FOREIGN KEY (skuId) REFERENCES SKU(SKUID)
    		FOREIGN KEY (supplierId) REFERENCES User(UserID)
		);`;
    this.dbConnection.run(createItemTable, (err) => {
      if (err) {
        console.log("Error creating Item table", err);
      }
    });

    //date format ?
    const createTransportNoteTable = `CREATE TABLE TransportNote (
    		ShipmentDate VARCHAR(100) NOT NULL, 
    		RestockOrderID INTEGER NOT NULL ,
    		
    		PRIMARY KEY FOREIGN KEY REFERENCES RestockOrder(RestockOrderID)
		);`;
    this.dbConnection.run(createTransportNoteTable, (err) => {
      if (err) {
        console.log("Error creating TransportNote table", err);
      }
    });
	const createInternalOrderTable = `CREATE TABLE InternalOrder (
		InternalOrderID INTEGER NOT NULL,
		SssueDate VARCHAR(20) NOT NULL,
		State VARCHAR(20) NOT NULL,
		CustomerId INTEGER NOT NULL,
		PRIMARY KEY(InternalOrderID)
	);`
	this.dbConnection.run(createInternalOrderTable, (err) => {
		if (err) {
			console.log("Error creating InternalOrder table", err);
		}
	});
	
	const createInternalOrderProductTable = `CREATE TABLE InternalOrderProduct (
		SKUID INTEGER NOT NULL,
		InternalOrderID INTEGER NOT NULL,
		Count INTEGER NOT NULL,
		PRIMARY KEY(SKUID, internalOrderID),
		FOREIGN KEY (SKUID) REFERENCES SKU(SKUID),
		FOREIGN KEY (InternalOrderID) REFERENCES InternalOrder(InternalOrderID)
	);`
	this.dbConnection.run(createInternalOrderProductTable, (err) => {
		if (err) {
			console.log("Error creating InternalOrderProduct table", err);
		}
	});
	
	const createInternalOrderSKUItemTable = `CREATE TABLE InternalOrderSKUItem (
		SKUItemRFID INTEGER NOT NULL,
		InternalOrderID INTEGER NOT NULL,
		PRIMARY KEY(SKUItemRFID, InternalOrderID),
		FOREIGN KEY (SKUItemRFID) REFERENCES SKUItem(SKUItemRFID),
		FOREIGN KEY (InternalOrderID) REFERENCES InternalOrder(InternalOrderID)
	);`
	this.dbConnection.run(createInternalOrderSKUItemTable, (err) => {
			if (err) {
				console.log("Error creating Internal OrderSKUItem table", err);
			}
	});
	
	const createRestockOrderTable = `CREATE TABLE RestockOrder (
		RestockOrderID INTEGER NOT NULL,
		IssueDate VARCHAR(20) NOT NULL,
		TransportNote VARCHAR(20) NOT NULL,
		SupplierID INTEGER NOT NULL,
		FOREIGN KEY (SupplierID) REFERENCES User(SupplierID),
		PRIMARY KEY(RestockOrderID)
	);`
	this.dbConnection.run(createRestockOrderTable, (err) => {
			if (err) {
				console.log("Error creating Restock Order table", err);
			}
	});
	
	const createRestockOrderProductTable = `CREATE TABLE RestockOrderProduct (
		SKUID INTEGER NOT NULL,
		RestockOrderID INTEGER NOT NULL,
		Count INTEGER NOT NULL,
		FOREIGN KEY (SKUID) REFERENCES SKU(SKUID),
		FOREIGN KEY (RestockOrderID) REFERENCES RestockOrder(RestockOrderID),
		PRIMARY KEY(SKUID, RestockOrderID)
	);`
	this.dbConnection.run(createRestockOrderProductTable, (err) => {
		if (err) {
			console.log("Error creating RestockOrderProduct table", err);
		}
	});
	
	const createRestockOrderSKUItemTable = `CREATE TABLE RestockOrderSKUItem (
		SKUItemRFID INTEGER NOT NULL,
		RestockOrderID INTEGER NOT NULL,
		FOREIGN KEY (SKUItemRFID) REFERENCES SKUItem(SKUItemRFID),
		FOREIGN KEY (RestockOrderID) REFERENCES RestockOrder(RestockOrderID),
		PRIMARY KEY(SKUItemRFID, RestockOrderID)
	);`
	this.dbConnection.run(createRestockOrderSKUItemTable, (err) => {
			if (err) {
				console.log("Error creating RestockOrderSKUItem table", err);
			}
	});
	
	const createReturnOrderTable = `CREATE TABLE ReturnOrder (
		ReturnOrderID INTEGER NOT NULL,
		ReturnDate VARCHAR(20) NOT NULL,
		TransportNote VARCHAR(20) NOT NULL,
		RestockOrderID INTEGER NOT NULL,
		FOREIGN KEY (RestockOrderID) REFERENCES RestockOrder(RestockOrderID)
		PRIMARY KEY(ReturnOrderID)
	);`
	this.dbConnection.run(createReturnOrderTable, (err) => {
			if (err) {
				console.log("Error creating Return Order table", err);
			}
	});
  }

  dropTables() {
    const dropSKUTable = `DROP TABLE SKU;`;
    this.dbConnection.run(dropSKUTable, (err) => {
      if (err) {
        console.log("Error dropping SKU table", err);
      }
    });

    const dropSKUTestDescriptorTable = `DROP TABLE SKUTestDescriptor;`;
    this.dbConnection.run(dropSKUTestDescriptorTable, (err) => {
      if (err) {
        console.log("Error dropping SKUTestDescriptor table", err);
      }
    });

    const dropSKUItemTable = `DROP TABLE SKUItem;`;
    this.dbConnection.run(dropSKUItemTable, (err) => {
      if (err) {
        console.log("Error dropping SKUItem table", err);
      }
    });

    const dropSKUItemTestResultTable = `DROP TABLE SKUItemTestResults;`;
    this.dbConnection.run(dropSKUItemTestResultTable, (err) => {
      if (err) {
        console.log("Error dropping SKUItemTestResult table", err);
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
	
	const dropInternalOrderProductsTable = `DROP TABLE InternalOrderProducts;`;
	this.dbConnection.run(dropInternalOrderProductsTable, (err) => {
		if (err) {
			console.log("Error dropping InternalOrderProducts table", err);
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
	
	const dropRestockOrderProductsTable = `DROP TABLE RestockOrderProducts;`;
	this.dbConnection.run(dropRestockOrderProductsTable, (err) => {
		if (err) {
			console.log("Error dropping RestockOrderProducts table", err);
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

module.exports = DbHelper;
