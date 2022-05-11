const DbHelper = require("./DbHelper.js");

class EzWhFacade {
	constructor() {
		this.db = new DbHelper("./dev.db");
		this.db.createTables();
	}
}

module.exports = EzWhFacade;
