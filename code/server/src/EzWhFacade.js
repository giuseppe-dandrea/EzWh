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
    this.db.createTables();
  }

  async getSKUs() {
    try {
      let skusJson = await this.db.getSKUs();
      let skus = skusJson.map(
        (s) =>
          new SKU(
            s["SKUID"],
            s["Description"],
            s["Weight"],
            s["Volume"],
            s["Notes"],
            s["Price"],
            s["AvailableQuantity"],
            s["Position"]
          )
      );
      for (let s of skus) {
        let testDescriptorsJson = await this.db.getTestDescriptorsBySKUID(s.id);
        testDescriptorsJson.forEach((t) =>
          s.addTestDescriptor(
            new TestDescriptor(t["TestDescriptorID"], t["Name"], t["ProcedureDescription"], t["SKUID"])
          )
        );
        // TODO: Uncomment when position ready
        // let positionJson = await this.db.getPositionById(s.position);
        // s.position = new Position(positionJson["PositionID"], positionJson["AisleID"], positionJson["Row"], positionJson["Col"], positionJson["MaxWeight"], positionJson["MaxVolume"], positionJson["OccupiedWeight"], positionJson["OccupiedVolume"], positionJson["SKUID"]);
      }
      return skus;
    } catch (err) {
      throw EzWhException.InternalError;
    }
  }

  async createSKU(description, weight, volume, notes, price, availableQuantity) {
    try {
      return await this.db.createSKU(description, weight, volume, notes, price, availableQuantity);
    } catch (err) {
      throw EzWhException.InternalError;
    }
  }

  async getSKUById(id) {
    try {
      let skuJson = await this.db.getSKUById(id);
      if (skuJson === undefined) {
        throw EzWhException.NotFound;
      }
      let sku = new SKU(
        skuJson["SKUID"],
        skuJson["Description"],
        skuJson["Weight"],
        skuJson["Volume"],
        skuJson["Notes"],
        skuJson["Price"],
        skuJson["AvailableQuantity"],
        skuJson["Position"]
      );
      let testDescriptorsJson = await this.db.getTestDescriptorsBySKUID(sku.id);
      testDescriptorsJson.forEach((t) =>
        sku.addTestDescriptor(
          new TestDescriptor(t["TestDescriptorID"], t["Name"], t["ProcedureDescription"], t["SKUID"])
        )
      );
      // TODO: Uncomment when position ready
      // let positionJson = await this.db.getPositionById(s.position);
      // sku.position = new Position(positionJson["PositionID"], positionJson["AisleID"], positionJson["Row"], positionJson["Col"], positionJson["MaxWeight"], positionJson["MaxVolume"], positionJson["OccupiedWeight"], positionJson["OccupiedVolume"], positionJson["SKUID"]);
      return sku;
    } catch (err) {
      if (err === EzWhException.NotFound) throw EzWhException.NotFound;
      else throw EzWhException.InternalError;
    }
  }

  async modifySKU(id, newDescription, newWeight, newVolume, newNotes, newPrice, newAvailableQuantity) {
    try {
      let sku = await this.getSKUById(id);
      if (
        sku.position &&
        (sku.position.maxWeight < newWeight * newAvailableQuantity ||
          sku.position.maxVolume < newVolume * newAvailableQuantity)
      )
        throw EzWhException.PositionFull;
      await this.db.modifySKU(id, newDescription, newWeight, newVolume, newNotes, newPrice, newAvailableQuantity);
      if (sku.position)
        await this.modifyPosition(
          sku.position.positionId,
          sku.position.aisleId,
          sku.position.row,
          sku.position.col,
          sku.position.maxWeight,
          sku.position.maxVolume,
          newWeight * newAvailableQuantity,
          newVolume * newAvailableQuantity
        );
    } catch (err) {
      if (err === EzWhException.PositionFull) throw EzWhException.PositionFull;
      else throw EzWhException.InternalError;
    }
  }

  async addSKUPosition(id, positionId) {
    try {
      let sku = await this.getSKUById(id);
      let position = await this.getPositionById(positionId);
      if (
        position.maxWeight < sku.weight * sku.availableQuantity ||
        position.maxVolume < sku.volume * sku.availableQuantity
      )
        throw EzWhException.PositionFull;
      await this.db.addSKUPosition(id, positionId);
      await this.modifyPosition(
        position.positionId,
        position.aisleId,
        position.row,
        position.col,
        position.maxWeight,
        position.maxVolume,
        sku.weight * sku.availableQuantity,
        sku.volume * sku.availableQuantity
      );
    } catch (err) {
      if (err === EzWhException.NotFound) throw EzWhException.NotFound;
      else if (err === EzWhException.PositionFull) throw EzWhException.PositionFull;
      else throw EzWhException.InternalError;
    }
  }

  async deleteSKU(id) {
    try {
      return await this.db.deleteSKU(id);
    } catch (err) {
      throw EzWhException.InternalError;
    }
  }

  async getSKUItems() {
    try {
      let skuItemsJson = await this.db.getSKUItems();
      let skuItems = skuItemsJson.map((s) => new SKUItem(s.RFID, s.SKUID, s.Available, s.DateOfStock));
      for (let s of skuItems) {
        s.sku = await this.getSKUById(s.sku);
        //TODO: add testResults if needed
      }
      return skuItems;
    } catch (err) {
      throw EzWhException.InternalError;
    }
  }

  async getSKUItemsBySKU(SKUID) {
    try {
      let sku = await this.getSKUById(SKUID);
      let skuItemsJson = await this.db.getSKUItemsBySKU(SKUID);
      let skuItems = skuItemsJson.map((s) => new SKUItem(s.RFID, s.SKUID, s.Available, s.DateOfStock));
      for (let s of skuItems) {
        s.sku = await this.getSKUById(s.sku);
        //TODO: add testResults if needed
      }
      return skuItems;
    } catch (err) {
      if (err === EzWhException.NotFound) throw EzWhException.NotFound;
      else throw EzWhException.InternalError;
    }
  }

  async getSKUItemByRfid(rfid) {
    try {
      let skuItemJson = await this.db.getSKUItemByRfid(rfid);
      if (skuItemJson === undefined) throw EzWhException.NotFound;
      let skuItem = new SKUItem(skuItemJson.RFID, skuItemJson.SKUID, skuItemJson.Available, skuItemJson.DateOfStock);
      skuItem.sku = await this.getSKUById(skuItem.sku);
      //TODO: add testResults if needed
      return skuItem;
    } catch (err) {
      if (err === EzWhException.NotFound) throw EzWhException.NotFound;
      else throw EzWhException.InternalError;
    }
  }

  async deleteSKUItem(rfid) {
    try {
      return await this.db.deleteSKUItem(rfid);
    } catch (err) {
      throw EzWhException.InternalError;
    }
  }

  async modifySKUItem(rfid, newRfid, newAvailable, newDateOfStock) {
    try {
      let skuItem = await this.getSKUItemByRfid(rfid);
      await this.db.modifySKUItem(rfid, newRfid, newAvailable, newDateOfStock);
    } catch (err) {
      if (err === EzWhException.NotFound) throw EzWhException.NotFound;
      else throw EzWhException.InternalError;
    }
  }

  async createSKUItem(rfid, SKUId, dateOfStock) {
    try {
      let sku = await this.getSKUById(SKUId);
      await this.db.createSKUItem(rfid, SKUId, dateOfStock);
    } catch (err) {
      if (err === EzWhException.NotFound) throw EzWhException.NotFound;
      else if (err.code === "SQLITE_CONSTRAINT" && err.errno === 19) {
        // If there is already a skuitem with the same rfid
        throw EzWhException.InternalError;
      } else throw EzWhException.InternalError;
    }
  }

  //TestDescriptor
  async getTestDescriptors() {
    try {
      let TestDescriptorList = await this.db.getTestDescriptors();
      return TestDescriptorList.map((td) => {
        return {
          id: td.id,
          name: td.name,
          procedureDescription: td.procedureDescription,
          idSKU: td.idSKU,
        };
      });
    } catch (err) {
      throw EzWhException.InternalError;
    }
  }

  async getTestDescriptorByID(id) {
    try {
      let TestDescriptorList = await this.db.getTestDescriptors();
      let td = TestDescriptorList.filter((testD) => testD.id == id);
      if (td == undefined) throw EzWhException.NotFound;
      return {
        id: td.id,
        name: td.name,
        procedureDescription: td.procedureDescription,
        idSKU: td.idSKU,
      };
    } catch (err) {
      throw EzWhException.InternalError;
    }
  }

  async createTestDescriptor(name, procedureDescription, idSKU) {
    try {
      // check idSKU exists (throw EzWhException.NotFound)
      await this.db.createTestDescriptor(name, procedureDescription, idSKU);
    } catch (err) {
      throw EzWhException.InternalError;
    }
  }

  async modifyTestDescriptor(id, newName, newProcedureDescription, newIdSKU) {
    try {
      let td = this.getTestDescriptorByID(id);
      if (td == undefined) throw EzWhException.NotFound;
      td.name = newName;
      td.procedureDescription = newProcedureDescription;
      td.idSKU = newIdSKU;
      await this.db.modifyTestDescriptor(td);
    } catch (err) {
      if (err == EzWhException.NotFound) throw err;
      throw EzWhException.InternalError;
    }
  }

  async deleteTestDescriptor(id) {
    try {
      await this.db.deleteTestDescriptor(id);
    } catch (err) {
      throw EzWhException.InternalError;
    }
  }

  // TestResult
  async getTestResultsByRFID(RFID) {
    try {
      //check SKUItem  throw EzWhexception.NotFound
      let TestResultList = await this.db.getTestResultsByRFID(RFID);
      if (TestResultList == undefined) throw EzWhException.NotFound;
      else
        return TestResultList.map((tr) => {
          return {
            id: tr.TestResultID,
            idTestDescriptor: tr.TestDescriptorID,
            Date: tr.date,
            Result: tr.result,
          };
        });
    } catch (err) {
      throw EzWhException.InternalError;
    }
  }

  async getTestResultByIDAndRFID(RFID, id) {
    try {
      //check SKUItem  throw EzWhexception.NotFound
      let td = await this.db.getTestResultByIDAndRFID(RFID, id);
      if (td == undefined) throw EzWhException.NotFound;
      else
        return {
          id: tr.TestResultID,
          idTestDescriptor: tr.TestDescriptorID,
          Date: tr.date,
          Result: tr.result,
        };
    } catch (err) {
      throw EzWhException.InternalError;
    }
  }

  async addTestResult(RFID, idTestDescriptor, date, result) {
    try {
      // check RFID exists (throw EzWhException.NotFound)
      let tr = this.getTestDescriptorByID(idTestDescriptor);
      if (tr == undefined) throw EzWhException.NotFound;
      await this.db.addTestResult(RFID, idTestDescriptor, date, result);
    } catch (err) {
      if (err == EzWhException.NotFound) throw err;
      throw EzWhException.InternalError;
    }
  }

  async modifyTestResult(RFID, id, newIdTestDescriptor, newDate, newResult) {
    try {
      //check RFID exists
      let td = this.getTestDescriptorByID(newIdTestDescriptor);
      if (td == undefined) throw EzWhException.NotFound;
      let tr = this.getTestResultByIDAndRFID(RFID, id);
      if (tr == undefined) throw EzWhException.NotFound;
      tr.idTestDescriptor = newIdTestDescriptor;
      tr.date = newDate;
      tr.result = newResult;
      await this.db.modifyTestResult(tr);
    } catch (err) {
      if (err == EzWhException.NotFound) throw err;
      throw EzWhException.InternalError;
    }
  }

  async deleteTestResult(RFID, id) {
    try {
      await this.db.deleteTestResult(RFID, id);
    } catch (err) {
      throw EzWhException.InternalError;
    }
  }

  // User
  getUserInfo(id) {} // TO DO

  async getSuppliers() {
    try {
      let suppliers = await this.db.getSuppliers();
      return suppliers.map((s) => {
        return {
          id: s.id,
          name: s.name,
          surname: s.surname,
          email: s.email,
        };
      });
    } catch (err) {
      throw EzWhException.InternalError;
    }
  }

  async getUsers() {
    try {
      let users = await this.db.getUsers();
      return users.map((u) => {
        return {
          id: u.id,
          name: u.name,
          surname: u.surname,
          email: u.email,
          type: u.type,
        };
      });
    } catch (err) {
      throw EzWhException.InternalError;
    }
  }

  async createUser(email, name, surname, password, type) {
    try {
      await this.db.createUser(email, name, surname, User.storePassword(password), type);
    } catch (err) {
      throw EzWhException.InternalError;
    }
  }

  async login(email, password, type) {
    try {
      let u = await this.db.getUserByEmail(email, type);
      if (u == undefined) throw EzWhException.Unauthorized;
      else {
        if (u.verifyPassword(password))
          return {
            id: u.id,
            name: u.name,
            surname: u.surname,
          };
        else throw EzWhException.Unauthorized;
      }
    } catch (err) {
      throw EzWhException.InternalError;
    }
  }

  logout(id) {} // TO DO

  async modifyUserRights(email, oldType, newType) {
    try {
      let u = await this.db.getUserByEmail(email, oldType);
      if (u == undefined) throw EzWhException.NotFound;
      await this.db.modifyUserRights(email, oldType, newType);
    } catch (err) {
      throw EzWhException.InternalError;
    }
  }

  async deleteUser(email, type) {
    try {
      await this.db.deleteUser(email, type);
    } catch (err) {
      throw EzWhException.InternalError;
    }
  }

  async getUserByEmail(email, type) {
    try {
      let u = await this.db.getUserByEmail(email, type);
      return {
        id: u.id,
        name: u.name,
        surname: u.surname,
      };
    } catch (err) {
      throw EzWhException.InternalError;
    }
  }

  /***POSITION***/

  async getPositions() {
    try {
      let postionList = await this.db.getPositions();
      return postionList;
    } catch (err) {
      throw EzWhException.InternalError;
    }
  }

  async getPositionByID(id) {
    try {
      let position = await this.db.getPositionByID(id);
      if (typeof position !== "undefined" && position.length === 0) throw EzWhException.NotFound;
      else return position;
    } catch (err) {
      if (err === EzWhException.NotFound) throw EzWhException.NotFound;
      else throw EzWhException.InternalError;
    }
  }

  async createPosition(positionID, aisleID, row, col, maxWeight, maxVolume) {
    try {
      const position = new Position(positionID, aisleID, row, col, maxWeight, maxVolume);
      return await this.db.createPosition(position);
    } catch (err) {
      if (err.code === "SQLITE_CONSTRAINT" && err.errno === 19) throw EzWhException.InternalError;
      else throw EzWhException.InternalError;
    }
  }

  async modifyPosition(
    oldID,
    newPositionID,
    newAisleID,
    newRow,
    newCol,
    newMaxWeight,
    newMaxVolume,
    newOccupiedWeight,
    newOccupiedVolume
  ) {
    try {
      let e = await this.getPositionByID(oldID);
      return await this.db.modifyPosition(
        oldID,
        newPositionID,
        newAisleID,
        newRow,
        newCol,
        newMaxWeight,
        newMaxVolume,
        newOccupiedWeight,
        newOccupiedVolume
      );
    } catch (err) {
      if (err === EzWhException.NotFound) throw EzWhException.NotFound;
      if (err.code === "SQLITE_CONSTRAINT" && err.errno === 19) throw EzWhException.InternalError;
      else throw EzWhException.InternalError;
    }
  }

  async modifyPositionID(oldID, newPositionID, newAisleID, newRow, newCol) {
    try {
      let e = await this.getPositionByID(oldID);
      return await this.db.modifyPositionID(oldID, newPositionID, newAisleID, newRow, newCol);
    } catch (err) {
      if (err === EzWhException.NotFound) throw EzWhException.NotFound;
      if (err.code === "SQLITE_CONSTRAINT" && err.errno === 19) throw EzWhException.InternalError;
      else throw EzWhException.InternalError;
    }
  }

  async deletePosition(id) {
    try {
      await this.getPositionByID(id);
      return await this.db.deletePosition(id);
    } catch (err) {
      if (err === EzWhException.NotFound) throw EzWhException.NotFound;
      else throw EzWhException.InternalError;
    }
  }

  /***ITEMS***/
  async getItems() {
    try {
      let itemList = await this.db.getItems();
      return itemList;
    } catch (err) {
      throw EzWhException.InternalError;
    }
  }

  async getItemByID(id) {
    try {
      let item = await this.db.getItemByID(id);
      if (typeof item !== "undefined" && item.length === 0) throw EzWhException.NotFound;
      else return item;
    } catch (err) {
      if (err === EzWhException.NotFound) throw EzWhException.NotFound;
      else throw EzWhException.InternalError;
    }
  }

  async createItem(ItemID, Description, Price, SKUID, SupplierID) {
    try {
      const item = new Item(ItemID, Description, Price, SKUID, SupplierID);
      return await this.db.createItem(item);
    } catch (err) {
      if (err.code === "SQLITE_CONSTRAINT" && err.errno === 19) throw EzWhException.EntryNotAllowed;
      else throw EzWhException.InternalError;
    }
  }

  async modifyItem(id, newDescription, newPrice) {
    try {
      await this.getItemByID(id);
      return await this.db.modifyItem(id, newDescription, newPrice);
    } catch (err) {
      if (err === EzWhException.NotFound) throw EzWhException.NotFound;
      else throw EzWhException.InternalError;
    }
  }
  async deleteItem(id) {
    try {
      await this.getItemByID(id);
      return await this.db.deleteItem(id);
    } catch (err) {
      if (err === EzWhException.NotFound) throw EzWhException.NotFound;
      else throw EzWhException.InternalError;
    }
  }

  async getRestockOrders(){
    try {
      let restockOrders = await this.db.getRestockOrders();
      return restockOrders;
    } catch (err) {
      throw EzWhException.InternalError;
    }
  }

  async getRestockOrdersIssued(){
    try {
      let restockOrdersIssued = await this.db.getRestockOrdersIssued();
      return restockOrdersIssued;
    } catch (err) {
      throw EzWhException.InternalError;
    }
  }

  async getRestockOrderByID(id){
    try {
      let restockOrder = await this.db.getRestockOrderByID(id);
      return restockOrder;
    } catch (err) {
      throw EzWhException.InternalError;
    }
  }
  

  async getRestockOrderReturnItems(id){
    try {
      let restockOrderReturnItems = await this.db.getRestockOrderReturnItems(id);
      return restockOrderReturnItems;
    } catch (err) {
      throw EzWhException.InternalError;
    }
  }  
  
  async createRestockOrder(issueDate, products, supplierID){
    try {
      await this.db.createRestockOrder(issueDate, products, supplierID);
      return;
    } catch (err) {
      throw EzWhException.InternalError;
    }
  } 

  async modifyRestockOrder(id, newState){
    try {
      await this.db.modifyRestockOrder(id, newState);
      return;
    } catch (err) {
      console.log(err);
      throw EzWhException.InternalError;
    }
  } 

  async addSkuItemsToRestockOrder(ID, skuItems){
    try {
      await this.db.addSkuItemsToRestockOrder(ID, skuItems);
      return;
    } catch (err) {
      console.log(err);
      throw EzWhException.InternalError;
    }
  } 

  async addTransportNoteToRestockOrder(ID, transportNote){
    try {
      await this.db.addTransportNoteToRestockOrder(ID, transportNote);
      return;
    } catch (err) {
      console.log(err);
      throw EzWhException.InternalError;
    }
  }

  async deleteRestockOrder(ID){
    try {
       await this.db.deleteRestockOrder(ID);
      return;
    } catch (err) {
      console.log(err);
      throw EzWhException.InternalError;
    }
  }  

  async createReturnOrder(returnDate, products, restockOrderID){
    try {
      await this.db.createReturnOrder(returnDate, products, restockOrderID);
      return;
   } catch (err) {
    console.log(err);
    throw EzWhException.InternalError;
   }
  }

  async getReturnOrders(){
    try {
      const returnOrders = await this.db.getReturnOrders();
      return returnOrders;
   } catch (err) {
     console.log(err);
     throw EzWhException.InternalError;
   }
  }

  async getReturnOrderByID(ID){
    try {
      const returnOrder = await this.db.getReturnOrderByID(ID);
      return returnOrder;
    } catch (err) {
      console.log(err);
      throw EzWhException.InternalError;
    }
  }

  async deleteReturnOrder(ID){
    try {
      await this.db.deleteRestockOrder(ID);
      return;
    } catch (err) {
      console.log(err);
      throw EzWhException.InternalError;
    }
  }  
}

module.exports = EzWhFacade;
