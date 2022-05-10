import DbHelper from "./DbHelper";

class EzWhFacade {
	constructor() {
		this.db = new DbHelper("../devDB");
		this.db.createTables();
	}

}

module.exports = EzWhFacade;