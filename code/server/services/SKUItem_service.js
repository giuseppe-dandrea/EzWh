const dao = require("../database/SKUItem_dao");
const SKU_dao = require("../database/SKU_dao");
const SKUItem = require("../modules/SKUItem");
const EzWhException = require("./src/EzWhException.js");

class SKUItemService {
    constructor() {
    }

    async getSKUItems() {
        try {
            let skuItemsJson = await dao.getSKUItems();
            let skuItems = skuItemsJson.map((s) => new SKUItem(s.RFID, s.SKUID, s.Available, s.DateOfStock));
            for (let s of skuItems) {
                s.sku = await SKU_dao.getSKUById(s.sku);
                //TODO: add testResults if needed
            }
            return skuItems;
        } catch (err) {
            throw EzWhException.InternalError;
        }
    }

    async getSKUItemsBySKU(SKUID) {
        try {
            await SKU_dao.getSKUById(SKUID);
            let skuItemsJson = await dao.getSKUItemsBySKU(SKUID);
            let skuItems = skuItemsJson.map((s) => new SKUItem(s.RFID, s.SKUID, s.Available, s.DateOfStock));
            for (let s of skuItems) {
                s.sku = await SKU_dao.getSKUById(s.sku);
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
            let skuItemJson = await dao.getSKUItemByRfid(rfid);
            if (skuItemJson === undefined) throw EzWhException.NotFound;
            let skuItem = new SKUItem(skuItemJson.RFID, skuItemJson.SKUID, skuItemJson.Available, skuItemJson.DateOfStock);
            skuItem.sku = await SKU_dao.getSKUById(skuItem.sku);
            //TODO: add testResults if needed
            return skuItem;
        } catch (err) {
            if (err === EzWhException.NotFound) throw EzWhException.NotFound;
            else throw EzWhException.InternalError;
        }
    }

    async deleteSKUItem(rfid) {
        try {
            return await dao.deleteSKUItem(rfid);
        } catch (err) {
            throw EzWhException.InternalError;
        }
    }

    //USED ONLY FOR TESTING
    async deleteAllSKUItems() {
        try {
            return await dao.deleteAllSKUItems();
        } catch (err) {
            throw EzWhException.InternalError;
        }
    }

    async modifySKUItem(rfid, newRfid, newAvailable, newDateOfStock) {
        try {
            await this.getSKUItemByRfid(rfid);
            await dao.modifySKUItem(rfid, newRfid, newAvailable, newDateOfStock);
        } catch (err) {
            if (err === EzWhException.NotFound) throw EzWhException.NotFound;
            else throw EzWhException.InternalError;
        }
    }

    async createSKUItem(rfid, SKUId, dateOfStock) {
        try {
            await SKU_dao.getSKUById(SKUId);
            await dao.createSKUItem(rfid, SKUId, dateOfStock);
        } catch (err) {
            if (err === EzWhException.NotFound) throw EzWhException.NotFound;
            else if (err.code === "SQLITE_CONSTRAINT" && err.errno === 19) {
                // If there is already a skuitem with the same rfid
                throw EzWhException.InternalError;
            } else throw EzWhException.InternalError;
        }
    }

}

module.exports = SKUItemService;
