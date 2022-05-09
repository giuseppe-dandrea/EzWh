const sqlite3 = require('sqlite3')

class DbHelper {
	constructor(dbName) {
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
		})
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
		);`
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
		);`
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
	}
}

module.exports = DbHelper;