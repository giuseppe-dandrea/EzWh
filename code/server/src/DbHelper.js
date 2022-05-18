const sqlite3 = require("sqlite3");
const TestDescriptor = require("./TestDescriptor");
const TestResult = require("./TestResult");
const { User, UserTypes } = require("./User");
const Item = require("./Item");
const Position = require("./Position");
const RestockOrder = require("./RestockOrder");
const ReturnOrder = require("./ReturnOrder");
const InternalOrder = require("./InternalOrder");
const SKUItem = require("./SKUItem");
const EzWhException = require("./EzWhException");

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
      }
    });
    const createInternalOrderTable = `CREATE TABLE IF NOT EXISTS InternalOrder (
		InternalOrderID INTEGER NOT NULL,
		IssueDate VARCHAR(20) NOT NULL,
		State VARCHAR(20) NOT NULL,
		CustomerID INTEGER NOT NULL,
		PRIMARY KEY(InternalOrderID),
		FOREIGN KEY (CustomerID) REFERENCES User(UserID)
	);`;
    this.dbConnection.run(createInternalOrderTable, (err) => {
      if (err) {
        console.log("Error creating InternalOrder table", err);
      }
    });

    const createInternalOrderProductTable = `CREATE TABLE IF NOT EXISTS InternalOrderProduct (
		SKUID INTEGER NOT NULL,
		InternalOrderID INTEGER NOT NULL,
		QTY INTEGER NOT NULL,
		PRIMARY KEY(SKUID, InternalOrderID),
		FOREIGN KEY (SKUID) REFERENCES SKU(SKUID),
		FOREIGN KEY (InternalOrderID) REFERENCES InternalOrder(InternalOrderID)
	);`;
    this.dbConnection.run(createInternalOrderProductTable, (err) => {
      if (err) {
        console.log("Error creating InternalOrderProduct table", err);
      }
    });

    const createInternalOrderSKUItemTable = `CREATE TABLE IF NOT EXISTS InternalOrderSKUItem (
		RFID INTEGER NOT NULL,
		InternalOrderID INTEGER NOT NULL,
		PRIMARY KEY(RFID, InternalOrderID),
		FOREIGN KEY (RFID) REFERENCES SKUItem(RFID),
		FOREIGN KEY (InternalOrderID) REFERENCES InternalOrder(InternalOrderID)
	);`;
    this.dbConnection.run(createInternalOrderSKUItemTable, (err) => {
      if (err) {
        console.log("Error creating Internal OrderSKUItem table", err);
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
          return;
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
            return;
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
          return;
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
          return;
        }
        const trs = rows.map((r) => new TestResult(r.RFID, r.TestResultID, r.TestDescriptorID, r.date, r.result));
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
          return;
        }
        const trs = rows.map((r) => new TestResult(r.RFID, r.TestResultID, r.TestDescriptorID, r.date, r.result));
        resolve(trs[0]);
      });
    });
  }

  addTestResult(RFID, idTestDescriptor, date, result) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO TestResult (TestResultID, RFID, TestDescriptorID, date, result)
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
         TestDescriptorID=?, date=?,
         result=? WHERE TestResultID=?AND RFID=?`;
      this.dbConnection.run(
        sql,
        [testResult.idTestDescriptor, testResult.date, testResult.result, testResult.id, testResult.rfid],
        function (err) {
          if (err) {
            console.log("Error in DB");
            console.log(err);
            reject(err);
            return;
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
          return;
        }
      });
      resolve();
    });
  }

  // User
  getUserInfo(id) {} //TO DO

  getSuppliers() {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM User WHERE Type="supplier"';
      this.dbConnection.all(sql, [], (err, rows) => {
        if (err) {
          console.log("Error in DB");
          console.log(err);
          reject(err);
          return;
        }
        const users = rows.map((u) => new User(u.UserID, u.Name, u.Surname, u.Email, u.Type, u.Password));
        resolve(users);
      });
    });
  }

  getUsers() {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM User WHERE Type<>"manager"'; //also ADMIN??
      this.dbConnection.all(sql, [], (err, rows) => {
        if (err) {
          console.log("Error in DB");
          console.log(err);
          reject(err);
          return;
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
          return;
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
          return;
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
          return;
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
          return;
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
          return;
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
          return;
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
              r.OccupiedVolume
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
        [position.positionId, position.aisleId, position.row, position.col, position.maxWeight, position.maxVolume],
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

  // modify to get products and skuItems, join RestockOrderProduct and RestockOrderSKUItem?
  getRestockOrders(state) {
    return new Promise((resolve, reject) => {
      let sql = ``;
      if (state) sql = `SELECT * FROM RestockOrder WHERE state='${state}';`
      else sql = `SELECT * FROM RestockOrder;`;
      this.dbConnection.all(sql, function(err, rows){
        if (err) {
          reject(err);
          return;
        }
        // console.log(rows);
        const products = [];
        const SKUItems = [];
        let tds = [];
        if (rows.length !== 0) {
          tds = rows.map(
            (r) =>
              new RestockOrder(
                r.RestockOrderID,
                r.IssueDate,
                r.State,
                products,
                r.SupplierID,
                r.TransportNode,
                SKUItems
              )
          );
        }
        console.log(tds);
        resolve(tds);
      });
    });
  }

  //get products and skuItems
  getRestockOrderByID(id) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM RestockOrder WHERE RestockOrderID= ${id};`;
      this.dbConnection.all(sql, function(err, rows){
        console.log(rows);
        if (err) {
          reject(err);
          return;
        }
        const products=[];
        const SKUItems=[];
        let tds = undefined;
        if (rows.length !== 0){
          tds = rows.map(
            (r) =>
              new RestockOrder(r.RestockOrderID, r.IssueDate, r.State, products, r.SupplierID, r.TransportNode, SKUItems)
          )[0];
        }
        resolve(tds);
      });
    });
  }

  getRestockOrderReturnItems(ID) {
    return new Promise((resolve, reject) => {
      const select_sql=`select RestockOrderID from RestockOrder where RestockOrderID=${ID}`
      this.dbConnection.all(select_sql, function(err, rows){
        if (err) {
          reject(err);
          return;
        }
        else{
          if (rows.length===0){
            resolve(undefined);
            return;
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

  createRestockOrder(issueDate, products, supplierID) {
    return new Promise((resolve, reject) => {
      const db = this.dbConnection;
      let restockOrderID = undefined;
      const sql = `INSERT INTO RestockOrder
      (IssueDate, SupplierID, State, TransportNote)
      values
      ('${issueDate}', ${supplierID}, 'ISSUED', 'ISSUED'); `;
      db.run(sql, function(err){
        if (err) {
          reject(err);
          return;
        }
        restockOrderID = this.lastID;
        let product;
        let promises=[];
        let new_promise;
        for (product of products){
          new_promise = new Promise((resolve, reject)=>{
            console.log(`product SKUID is ${product.SKUId}`);
            const get_ItemID_sql = `select ItemID from Item
            where SKUID=${product.SKUId} and
            SupplierID=${supplierID}`;
            db.all(get_ItemID_sql, function(err, rows){
              // console.log("inside get_ItemID_sql callback!")
              if (err) {
                console.log(`err get_ItemID_sql: ${err}`);
                reject(err);
                return;
              }
              // console.log(`rows is ${rows}`);
              if (rows.length===0){
                console.log(`ItemID does not exist for SupplierID=${supplierID} and SKUID=${product.SKUId}`);
                reject(EzWhException.EntryNotAllowed);
              }
              else{
                const row = rows[0];
                const insert_ItemID_sql = `insert into RestockOrderProduct (ItemID, RestockOrderID, QTY)
                values (${row.ItemID}, ${restockOrderID}, ${product.qty})`
                db.run(insert_ItemID_sql, function(err){
                  if (err) {
                    reject(err);
                    return;
                  }
                  console.log(`ItemID ${row.ItemID} inserted in RestockOrderProduct!`);
                  resolve();
                });
              }
            });
          });
          promises.push(new_promise);
        }
        Promise.all(promises).then(()=>{
          console.log("all product promises resolved!");
          resolve();
        }).catch((err)=>{
          reject(err)
        });
      });
    });
  }

  modifyRestockOrder(id, newState) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE RestockOrder
      SET State='${newState}'
      WHERE RestockOrderID=${id}`;
      this.dbConnection.run(sql, function(err){
        if (err) {
          reject(err);
          return;
        }
        if (this.changes===0){
          reject(EzWhException.NotFound);
          return;
        }
        resolve();
      });
    });
  }

  check_404_RestockOrder(ID){
    return new Promise((resolve, reject)=>{
      // if id not in db return 404
      const select_id_sql = `select RestockOrderID from RestockOrder
      where RestockOrderID=${ID}`
      this.dbConnection.all(select_id_sql, function(err, rows){
        if (err) {
          reject(err);
          return;
        }
        if (rows.length===0){
          reject(EzWhException.NotFound);
          return;
        }
        else{
          resolve();
        }
      });
    })
  }
  check_422_RestockOrder(ID){
    return new Promise((resolve, reject)=>{
      // if order state != delivered return 422
      const select_state_sql = `select RestockOrderID from RestockOrder
      where RestockOrderID=${ID} and
      State='DELIVERED'`
      this.dbConnection.all(select_state_sql, function(err, rows){
        if (err) {
          reject(err);
          return;
        }
        console.log(`select_state_sql rows: ${rows}`)
        if (rows.length===0){
          reject(EzWhException.EntryNotAllowed);
          return;
        }
        else{
          resolve();
        }
      });
    });
  }

  addSkuItemsToRestockOrder(ID, skuItems){
    return new Promise((resolve, reject) => {
      this.check_404_RestockOrder(ID)
      .then(()=>{return this.check_422_RestockOrder(ID)})
      .then(()=>{
        return new Promise((resolve, reject)=>{
          //create insert statement for multiple SKUItems
          let sql = `INSERT INTO RestockOrderSkuItem
          (RFID, RestockOrderID)
          values `;
          skuItems.forEach(item => {
            sql+=`('${item.RFID}', ${ID}),`
          });
          sql=sql.slice(0, -1)+`;`;  //remove last , and add ;
          //end of creating sql statement
    
          console.log(sql);
          this.dbConnection.run(sql, function(err, rows){
            if (err) {
              reject(err);
              return;
            }
            resolve();
          });
        });
      })
      .then(()=>{
        resolve();
      }).catch((err)=>{
        reject(err);
      });

    });
  }

  addTransportNoteToRestockOrder(ID, transportNote) {
    return new Promise((resolve, reject) => {
      this.check_404_RestockOrder(ID)
      .then(()=>{return this.check_422_RestockOrder(ID)})
      .then(()=>{
        return new Promise((resolve, reject)=>{
          const sql=`update RestockOrder set TransportNote='${transportNote}' where RestockOrderID=${ID}`
          console.log(sql);
          this.dbConnection.run(sql, function(err, rows){
            if (err) {
              reject(err);
              return;
            }
            resolve();
          });
        });
      })
      .then(()=>{
        resolve();
      }).catch((err)=>{
        reject(err);
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
          return;
        }
        resolve();
      });
    });
  }

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

  createReturnOrder(returnDate, products, restockOrderID) {
    return new Promise((resolve, reject) => {
      this.check_404_RestockOrder(restockOrderID)
      .then(()=>{
        const db = this.dbConnection;
        const sql = `insert into ReturnOrder (ReturnDate, RestockOrderId)
        values ('${returnDate}', ${restockOrderID});`;
        this.dbConnection.run(sql, function (err) {
          if (err){
            reject(err);
            return;
          }
          else {
            console.log(`this.lastID is ${this.lastID}`);
            if (products) {
              var stmt = db.prepare("insert into ReturnOrderProduct (RFID, ReturnOrderID) values (?, ?)");
              products.forEach((item) => {
                stmt.run(item.RFID, this.lastID);
                console.log(`RFID is ${item.RFID}`);
              });
              stmt.finalize();
            }
            resolve();
          }
        });
      }).catch((err)=>{
        reject(err);
      });
    });
  }

  getReturnOrders(ID) {
    return new Promise((resolve, reject) => {
      let sql = `SELECT
        r.ReturnOrderID,
        r.ReturnDate,
        r.RestockOrderID,
        si.RFID,
        s.SKUID,
        s.Description,
        s.Price
      FROM ReturnOrder as r
      inner join ReturnOrderProduct as rp
      inner join SKUItem si
      inner join SKU s
      where r.ReturnOrderID = rp.ReturnOrderID and
      rp.RFID = si.RFID and
      si.SKUID = s.SKUID`;
      if (ID!==undefined){
        sql+=` and r.ReturnOrderID = ${ID}`
      }
      sql+=`;`;
      this.dbConnection.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        let r_map=new Map();
        let tds = [];
        if (rows.length === 0) {
          resolve([]);
        }
        else{
          let row;
          let r;
          for (row of rows){
            // get this ReturnOrderID from map
            r=r_map.get(row.ReturnOrderID);
            // If not in map, create a new one and store in r
            if (r===undefined){
              r =
                new ReturnOrder(
                  row.ReturnOrderID,
                  row.ReturnDate,
                  [],
                  row.RestockOrderID
                );
            }
            // r is a new ReturnOrder or we got from map, push the new product
            r.products.push(
              {
                "SKUId": row.SKUID,
                "description": row.Description,
                "price": row.Price,
                "RFID": row.RFID
              }
            );
            //update map
            r_map.set(row.ReturnOrderID, r);
            
          }
        }
        tds = Array.from(r_map.values());
        console.log(tds);
        resolve(tds);
      });
    });
  }

  getReturnOrderByID(ID) {
    return this.getReturnOrders(ID);
  }

  deleteReturnOrder(ID) {
    return new Promise((resolve, reject) => {
      const sql = `delete from ReturnOrder where ReturnOrderID=${ID}`;
      console.log(sql);
      this.dbConnection.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  //Here products are products, in PUT they are SKUItems
  createInternalOrder(issueDate, products, customerID) {
    return new Promise((resolve, reject) => {
      const db = this.dbConnection;
      const sql = `insert into InternalOrder (IssueDate, CustomerID, State)
      values ('${issueDate}', ${customerID}, 'ISSUED');`;
      console.log(sql);
      this.dbConnection.run(sql, function (err) {
        if (err) reject(err);
        else {
          console.log(`this.lastID is ${this.lastID}`);
          if (products) {
            var stmt = db.prepare("insert into InternalOrderProduct (InternalOrderID, SKUID, QTY) values (?, ?, ?)");
            products.forEach((item) => {
              stmt.run(item.SKUId, this.lastID, item.qty);
              console.log(`SKUID is ${item.SKUId}`);
            });
            stmt.finalize();
          }
          resolve();
        }
      });
    });
  }

  // shoould complete products and skuItems
  getInternalOrders(state) {
    return new Promise((resolve, reject) => {
      let sql = `SELECT * FROM InternalOrder`;
      if (state !== undefined) {
        sql += ` where State='${state}'`;
      }
      sql += `;`;
      this.dbConnection.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        let tds = [];
        if (rows.length !== 0) {
          const products = [];
          const SKUItems = [];
          tds = rows.map(
            (r) => new InternalOrder(r.InternalOrderID, r.IssueDate, r.State, products, r.CustomerID, SKUItems)
          );
        }
        console.log("internalOrders rows:");
        console.log(rows);
        console.log("internalOrders tds:");
        console.log(tds);
        resolve(tds);
      });
    });
  }

  getInternalOrderByID(ID) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM InternalOrder WHERE InternalOrderID= ${ID};`;
      this.dbConnection.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        const products = [];
        const SKUItems = [];
        let tds = [];
        if (rows.length !== 0) {
          tds = rows.map(
            (r) => new InternalOrder(r.InternalOrderID, r.IssueDate, r.State, products, r.CustomerID, SKUItems)
          );
        }
        resolve(tds);
      });
    });
  }

  modifyInternalOrder(ID, newState, products) {
    return new Promise((resolve, reject) => {
      if (newState) {
        const sql = `update InternalOrder
        SET State='${newState}'
        where InternalOrderID=${ID}`;
        this.dbConnection.all(sql, [], (err, rows) => {
          if (err) {
            reject(err);
            return;
          }
          if (products) {
            // add update for products
          }
          console.log(`newState is ${newState}`);
          resolve();
        });
      }
    });
  }

  deleteInternalOrder(ID) {
    return new Promise((resolve, reject) => {
      const sql = `delete from InternalOrder where InternalOrderID=${ID}`;
      console.log(sql);
      this.dbConnection.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }
}
module.exports = DbHelper;
