const sqlite3 = require("sqlite3");
const TestDescriptor = require("./TestDescriptor");
const TestResult = require("./TestResult");
const { User } = require("./User");
const Item = require("./Item");
const RestockOrder = require("./RestockOrder");

class DbHelper {
  constructor(dbName = "./dev.db") {
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
    const createSKUTable = `CREATE TABLE IF NOT EXISTS SKU (
    		SKUID INTEGER NOT NULL,
    		Description VARCHAR(100) NOT NULL,
    		Weight DOUBLE NOT NULL,
    		Volume DOUBLE NOT NULL,
    		Price DOUBLE NOT NULL,
    		Notes VARCHAR(100),
    		Position VARCHAR(20),
    		AvailableQuantity INTEGER NOT NULL,
    		PRIMARY KEY(SKUID)
		);`;
    this.dbConnection.run(createSKUTable, (err) => {
      if (err) {
        console.log("Error creating SKU table", err);
      }
    });

    const createSKUTestDescriptorTable = `CREATE TABLE IF NOT EXISTS SKUTestDescriptor (
    		SKUID INTEGER NOT NULL,
    		TestDescriptorID INTEGER NOT NULL,
    		PRIMARY KEY(SKUID, TestDescriptorID),
    		FOREIGN KEY (SKUID) REFERENCES SKU(SKUID),
    		FOREIGN KEY (TestDescriptorID) REFERENCES TestDescriptor(TestDescriptorID)
		);`;
    this.dbConnection.run(createSKUTestDescriptorTable, (err) => {
      if (err) {
        console.log("Error creating SKUTestDescriptor table", err);
      }
    });

    const createSKUItemTable = `CREATE TABLE IF NOT EXISTS SKUItem (
    		RFID VARCHAR(20) NOT NULL,
    		SKUID INTEGER NOT NULL,
    		Available INTEGER NOT NULL,
    		DateOfStock VARCHAR(11) NOT NULL,
    		PRIMARY KEY (RFID),
    		FOREIGN KEY (SKUID) references SKU(SKUID)
		);`;
    this.dbConnection.run(createSKUItemTable, (err) => {
      if (err) {
        console.log("Error creating SKUItem table", err);
      }
    });

    const createSKUItemTestResultTable = `CREATE TABLE IF NOT EXISTS SKUItemTestResult (
    		RFID VARCHAR(20) NOT NULL,
    		TestResultID INTEGER NOT NULL,
    		PRIMARY KEY (RFID, TestResultID),
    		FOREIGN KEY (RFID) REFERENCES SKUItem(RFID),
    		FOREIGN KEY (TestResultID) REFERENCES TestResult(TestResultID)
		);`;
    this.dbConnection.run(createSKUItemTestResultTable, (err) => {
      if (err) {
        console.log("Error creating SKUItemTestResult table", err);
      }
    });

    const createPositionTable = `CREATE TABLE IF NOT EXISTS Position (
    		PositionID VARCHAR(20) NOT NULL,
    		AisleID VARCHAR(20) NOT NULL,
    		Row VARCHAR(20) NOT NULL,
    		Col VARCHAR(20) NOT NULL,
    		MaxWeight DOUBLE NOT NULL,
    		MaxVolume DOUBLE NOT NULL,
    		OccupiedWeight DOUBLE,
    		OccupiedVolume DOUBLE,
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
			Name VARCHAR(20) NOT NULL,
			Surname VARCHAR(20) NOT NULL,
			Email VARCHAR(20) NOT NULL,
			Type VARCHAR(30) NOT NULL,
			Password VARCHAR(30) NOT NULL,
			PRIMARY KEY (UserID)
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
			date VARCHAR(20) NOT NULL,
			result BOOLEN NOT NULL,
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
    		FOREIGN KEY (SKUID) REFERENCES SKU(SKUID),
    		FOREIGN KEY (SupplierId) REFERENCES User(UserID)
		);`;
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
		CustomerId INTEGER NOT NULL,
		PRIMARY KEY(InternalOrderID),
		FOREIGN KEY (CustomerId) REFERENCES User(UserID)
	);`;
    this.dbConnection.run(createInternalOrderTable, (err) => {
      if (err) {
        console.log("Error creating InternalOrder table", err);
      }
    });

    const createInternalOrderProductTable = `CREATE TABLE IF NOT EXISTS InternalOrderProduct (
		SKUID INTEGER NOT NULL,
		InternalOrderID INTEGER NOT NULL,
		Count INTEGER NOT NULL,
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
		FOREIGN KEY (SupplierID) REFERENCES User(UserID),
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
		Count INTEGER NOT NULL,
		PRIMARY KEY(ItemID, RestockOrderID),
		FOREIGN KEY (ItemID) REFERENCES Item(ItemID),
		FOREIGN KEY (RestockOrderID) REFERENCES RestockOrder(RestockOrderID)
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
		FOREIGN KEY (RFID) REFERENCES SKUItem(RFID),
		FOREIGN KEY (RestockOrderID) REFERENCES RestockOrder(RestockOrderID)
		
	);`;
    this.dbConnection.run(createRestockOrderSKUItemTable, (err) => {
      if (err) {
        console.log("Error creating RestockOrderSKUItem table", err);
      }
    });

    const createReturnOrderTable = `CREATE TABLE IF NOT EXISTS ReturnOrder (
		ReturnOrderID INTEGER NOT NULL,
		ReturnDate VARCHAR(20) NOT NULL,
		TransportNote VARCHAR(20) NOT NULL,
		RestockOrderID INTEGER NOT NULL,
		PRIMARY KEY(ReturnOrderID),
		FOREIGN KEY (RestockOrderID) REFERENCES RestockOrder(RestockOrderID)
	);`;
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

  // TestDescriptor
  getTestDescriptors() {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM TestDescriptor";
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        const tds = rows.map(
          (r) =>
            new TestDescriptor(
              r.TestDescriptorID,
              r.Name,
              r.ProcedureDescription,
              r.SKUID
            )
        );
        resolve(tds);
      });
    });
  }

  createTestDescriptor(name, procedureDescription, idSKU) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO TestDescriptor (Name, ProcedureDescription, SKUID)
      VALUES (${name}, ${procedureDescription}, ${idSKU})`;
      this.db.run(sql, function (err) {
        if (err) {
          reject(err);
          return;
        }
      });
      resolve();
    });
  }

  modifyTestDescriptor(testDescriptor) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE TestDescriptor SET Name=${testDescriptor.name},
         ProcedureDescription=${testDescriptor.procedureDescription},
         SKUID=${testDescriptor.SKUID}
         WHERE TestDescriptorID=${testDescriptor.id}`;
      this.db.run(sql, function (err) {
        if (err) {
          reject(err);
          return;
        }
      });
      resolve();
    });
  }

  deleteTestDescriptor(id) {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM TestDescriptor WHERE TestDescriptorID=${id}`;
      this.db.run(sql, function (err) {
        if (err) {
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
      const sql = `SELECT * FROM TestResult WHERE RFID=${RFID}`;
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        const trs = rows.map(
          (r) =>
            new TestResult(
              r.RFID,
              r.TestResultID,
              r.TestDescriptorID,
              R.date,
              r.result
            )
        );
        resolve(trs);
      });
    });
  }

  getTestResultByIDAndRFID(RFID, id) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM TestResult WHERE RFID=${RFID}
       AND TestResultID=${id}`;
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        const trs = rows.map(
          (r) =>
            new TestResult(
              r.RFID,
              r.TestResultID,
              r.TestDescriptorID,
              R.date,
              r.result
            )
        );
        resolve(trs);
      });
    });
  }

  addTestResult(RFID, idTestDescriptor, date, result) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO TestResult (RFID, TestDescriptorID, date, result)
      VALUES (${RFID}, ${idTestDescriptor}, ${date}, ${result})`;
      this.db.run(sql, function (err) {
        if (err) {
          reject(err);
          return;
        }
      });
      resolve();
    });
  }

  modifyTestResult(testResult) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE TestResult SET
         TestDescriptorID=${testResult.idTestDescriptor},
         date=${testResult.date},
         result=${testResult.result}
         WHERE TestResultID=${testResult.id} AND RFID=${testResult.RFID}`;
      this.db.run(sql, function (err) {
        if (err) {
          reject(err);
          return;
        }
      });
      resolve();
    });
  }

  deleteTestResult(RFID, id) {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM TestResult WHERE
       TestResultID=${id} AND RFID=${RFID}`;
      this.db.run(sql, function (err) {
        if (err) {
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
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        const users = rows.map(
          (u) =>
            new User(u.UserID, u.Name, u.Surname, u.Email, u.Type, u.Password)
        );
        resolve(users);
      });
    });
  }

  getUsers() {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM User WHERE Type<>"manager"'; //also ADMIN??
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        const users = rows.map(
          (u) =>
            new User(u.UserID, u.Name, u.Surname, u.Email, u.Type, u.Password)
        );
        resolve(users);
      });
    });
  }

  createUser(email, name, surname, password, type) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO User (Name, Surname, Email, Type, Password)
      VALUES (${name}, ${surname}, ${email}, ${type}, ${password})`;
      this.db.run(sql, function (err) {
        if (err) {
          reject(err);
          return;
        }
      });
      resolve();
    });
  }

  modifyUserRights(email, oldType, newType) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE User SET
         Type=${newType}
         WHERE Email=${email} AND Type=${oldType}`;
      this.db.run(sql, function (err) {
        if (err) {
          reject(err);
          return;
        }
      });
      resolve();
    });
  }

  deleteUser(email, type) {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM User WHERE Email=${email} AND Type=${type}`;
      this.db.run(sql, function (err) {
        if (err) {
          reject(err);
          return;
        }
      });
      resolve();
    });
  }

  getUserByEmail(email) {
    const sql = `SELECT * FROM User WHERE Email=${email}`;
    this.db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const users = rows.map(
        (u) =>
          new User(u.UserID, u.Name, u.Surname, u.Email, u.Type, u.Password)
      );
      resolve(users);
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
        const tds = rows.map(
          (r) =>
            new Item(r.ItemID, r.Description, r.Price, r.SKUID, r.SupplierID)
        );
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
        const i = rows.map(
          (r) =>
            new Item(r.ItemID, r.Description, r.Price, r.SKUID, r.SupplierID)
        );
        resolve(i);
      });
    });
  }

  getRestockOrders() {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM RestockOrder;";
      this.dbConnection.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        console.log(rows);
        const products=[];
        const SKUItems=[];
        if (rows.length === 0){
          const tds = [];
        }
        else{
          const tds = rows.map(
            (r) =>
              new RestockOrder(r.RestockOrderID, r.IssueDate, r.State, products, r.SupplierID, r.TransportNode, SKUItems)
          );
          console.log(tds)
        }
        resolve(tds);
      });
    });
  }

  getRestockOrdersIssued() {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM RestockOrder WHERE state='ISSUED';";
      this.dbConnection.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        const products=[];
        const SKUItems=[];
        let tds = [];
        if (rows.length !== 0){
          tds = rows.map(
            (r) =>
              new RestockOrder(r.RestockOrderID, r.IssueDate, r.State, products, r.SupplierID, r.TransportNode, SKUItems)
          );
        }
        resolve(tds);
      });
    });
  }

  getRestockOrderByID(id) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM RestockOrder WHERE RestockOrderID= ${id};`;
      this.dbConnection.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        const products=[];
        const SKUItems=[];
        let tds = [];
        if (rows.length !== 0){
          tds = rows.map(
            (r) =>
              new RestockOrder(r.RestockOrderID, r.IssueDate, r.State, products, r.SupplierID, r.TransportNode, SKUItems)
          );
        }
        resolve(tds);
      });
    });
  }

  /* Should modify sql */
  getRestockOrderReturnItems(id) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT SKUID, RFID FROM SKUItem;`;
/*    SELECT SKUID, RFID FROM SKUItem as s
      JOIN SKUItemTestResult as r
      JOIN RestockOrderProduct as p
      JOIN Item as i
      WHERE s.SKUItemID=r.SKUItemID and
      s.SKUItemID=p.SKUItemID and
      s.SKUItemID=i.SKUItemID and
      p.RestockOrderID = ${id} and
      it haven't passed at least one quality test` */
      this.dbConnection.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        const products=[];
        const SKUItems=[];
        let tds = [];
        if (rows.length !== 0){
          tds = rows.map(
            (r) =>
              new SKUItem(r.RFID, r.SKUID)
          );
        }
        resolve(tds);
      });
    });
  }

  // products array doesn't pass ItemID
  createRestockOrder(issueDate, products, supplierID) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO RestockOrder
      (IssueDate, SupplierID, State, TransportNote)
      values
      ('${issueDate}', ${supplierID}, 'ISSUED', 'ISSUED'); `;
      this.dbConnection.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  modifyRestockOrder(id, newState) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE RestockOrder
      SET State='${newState}'
      WHERE RestockOrderID=${id}`;
      this.dbConnection.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  addSkuItemsToRestockOrder(ID, skuItems){
    return new Promise((resolve, reject) => {

      //create insert statement for multiple SKUItems
      let sql = `INSERT INTO RestockOrderSkuItem
      (RFID, RestockOrderID)
      values `;
      skuItems.forEach(item => {
        sql+=`('${item.RFID}', ${ID}),`
      });
      sql=sql.slice(0, -1);
      sql+=`;`;
      //end of creating sql statement

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

  addTransportNoteToRestockOrder(ID, transportNote){
    return new Promise((resolve, reject) => {
      const sql=`update RestockOrder set TransportNote='${transportNote}' where RestockOrderID=${ID}`
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
  
  // also delete from other tables?
  deleteRestockOrder(ID){
    return new Promise((resolve, reject) => {
      const sql=`delete from RestockOrder where RestockOrderID=${ID}`
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
