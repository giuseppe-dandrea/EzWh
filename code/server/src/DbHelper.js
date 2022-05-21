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

  getSKUs() {
    return new Promise((resolve, reject) => {
      const getSKUs = `SELECT * FROM SKU;`;
      this.dbConnection.all(getSKUs, (err, rows) => {
        if (err) {
          reject(err.toString());
        } else {
          resolve(rows);
        }
      });
    });
  }

  getTestDescriptorsBySKUID(skuid) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM TestDescriptor WHERE SKUID = ?;`;
      this.dbConnection.all(sql, skuid, (err, rows) => {
        if (err) {
          reject(err.toString());
        } else {
          resolve(rows);
        }
      });
    });
  }

  createSKU(description, weight, volume, notes, price, availableQuantity) {
    return new Promise((resolve, reject) => {
      const createSKU = `INSERT INTO SKU(description, weight, volume, price, notes, availableQuantity) 
							VALUES (?, ?, ?, ?, ?, ?);`;
      this.dbConnection.run(createSKU, [description, weight, volume, price, notes, availableQuantity], (err) => {
        if (err) {
          reject(err.toString());
        } else {
          resolve();
        }
      });
    });
  }

  getSKUById(id) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM SKU WHERE SKUID = ?;`;
      this.dbConnection.get(sql, id, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  modifySKU(id, newDescription, newWeight, newVolume, newNotes, newPrice, newAvailableQuantity) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE SKU SET
            Description = ?,
			Weight = ?,
			Volume = ?,
			Notes = ?,
			Price = ?,
			AvailableQuantity = ?
			WHERE SKUID = ?;`;
      this.dbConnection.run(
        sql,
        [newDescription, newWeight, newVolume, newNotes, newPrice, newAvailableQuantity, id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  addSKUPosition(id, positionId) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE SKU SET
		  	Position = ?
		  	WHERE SKUID = ?;`;
      this.dbConnection.run(sql, [positionId, id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  deleteSKU(id) {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM SKU WHERE SKUID = ?;`;
      this.dbConnection.run(sql, id, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  getSKUItems() {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM SKUItem;`;
      this.dbConnection.all(sql, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  getSKUItemsBySKU(SKUID) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM SKUItem WHERE SKUID = ? AND Available = 1;`;
      this.dbConnection.all(sql, SKUID, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  getSKUItemByRfid(rfid) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM SKUItem WHERE RFID = ?;`;
      this.dbConnection.get(sql, rfid, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  createSKUItem(rfid, SKUId, dateOfStock) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO SKUItem(rfid, skuid, available, dateofstock) VALUES (?, ?, 0, ?)`;
      this.dbConnection.run(sql, [rfid, SKUId, dateOfStock], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  modifySKUItem(rfid, newRfid, newAvailable, newDateOfStock) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE SKUItem SET
		  	RFID = ?,
		  	Available = ?,
		  	DateOfStock = ?
		  	WHERE RFID = ?;`;
      this.dbConnection.run(sql, [newRfid, newAvailable, newDateOfStock, rfid], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  deleteSKUItem(rfid) {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM SKUItem WHERE RFID = ?;`;
      this.dbConnection.run(sql, rfid, (err) => {
        if (err) reject(err);
        else resolve(err);
      });
    });
  }
  //USED ONLY FOR TESTING
  deleteAllSKUItems() {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM SKUItem `;
      this.dbConnection.run(sql, [], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // TestDescriptor
  getTestDescriptors() {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM TestDescriptor";
      this.dbConnection.all(sql, [], (err, rows) => {
        if (err) {
          console.log("Error in DB");
          console.log(err);
          reject(err);
          return;
        }
        const tds = rows.map((r) => new TestDescriptor(r.TestDescriptorID, r.Name, r.ProcedureDescription, r.SKUID));
        resolve(tds);
      });
    });
  }

  createTestDescriptor(name, procedureDescription, idSKU) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO TestDescriptor (Name, ProcedureDescription, SKUID)
      VALUES (?, ?, ?)`;
      this.dbConnection.run(sql, [name, procedureDescription, idSKU], function (err) {
        if (err) {
          console.log("Error in DB");
          console.log(err);
          reject(err);
        }
      });
      resolve();
    });
  }

  modifyTestDescriptor(testDescriptor) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE TestDescriptor SET Name=?,
         ProcedureDescription=?, SKUID=?
         WHERE TestDescriptorID=?`;
      this.dbConnection.run(
        sql,
        [testDescriptor.name, testDescriptor.procedureDescription, testDescriptor.idSKU, testDescriptor.id],
        function (err) {
          if (err) {
            console.log("Error in DB");
            console.log(err);
            reject(err);
          }
        }
      );
      resolve();
    });
  }

  deleteTestDescriptor(id) {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM TestDescriptor WHERE TestDescriptorID=?`;
      this.dbConnection.run(sql, [id], function (err) {
        if (err) {
          console.log("Error in DB");
          console.log(err);
          reject(err);
        }
      });
      resolve();
    });
  }

  //TestResult
  getTestResultsByRFID(RFID) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM TestResult WHERE RFID=?`;
      this.dbConnection.all(sql, [RFID], (err, rows) => {
        if (err) {
          console.log("Error in DB");
          console.log(err);
          reject(err);
        }
        const trs = rows.map((r) => new TestResult(r.RFID, r.TestResultID, r.TestDescriptorID, r.Date, r.Result));
        resolve(trs);
      });
    });
  }

  getTestResultByIDAndRFID(RFID, id) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM TestResult WHERE RFID=?
       AND TestResultID=?`;
      this.dbConnection.all(sql, [RFID, id], (err, rows) => {
        if (err) {
          console.log("Error in DB");
          console.log(err);
          reject(err);
        }
        const trs = rows.map((r) => new TestResult(r.RFID, r.TestResultID, r.TestDescriptorID, r.Date, r.Result));
        resolve(trs[0]);
      });
    });
  }

  addTestResult(RFID, idTestDescriptor, date, result) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO TestResult (TestResultID, RFID, TestDescriptorID, Date, Result)
      VALUES (?, ?, ?, ?, ?)`;
      this.dbConnection.run(sql, [this.idTR, RFID, idTestDescriptor, date, result], (err) => {
        if (err) {
          console.log("Error in DB");
          console.log(err);
          reject(err);
        }
        this.idTR++;
        resolve();
      });
    });
  }

  modifyTestResult(testResult) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE TestResult SET
         TestDescriptorID=?, Date=?,
         Result=? WHERE TestResultID=?AND RFID=?`;
      this.dbConnection.run(
        sql,
        [testResult.idTestDescriptor, testResult.date, testResult.result, testResult.id, testResult.rfid],
        function (err) {
          if (err) {
            console.log("Error in DB");
            console.log(err);
            reject(err);
          }
        }
      );
      resolve();
    });
  }

  deleteTestResult(RFID, id) {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM TestResult WHERE
       TestResultID=? AND RFID=?`;
      this.dbConnection.run(sql, [id, RFID], function (err) {
        if (err) {
          console.log("Error in DB");
          console.log(err);
          reject(err);
        }
      });
      resolve();
    });
  }

  // User
  getUserInfo(id) {} //TODO

  getSuppliers() {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM User WHERE Type = ?';
      this.dbConnection.all(sql, "supplier", (err, rows) => {
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

  getUsers() {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM User WHERE Type <> ?'; // also, ADMIN??
      this.dbConnection.all(sql, "manager", (err, rows) => {
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

  createUser(email, name, surname, password, type) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO User (Name, Surname, Email, Type, Password)
      VALUES (?, ?, ?, ?, ?)`;
      this.dbConnection.run(sql, [name, surname, email, type, password], function (err) {
        if (err) {
          console.log("Error in DB");
          console.log(err);
          reject(err);
        }
      });
      resolve();
    });
  }

  modifyUserRights(email, oldType, newType) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE User SET Type=?
         WHERE Email=? AND Type=?`;
      this.dbConnection.run(sql, [newType, email, oldType], function (err) {
        if (err) {
          console.log("Error in DB");
          console.log(err);
          reject(err);
        }
      });
      resolve();
    });
  }

  deleteUser(email, type) {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM User WHERE Email=? AND Type=?`;
      this.dbConnection.run(sql, [email, type], function (err) {
        if (err) {
          console.log("Error in DB");
          console.log(err);
          reject(err);
        }
      });
      resolve();
    });
  }

  getUserByEmail(email, type) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM User WHERE Email=? AND Type=?`;
      this.dbConnection.all(sql, [email, type], (err, rows) => {
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

  /***POSITION***/
  //SKUs
  getPositions() {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM Position;";
      this.dbConnection.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        }
        const positions = rows.map(
          (r) =>
            new Position(
              r.PositionID,
              r.AisleID,
              r.Row,
              r.Col,
              r.MaxWeight,
              r.MaxVolume,
              r.OccupiedWeight,
              r.OccupiedVolume
            )
        );
        resolve(positions);
      });
    });
  }
  getPositionByID(id) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM Position WHERE PositionID = ?`;
      this.dbConnection.all(sql, [id], (err, rows) => {
        if (err) {
          reject(err);
        }
        const p = rows.map(
          (r) =>
            new Position(
              r.PositionID,
              r.AisleID,
              r.Row,
              r.Col,
              r.MaxWeight,
              r.MaxVolume,
              r.OccupiedWeight,
              r.OccupiedVolume,
                r.SKUID
            )
        );
        resolve(p);
      });
    });
  }
  createPosition(position) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO Position(PositionID, AisleID, Row, Col, MaxWeight, MaxVolume) 
      VALUES (?, ?, ?, ?, ?, ?);`;
      this.dbConnection.run(
        sql,
        [position.positionID, position.aisleID, position.row, position.col, position.maxWeight, position.maxVolume],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }
  modifyPosition(
    oldID,
    newPositionID,
    newAisleID,
    newRow,
    newCol,
    newMaxWeight,
    newMaxVolume,
    newOccupiedWeight,
    newOccupiedVolume
  ) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE Position SET PositionID =${newPositionID} , AisleID = ${newAisleID}, Row =${newRow} , Col =${newCol} , MaxWeight =${newMaxWeight} , MaxVolume=${newMaxVolume} ,OccupiedWeight=${newOccupiedWeight}, OccupiedVolume =${newOccupiedVolume}
    WHERE PositionID = ${oldID};`;
      this.dbConnection.run(sql, [], (err) => {
        if (err) {
          console.error(err);
          reject(err);
        } else resolve();
      });
    });
  }

  modifySKUPosition(positionId, newOccupiedWeight, newOccupiedVolume, SKUId) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE Position SET OccupiedWeight =${newOccupiedWeight} , OccupiedVolume =${newOccupiedVolume} , SKUID =${SKUId} WHERE PositionID = ${positionId};`;
      this.dbConnection.run(sql, [], (err) => {
        if (err) {
          console.error(err);
          reject(err);
        } else resolve();
      });
    });
  }

  modifyPositionID(oldID, newPositionID, newAisleID, newRow, newCol) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE Position SET PositionID =${newPositionID} , AisleID = ${newAisleID}, Row =${newRow} , Col =${newCol} WHERE PositionID = ${oldID};`;
      this.dbConnection.run(sql, [], (err) => {
        if (err) {
          console.error(err);
          reject(err);
        } else resolve();
      });
    });
  }

  deletePosition(id) {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM Position WHERE PositionID = ?;`;
      this.dbConnection.run(sql, [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  //USED ONLY FOR TESTING
  deleteAllPositions(){
    return new Promise((resolve, reject) => {
    const sql = `DELETE FROM Position `;
    this.dbConnection.run(sql, [], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  }

  /***ITEMS***/
  getItems() {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM Item;";
      this.dbConnection.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        const tds = rows.map((r) => new Item(r.ItemID, r.Description, r.Price, r.SKUID, r.SupplierID));
        resolve(tds);
      });
    });
  }
  getItemByID(id) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM Item WHERE ItemID = ${id};`;
      this.dbConnection.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        const i = rows.map((r) => new Item(r.ItemID, r.Description, r.Price, r.SKUID, r.SupplierID));
        resolve(i);
      });
    });
  }

  /***RestockOrder***/
  getRestockOrders(state) {
    return new Promise((resolve, reject) => {
      let sql = `SELECT RestockOrderID FROM RestockOrder`;
      if (state) sql+=` where State = '${state}'`;
      sql+=`;`;
      this.dbConnection.all(sql, function (err, rows){
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  getRestockOrderByID(id) {
    return new Promise((resolve, reject) => {
      let sql = `SELECT * FROM RestockOrder WHERE RestockOrderID= ${id};`;
      this.dbConnection.get(sql, function (err, row){
        if (err) {
          reject(err);
        } else {
          if (row===undefined){
            resolve(undefined);
          }
          else{
            const tds = new RestockOrder(
              row.RestockOrderID,
              row.IssueDate,
              row.State,
              row.SupplierID,
              row.TransportNote
            );
            resolve(tds);
          }
        }
      });
    });
  }

  getRestockOrderProductsByRestockOrderID(ID){
    return new Promise((resolve, reject) => {
      let sql = `SELECT * FROM RestockOrderProduct where RestockOrderID=${ID}`;
      this.dbConnection.all(sql, function (err, rows){
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  getRestockOrderSKUItemsByRestockOrderID(ID){
    return new Promise((resolve, reject) => {
      let sql = `SELECT * FROM RestockOrderSKUItem where RestockOrderID=${ID}`;
      this.dbConnection.all(sql, function (err, rows){
        if (err) {
          reject(err);
        } else {
          // console.log(rows);
          resolve(rows);
        }
      });
    });
  }

  getRestockOrderReturnItems(ID) {
    return new Promise((resolve, reject) => {
      const select_sql=`select RestockOrderID from RestockOrder where RestockOrderID=${ID}`
      this.dbConnection.all(select_sql, (err, rows) => {
        if (err) {
          reject(err);
        }
        else{
          if (rows.length===0){
            resolve(undefined);
          }
          const sql = `select s.SKUID, s.RFID from ReturnOrder as ro
          inner join ReturnOrderProduct as rop
          inner join SKUItem as s
          inner join TestResult as t
          where ro.ReturnOrderID = rop.ReturnOrderID and
          s.RFID = rop.RFID and
          s.RFID = t.RFID and
          ro.RestockOrderID=${ID} and
          t.Result = 'false'
          group by s.RFID
          having count(*)>0;`;
          this.dbConnection.all(sql, function(err, rows){
            if (err) {
              reject(err);
              return;
            }
            const tds = rows.map(
              (r) =>
                ({"SKUId" : r.SKUID, "rfid" : r.RFID})
            );
            resolve(tds);
          });
        }
      });
    });
  }

  createRestockOrder(issueDate, supplierID) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO RestockOrder
      (IssueDate, SupplierID, State, TransportNote)
      values
      ('${issueDate}', ${supplierID}, 'ISSUED', 'ISSUED'); `;
      this.dbConnection.run(sql, function (err){
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  getItemBySKUIDAndSupplierID(SKUID, supplierID){
    return new Promise((resolve, reject) => {
      const sql = `select ItemID from Item
      where SKUID=${SKUID} and
      SupplierID=${supplierID}`;
      this.dbConnection.get(sql, function (err, row){
        if (err) {
          reject(err);
        } 
        else {
          if (row===undefined){
            resolve(undefined);
          }
          else{
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

  createRestockOrderProduct(itemID, restockOrderID, QTY){
    return new Promise((resolve, reject) => {
      const sql = `insert into RestockOrderProduct (ItemID, RestockOrderID, QTY)
      values (${itemID}, ${restockOrderID}, ${QTY})`;
      this.dbConnection.run(sql, function (err){
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  modifyRestockOrderState(id, newState) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE RestockOrder
      SET State='${newState}'
      WHERE RestockOrderID=${id}`;
      this.dbConnection.run(sql, function(err){
        if (err) {
          reject(err);
        }
        else{
          resolve(this.changes)
        }
      });
    });
  }

  addSkuItemToRestockOrder(ID, RFID){
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO RestockOrderSkuItem
      (RFID, RestockOrderID)
      values (${RFID}, ${ID});`;
      this.dbConnection.run(sql, function(err){
        if (err) {
          reject(err);
        }
        else{
          resolve(this.lastID);
        }
      });
    });
  }

  addTransportNoteToRestockOrder(ID, transportNote) {
    return new Promise((resolve, reject) => {
      const sql = `update RestockOrder set TransportNote='${transportNote}' where RestockOrderID=${ID}`;
      this.dbConnection.run(sql, function(err){
        if (err) {
          reject(err);
        }
        else{
          resolve(this.changes);
        }
      });
    });
  }

  deleteRestockOrder(ID) {
    return new Promise((resolve, reject) => {
      const sql = `delete from RestockOrder where RestockOrderID=${ID}`;
      console.log(sql);
      this.dbConnection.run(sql, function(err){
        console.log("deleted!")
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }

  /***Item***/
  createItem(item) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO Item(ItemID, Description, Price, SKUID, SupplierID) 
        VALUES (?, ?, ?, ?, ?);`;
      this.dbConnection.run(sql, [item.id, item.description, item.price, item.skuId, item.supplierId], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  modifyItem(id, newDescription, newPrice) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE Item SET Description = ?, Price = ?  WHERE ItemID = ?;`;
      this.dbConnection.run(sql, [newDescription, newPrice, id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  deleteItem(id) {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM Item WHERE ItemID = ?;`;
      this.dbConnection.run(sql, [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  /***ReturnOrder***/
  createReturnOrder(returnDate, restockOrderID) {
    return new Promise((resolve, reject) => {
      const sql = `insert into ReturnOrder (ReturnDate, RestockOrderId)
      values ('${returnDate}', ${restockOrderID});`;
      this.dbConnection.run(sql, function (err){
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  createReturnOrderProducts(ID, RFID){
    return new Promise((resolve, reject) => {
      const sql = `insert into ReturnOrderProduct (RFID, ReturnOrderID)
      values ('${RFID}', ${ID});`;
      this.dbConnection.run(sql, function (err){
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  getReturnOrderProducts(ID){
    return new Promise((resolve, reject) => {
      const sql = `select * from ReturnOrderProduct where ReturnOrderID=${ID};`;
      this.dbConnection.all(sql, function (err, rows){
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  getReturnOrders() {
    return new Promise((resolve, reject) => {
      const sql = `select * from ReturnOrder;`;
      this.dbConnection.all(sql, function (err, rows){
        if (err) {
          reject(err);
        } else {
          const tds = rows.map( (r) => new ReturnOrder(
            r.ReturnOrderID,
            r.ReturnDate,
            r.RestockOrderID
          ));
          resolve(tds);
        }
      });
    });
  }

  getReturnOrderByID(ID) {
    return new Promise((resolve, reject) => {
      const sql = `select * from ReturnOrder where ReturnOrderID=${ID};`;
      this.dbConnection.get(sql, function (err, row){
        if (err) {
          reject(err);
        } 
        else {
          if (row===undefined){
            resolve(undefined);
          }
          else{
            const tds = new ReturnOrder(
              row.ReturnOrderID,
              row.ReturnDate,
              row.RestockOrderID
            );
            resolve(tds);
          }
        }
      });
    });
  }

  deleteReturnOrder(ID) {
    return new Promise((resolve, reject) => {
      const sql = `delete from ReturnOrder where ReturnOrderID=${ID}`;
      console.log(sql);
      this.dbConnection.run(sql, [], (err) => {
        if (err) {
          reject(err);
        } else{
          resolve();
        }
      });
    });
  }

  /***InternalOrder***/
  createInternalOrderProduct(internalOrderID, SKUID, QTY){
    return new Promise((resolve, reject) => {
      const sql = `insert into InternalOrderProduct (InternalOrderID, SKUID, QTY)
      values (${internalOrderID}, ${SKUID}, ${QTY});`;
      this.dbConnection.run(sql, function (err){
        if (err) {
          reject(err.toString());
        } else {
          resolve();
        }
      });
    });
  }

  createInternalOrder(issueDate, customerID) {
    return new Promise((resolve, reject) => {
      const sql = `insert into InternalOrder (IssueDate, CustomerID, State)
      values ('${issueDate}', ${customerID}, 'ISSUED');`;
      this.dbConnection.run(sql, function (err){
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  
  getInternalOrders(state) {
    return new Promise((resolve, reject) => {
      let sql = `SELECT * FROM InternalOrder`;
      if (state) sql+=` where State = '${state}'`;
      sql+=`;`;
      this.dbConnection.all(sql, function (err, rows){
        if (err) {
          reject(err);
        }
        else {
          const tds = rows.map( (r) =>
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

  getInternalOrderByID(ID) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM InternalOrder where InternalOrderID=${ID};`;
      this.dbConnection.get(sql, function (err, row){
        if (err) {
          reject(err.toString());
        } else {
          if (row===undefined){
            resolve(undefined);
          }
          else {
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

  getInternalOrderProductByInternalOrderID(ID){
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM InternalOrderProduct where InternalOrderID=${ID};`;
      this.dbConnection.all(sql, function (err, rows){
        if (err) {
          reject(err.toString());
        } else {
          resolve(rows);
        }
      });
    });
  }

  getInternalOrderSKUItemByInternalOrderID(ID){
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM InternalOrderSKUItem where InternalOrderID=${ID};`;
      this.dbConnection.all(sql, function (err, rows){
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
  //     this.dbConnection.run(sql, function (err){
  //       if (err) {
  //         reject(err);
  //       } else {
  //         resolve();
  //       }
  //     });
  //   });
  // }

  createInternalOrderSKUItem(ID, RFID){
    return new Promise((resolve, reject) => {
      const sql = `
      insert into InternalOrderSKUItem
      (RFID, InternalOrderID)
      values ('${RFID}', ${ID})`;
      this.dbConnection.run(sql, function (err){
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  modifyInternalOrderState(ID, newState) {
    return new Promise((resolve, reject) => {
      const sql = `
      update InternalOrder
      SET State='${newState}'
      where InternalOrderID=${ID}`;
      this.dbConnection.run(sql, function (err){
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  deleteInternalOrder(ID) {
    return new Promise((resolve, reject) => {
      const sql = `delete from InternalOrder where InternalOrderID=${ID}`;
      console.log(sql);
      this.dbConnection.run(sql, [], (err) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }
}
module.exports = DbHelper;
