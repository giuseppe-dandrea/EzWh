const DbHelper = require("./DbHelper.js");
const SKU = require("./SKU.js");
const TestDescriptor = require("./TestDescriptor.js");
const Position = require("./Position.js");
const EzWhException = require("./EzWhException.js");
const SKUItem = require("./SKUItem");
const Item = require("./Item.js");
const { User } = require("./User");
const TestResult = require("./TestResult.js");
const InternalOrder = require("./InternalOrder.js");
const RestockOrder = require("./RestockOrder.js");

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
        if (s.position)
          s.position = await this.getPositionByID(s.position);
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
      if (sku.position)
        sku.position = await this.getPositionByID(sku.position);
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
      if (sku.position)
        await this.modifySKUPosition(
          sku.position.positionId,
          newWeight * newAvailableQuantity,
          newVolume * newAvailableQuantity,
          id
        );
      await this.db.modifySKU(id, newDescription, newWeight, newVolume, newNotes, newPrice, newAvailableQuantity);
    } catch (err) {
      if (err === EzWhException.PositionFull) throw EzWhException.PositionFull;
      else throw EzWhException.InternalError;
    }
  }

  async modifySKUPosition(positionId, newOccupiedWeight, newOccupiedVolume, SKUId) {
    try {
      let e = await this.getPositionByID(positionId);
      return await this.db.modifySKUPosition(positionId, newOccupiedWeight, newOccupiedVolume, SKUId);
    } catch (err) {
      if (err === EzWhException.NotFound) throw EzWhException.NotFound;
      if (err.code === "SQLITE_CONSTRAINT" && err.errno === 19) throw EzWhException.InternalError;
      else throw EzWhException.InternalError;
    }
  }

  async addSKUPosition(id, positionId) {
    try {
      let sku = await this.getSKUById(id);
      let position = await this.db.getPositionByID(positionId);
      if (
        position.maxWeight < sku.weight * sku.availableQuantity ||
        position.maxVolume < sku.volume * sku.availableQuantity
      )
        throw EzWhException.PositionFull;
      await this.db.modifySKUPosition(
        positionId,
        sku.weight * sku.availableQuantity,
        sku.volume * sku.availableQuantity,
        id
      );
      await this.db.addSKUPosition(id, positionId);
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
      console.log("Error in Facade");
      console.log(err);
      throw EzWhException.InternalError;
    }
  }

  async getTestDescriptorByID(id) {
    try {
      let TestDescriptorList = await this.db.getTestDescriptors();
      let td = TestDescriptorList.filter((testD) => testD.id == id)[0];
      console.log(td);
      if (td == undefined) throw EzWhException.NotFound;
      return {
        id: td.id,
        name: td.name,
        procedureDescription: td.procedureDescription,
        idSKU: td.idSKU,
      };
    } catch (err) {
      console.log("Error in Facade");
      console.log(err);
      if (err == EzWhException.NotFound) throw err;
      throw EzWhException.InternalError;
    }
  }

  async createTestDescriptor(name, procedureDescription, idSKU) {
    // TODO
    try {
      let sku = await this.db.getSKUById(idSKU);
      console.log(sku);
      if (sku == undefined) throw EzWhException.NotFound;
      await this.db.createTestDescriptor(name, procedureDescription, idSKU);
    } catch (err) {
      console.log("Error in Facade");
      console.log(err);
      if (err == EzWhException.NotFound) throw err;
      throw EzWhException.InternalError;
    }
  }

  async modifyTestDescriptor(id, newName, newProcedureDescription, newIdSKU) {
    try {
      let sku = await this.db.getSKUById(newIdSKU);
      console.log(sku);
      if (sku == undefined) throw EzWhException.NotFound;
      let td = await this.getTestDescriptorByID(id);
      if (td == undefined) throw EzWhException.NotFound;
      td.name = newName;
      td.procedureDescription = newProcedureDescription;
      td.idSKU = newIdSKU;
      console.log(td);
      await this.db.modifyTestDescriptor(td);
    } catch (err) {
      console.log("Error in Facade");
      console.log(err);
      if (err == EzWhException.NotFound) throw err;
      throw EzWhException.InternalError;
    }
  }

  async deleteTestDescriptor(id) {
    try {
      await this.db.deleteTestDescriptor(id);
    } catch (err) {
      console.log("Error in Facade");
      console.log(err);
      throw EzWhException.InternalError;
    }
  }

  // TestResult
  async getTestResultsByRFID(RFID) {
    // TODO
    try {
      let skuItem = await this.db.getSKUItemByRfid(RFID);
      console.log(skuItem);
      console.log(RFID);
      if (skuItem == undefined) throw EzWhException.NotFound;
      let TestResultList = await this.db.getTestResultsByRFID(RFID);
      console.log(TestResultList);
      return TestResultList.map((tr) => {
        return {
          id: tr.id,
          idTestDescriptor: tr.idTestDescriptor,
          Date: tr.date,
          Result: tr.result ? true : false,
        };
      });
    } catch (err) {
      console.log("Error in Facade");
      console.log(err);
      if (err == EzWhException.NotFound) throw err;
      throw EzWhException.InternalError;
    }
  }

  async getTestResultByIDAndRFID(RFID, id) {
    // TODO
    try {
      let td = await this.db.getTestResultByIDAndRFID(RFID, id);
      if (td == undefined) throw EzWhException.NotFound;
      else
        return {
          id: td.id,
          idTestDescriptor: td.idTestDescriptor,
          Date: td.date,
          Result: td.result ? true : false,
        };
    } catch (err) {
      console.log("Error in Facade");
      console.log(err);
      if (err == EzWhException.NotFound) throw err;
      throw EzWhException.InternalError;
    }
  }

  async addTestResult(RFID, idTestDescriptor, date, result) {
    // TODO
    try {
      let skuItem = await this.getSKUItemByRfid(RFID);
      console.log(RFID);
      console.log(skuItem);
      if (skuItem == undefined) throw EzWhException.NotFound;
      let tr = await this.getTestDescriptorByID(idTestDescriptor);
      console.log(idTestDescriptor);
      console.log(tr);
      if (tr == undefined) throw EzWhException.NotFound;
      await this.db.addTestResult(RFID, idTestDescriptor, date, result);
    } catch (err) {
      console.log("Error in Facade");
      console.log(err);
      if (err == EzWhException.NotFound) throw err;
      throw EzWhException.InternalError;
    }
  }

  async modifyTestResult(RFID, id, newIdTestDescriptor, newDate, newResult) {
    //TODO
    try {
      await this.getSKUItemByRfid(RFID);
      console.log(newIdTestDescriptor);
      await this.getTestDescriptorByID(newIdTestDescriptor);
      let tr = await this.db.getTestResultByIDAndRFID(RFID, id);
      if (tr === undefined) throw EzWhException.NotFound;
      tr.idTestDescriptor = newIdTestDescriptor;
      tr.date = newDate;
      tr.result = newResult;
      await this.db.modifyTestResult(tr);
    } catch (err) {
      console.log("Error in Facade: ModifyTestResult");
      console.log(err);
      if (err === EzWhException.NotFound) throw err;
      throw EzWhException.InternalError;
    }
  }

  async deleteTestResult(RFID, id) {
    try {
      await this.db.deleteTestResult(RFID, id);
    } catch (err) {
      console.log("Error in Facade");
      console.log(err);
      throw EzWhException.InternalError;
    }
  }

  // User
  getUserInfo(id) {} // TODO

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
      console.log("Error in Facade");
      console.log(err);
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
      console.log("Error in Facade");
      console.log(err);
      throw EzWhException.InternalError;
    }
  }

  async createUser(email, name, surname, password, type) {
    //TODO
    try {
      let u = await this.db.getUserByEmail(email, type);
      console.log(u);
      if (u != undefined) throw EzWhException.Conflict;
      let my_pwd = User.storePassword(password);
      await this.db.createUser(email, name, surname, my_pwd, type);
    } catch (err) {
      console.log("Error in Facade");
      console.log(err);
      if (err == EzWhException.Conflict) throw err;
      throw EzWhException.InternalError;
    }
  }

  async login(email, password, type) {
    // TODO
    try {
      let u = await this.db.getUserByEmail(email, type);
      if (u == undefined) throw EzWhException.Unauthorized;
      else {
        if (u.verifyPassword(password)) {
          return {
            id: u.id,
            username: u.email,
            name: u.name,
            surname: u.surname,
          };
        } else throw EzWhException.Unauthorized;
      }
    } catch (err) {
      console.log("Error in Facade");
      console.log(err);
      if (err == EzWhException.Unauthorized) throw err;
      throw EzWhException.InternalError;
    }
  }

  logout(id) {} // TODO

  async modifyUserRights(email, oldType, newType) {
    try {
      let u = await this.db.getUserByEmail(email, oldType);
      if (u == undefined) throw EzWhException.NotFound;
      await this.db.modifyUserRights(email, oldType, newType);
    } catch (err) {
      console.log("Error in Facade");
      console.log(err);
      if (err == EzWhException.NotFound) throw err;
      throw EzWhException.InternalError;
    }
  }

  async deleteUser(email, type) {
    try {
      await this.db.deleteUser(email, type);
    } catch (err) {
      console.log("Error in Facade");
      console.log(err);
      throw EzWhException.InternalError;
    }
  }

  async getUserByEmail(email, type) {
    try {
      let u = await this.db.getUserByEmail(email, type);
      if (u == undefined) throw EzWhException.NotFound;
      return {
        id: u.id,
        name: u.name,
        surname: u.surname,
      };
    } catch (err) {
      console.log("Error in Facade");
      console.log(err);
      if (err == EzWhException.NotFound) throw err;
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
      else return position[0];
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

  /***RestockOrder***/

  async getRestockOrderProducts(ID){
    const productsJson = await this.db.getRestockOrderProductsByRestockOrderID(ID);
    let products = []
    for (let p of productsJson){
      const itemID = p.ItemID;
      let item = await this.db.getItemByID(itemID);
      item = item[0];
      const product = {
        "SKUId": item.id,
        "description": item.description,
        "price": item.price,
        "qty": p.QTY,
      }
      products.push(product);
    }
    return products;
  }

  async getRestockOrderSKUItems(ID){
    const skuItemsJson = await this.db.getRestockOrderSKUItemsByRestockOrderID(ID);
    let skuItems = [];
    for (let s of skuItemsJson){
      const RFID = s.RFID;
      const SKU = await this.db.getSKUItemByRfid(RFID);
      const SKUID = SKU.SKUID;
      const skuItem = {"RFID": RFID,"SKUId": SKUID}
      skuItems.push(skuItem);
    }
    return skuItems;
  }

  async getRestockOrders(state){
    let restockOrderIDs = await this.db.getRestockOrders(state);
    let restockOrders = [];
    for (let r of restockOrderIDs){
      const id = r.RestockOrderID;
      const restockOrder = await this.getRestockOrderByID(id);
      restockOrders.push(restockOrder);
    }
    return restockOrders;
  }

  async getRestockOrderByID(id){
    const restockOrder = await this.db.getRestockOrderByID(id);
    if (restockOrder===undefined){
      return undefined;
    }
    const products = await this.getRestockOrderProducts(id);
    const skuItems = await this.getRestockOrderSKUItems(id);
    console.log(products)
    restockOrder.concatProducts(products);
    restockOrder.concatSKUItems(skuItems);
    console.log(restockOrder)
    return restockOrder;
  }

  async getRestockOrderReturnItems(id){
    let restockOrderReturnItems = await this.db.getRestockOrderReturnItems(id);
    if (restockOrderReturnItems===undefined) throw EzWhException.NotFound;
    else return restockOrderReturnItems;
  }  
  
  async createRestockOrder(issueDate, products, supplierID){
    const restockOrderID = await this.db.createRestockOrder(issueDate, supplierID);
    console.log(restockOrderID);
    for (let product of products){
      const item = await this.db.getItemBySKUIDAndSupplierID(product.SKUId, supplierID);
      console.log(item);
      if (item===undefined){
        throw EzWhException.EntryNotAllowed;
      }
      await this.db.createRestockOrderProduct(item.id, restockOrderID, product.qty);
    }
    return;
  } 

  async modifyRestockOrderState(id, newState){
    const rowChanges = await this.db.modifyRestockOrderState(id, newState);
    if (rowChanges===0){
      throw EzWhException.NotFound;
    }
    return;
  } 

  async addSkuItemsToRestockOrder(ID, skuItems){
    console.log("inside facade addSkuItemsToRestockOrder")
    const restockOrder = await this.db.getRestockOrderByID(ID);
    console.log(restockOrder);
    if (restockOrder===undefined) throw EzWhException.NotFound;
    if (restockOrder.state!=="DELIVERED") throw EzWhException.EntryNotAllowed;
    for (let skuItem of skuItems){
      await this.db.addSkuItemToRestockOrder(ID, skuItem.rfid);
    }
    return;
  } 

  async addTransportNoteToRestockOrder(ID, transportNote){
    const restockOrder = await this.db.getRestockOrderByID(ID);
    if (restockOrder===undefined) throw EzWhException.NotFound;
    if (restockOrder.state!=="DELIVERED") throw EzWhException.EntryNotAllowed;
    await this.db.addTransportNoteToRestockOrder(ID, JSON.stringify(transportNote));
    return;
  }

  async deleteRestockOrder(ID){
    await this.db.deleteRestockOrder(ID);
    return;
  }  

  /***ReturnOrder***/

  async createReturnOrder(returnDate, products, restockOrderID) {
    const returnOrderID = await this.db.createReturnOrder(returnDate, restockOrderID);
    for (let product of products){
      await this.db.createReturnOrderProduct(returnOrderID, product.RFID)
    }
    return;
  }

  async getReturnOrderProducts(returnOrderID){
    let returnProducts = [];
    const products = await this.db.getReturnOrderProducts(returnOrderID);
    console.log(`products: ${products}`)
    for (let product of products){
      const SKUItem = await this.db.getSKUItemByRfid(product.RFID);
      console.log(`SKUItem: ${SKUItem}`)
      const SKU = await this.db.getSKUById(SKUItem.SKUID)
      console.log(`SKUs: ${SKU}`)
      const returnProduct =
        {
          "SKUId": SKUItem.SKUID,
          "description": SKU.Description,
          "price": SKU.Price,
          "RFID": product.RFID,
        }
        returnProducts.push(returnProduct);
    }
    return returnProducts;
  }

  async getReturnOrders() {
    const returnOrders = await this.db.getReturnOrders();
    console.log(returnOrders);
    for (let returnOrder of returnOrders){
      const products = await this.getReturnOrderProducts(returnOrder.id);
      console.log(products);
      for (let p of products){
        returnOrder.addProduct(p);
      }
    }
    return returnOrders;
  }

  async getReturnOrderByID(ID) {
    const returnOrder = await this.db.getReturnOrderByID(ID);
    const products = await this.getReturnOrderProducts(ID);
    for (let p of products){
      returnOrder.addProduct(p);
    }
    return returnOrder;
  }

  async deleteReturnOrder(ID) {
    await this.db.deleteReturnOrder(ID);
    return;
  }

  /***InternalOrder***/
  async createInternalOrder(issueDate, products, customerID) {
    const lastID = await this.db.createInternalOrder(issueDate, customerID);
    for (let product of products){
      await this.db.CreateInternalOrderProduct(lastID, product.SKUId, product.qty)
    }
    return;
  }

  async getInternalOrders(state) {
    const internalOrders = await this.db.getInternalOrders(state);
    for (let internalOrder of internalOrders){
      const state = internalOrder.state;
      let products = [];
      if (state==="COMPLETED"){
        products = await this.getInternalOrderProducts(internalOrder.id);
      }
      else{
        products = await this.getInternalOrderSKUItems(internalOrder.id);
      }
      internalOrder.concatProducts(products)
    }
    return internalOrders;
  }

  async getInternalOrdersIssued(){
    return this.getInternalOrders("ISSUED");
  }

  async getInternalOrdersAccepted(){
    return this.getInternalOrders("ACCEPTED");
  }

  async getInternalOrderProducts(ID){
    let products = []
    let internalOrderProducts = await this.db.getInternalOrderSKUItemByInternalOrderID(ID);
    for (let internalProduct of internalOrderProducts){
      let RFID = internalProduct.RFID;
      let SKU = await this.db.getSKUItemByRfid(RFID);
      if (SKU!==undefined){
        let RFID = internalProduct.RFID;
        let product = {
          "SKUId": SKU.SKUID,
          "description": SKU.Description,
          "price": SKU.Price,
          "RFID": RFID,
        }
        products.push(product);
      }
    }
    return products;
  }

  async getInternalOrderSKUItems(ID){
    let products = []
    let internalOrderProducts = await this.db.getInternalOrderProductByInternalOrderID(ID);
    for (let internalProduct of internalOrderProducts){
      let SKUID = internalProduct.SKUID;
      let SKU = await this.db.getSKUById(SKUID);
      if (SKU!==undefined){
        let QTY = internalProduct.QTY;
        let product = {
          "SKUId": SKU.SKUID,
          "description": SKU.Description,
          "price": SKU.Price,
          "qty": QTY,
        }
        products.push(product);
      }
    }
    return products;
  }

  async getInternalOrderByID(ID) {
    const internalOrder = await this.db.getInternalOrderByID(ID);
    if (internalOrder===undefined){
      return undefined;
    }
    const state = internalOrder.state;
    let products = [];
    if (state==="COMPLETED"){
      products = await this.getInternalOrderProducts(internalOrder.id);
      
    }
    else{
      products = await this.getInternalOrderSKUItems(internalOrder.id);
    }
    internalOrder.concatProducts(products)
    return internalOrder;
  }

  async modifyInternalOrder(ID, newState, products) {
    const internalOrder = await this.getInternalOrderByID(ID);
    if (internalOrder===undefined){
      return undefined;
    }
    await this.db.modifyInternalOrderState(ID, newState);
    if (products && newState==="COMPLETED"){
      // await this.db.deleteInternalOrderSKUItemByInternalOrderID(ID);
      for (let p of products){
        await this.db.createInternalOrderSKUItem(ID, p.RFID);
      }
    }
    return true;
  }

  async deleteInternalOrder(ID) {
    await this.db.deleteInternalOrder(ID);
    return;
  }
}

module.exports = EzWhFacade;
