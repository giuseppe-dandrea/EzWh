// noinspection ExceptionCaughtLocallyJS

const DbHelper = require("./DbHelper.js");
const SKU = require("./SKU.js");
const TestDescriptor = require("./TestDescriptor.js");
const Position = require("./Position.js");
const EzWhException = require("./EzWhException.js");
const SKUItem = require("./SKUItem");
const Item = require("./Item.js");
const { User } = require("./User");

class EzWhFacade {
  constructor() {
    this.db = new DbHelper("./dev.db");
    // FIXME: createHardcoded users is called before create tables are complete
    // Like this for now because we have to separate in DAOs
    this.db.createTables().then(() => this.createHardcodedUsers());
  }

  async createHardcodedUsers() {
    try {
      await this.createUser("manager1@ezwh.com", "Michael", "Scott", "testpassword", "manager");
      await this.createUser("supplier1@ezwh.com", "Best", "Supplier", "testpassword", "supplier");
      await this.createUser("deliveryEmployee1@ezwh.com", "UPS", "Guy", "testpassword", "deliveryEmployee");
      await this.createUser("clerk1@ezwh.com", "Michael", "Reeves", "testpassword", "clerk");
      await this.createUser("qualityEmployee1@ezwh.com", "Creed", "Bratton", "testpassword", "qualityEmployee");
      await this.createUser("user1@ezwh.com", "John", "Doe", "testpassword", "customer");
    } catch (err) {
      console.log("Hardcoded users already added");
    }
  }


  //TestDescriptor

  // TestResult

  // User

  /***POSITION***/


  /***ITEMS***/

  /***RestockOrder***/


  /***ReturnOrder***/


  /***InternalOrder***/

}
module.exports = EzWhFacade;
