const DbHelper = require("./DbHelper.js");

class EzWhFacade {
  constructor() {
    this.db = new DbHelper("../test.db");
    this.db.createTables();
  }
}

module.exports = EzWhFacade;
