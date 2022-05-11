const DbHelper = require("./DbHelper.js");

class EzWhFacade {
	constructor() {
		this.db = new DbHelper("./code/server/dev.db");
		this.db.createTables();
	}
}

module.exports = EzWhFacade;
