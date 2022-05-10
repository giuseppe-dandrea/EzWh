const DbHelper = require("./DbHelper.js");

class EzWhFacade {
	constructor() {
		this.db = new DbHelper("../devDB");
		this.db.createTables();
	}

}

module.exports = EzWhFacade;