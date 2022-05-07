class TestResult {
    constructor(id, idTestDescriptor, date, result) {
        this.id = id;
        this.idTestDescriptor = idTestDescriptor;
        this.date = date;
        this.result = result;
    }
}

module.exports = TestResult;