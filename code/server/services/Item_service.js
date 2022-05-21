const dao = require("../database/Item_dao");
const SKU_dao = require("../database/SKU_dao");
const User_dao = require("../database/User_dao");
const Item = require("../modules/Item");
const EzWhException = require("./src/EzWhException.js");

class ItemService {
    constructor() {
    }

    async getItems() {
        try {
            return await dao.getItems();
        } catch (err) {
            throw EzWhException.InternalError;
        }
    }

    async getItemByID(id) {
        try {
            let item = await dao.getItemByID(id);
            if (typeof item !== "undefined" && item.length === 0) throw EzWhException.NotFound;
            else return item[0];
        } catch (err) {
            if (err === EzWhException.NotFound) throw EzWhException.NotFound;
            else throw EzWhException.InternalError;
        }
    }

    async createItem(ItemID, Description, Price, SKUID, SupplierID) {
        try {
            await this.getSKUById(SKUID);
            let suppliers = await this.getSuppliers();
            let supplier = suppliers.find(({id}) => id === SupplierID);
            if (supplier === undefined) throw EzWhException.InternalError;
            const item = new Item(ItemID, Description, Price, SKUID, SupplierID);
            return await dao.createItem(item);
        } catch (err) {
            if (err.code === "SQLITE_CONSTRAINT" && err.errno === 19) throw EzWhException.EntryNotAllowed; //ItemID already exists
            else if (err === EzWhException.NotFound) throw EzWhException.NotFound;
            else throw EzWhException.InternalError;
        }
    }

    async modifyItem(id, newDescription, newPrice) {
        try {
            await this.getItemByID(id);
            return await dao.modifyItem(id, newDescription, newPrice);
        } catch (err) {
            if (err === EzWhException.NotFound) throw EzWhException.NotFound;
            else throw EzWhException.InternalError;
        }
    }

    async deleteItem(id) {
        try {
            return await dao.deleteItem(id);
        } catch (err) {
            throw EzWhException.InternalError;
        }
    }

}

module.exports = ItemService;
