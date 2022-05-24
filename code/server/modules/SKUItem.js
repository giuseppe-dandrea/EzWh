class SKUItem {
	constructor(rfid, sku, available, dateOfStock) {
		this.rfid = rfid;
		this.sku = sku;
		this.available = available;
		this.dateOfStock = dateOfStock;
	}

	// addTestResult(testResult) {
	// 	this.testResults[testResult.id] = testResult;
	// }
	//
	// modifyTestResult(id, newIdTestDescriptor, newDate, newResult) {
	// 	let tmpTestResult = this.testResults[id];
	// 	tmpTestResult.idTestDescriptor = newIdTestDescriptor;
	// 	tmpTestResult.date = newDate;
	// 	tmpTestResult.result = newResult;
	// }
	//
	// deleteTestResult(id) {
	// 	delete this.testResults[id];
	// }
}

module.exports = SKUItem;
