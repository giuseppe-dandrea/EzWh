class SKUItem {
	constructor(rfid, sku, dateOfStock, testResults = undefined) {
		this.rfid = rfid;
		this.sku = sku;
		this.dateOfStock = dateOfStock;
		if (testResults === undefined) {
			this.initTestResults();
		} else {
			this.testResults = testResults;
		}
	}

	initTestResults() {
		this.testResults = {};
	}

	addTestResult(testResult) {
		this.testResults[testResult.id] = testResult;
	}

	modifyTestResult(id, newIdTestDescriptor, newDate, newResult) {
		let tmpTestResult = this.testResults[id];
		tmpTestResult.idTestDescriptor = newIdTestDescriptor;
		tmpTestResult.date = newDate;
		tmpTestResult.result = newResult;
	}

	deleteTestResult(id) {
		delete this.testResults[id];
	}
}

module.exports = SKUItem;
