const dao = require("../database/RestockOrder_dao");
const Item_dao = require("../database/Item_dao");
const SKUItem_dao = require("../database/SKUItem_dao");
const RestockOrder = require("../modules/RestockOrder");
const EzWhException = require("./src/EzWhException.js");

class RestockOrderService {
    constructor() {
    }

    async getRestockOrderProducts(ID) {
        const productsJson = await dao.getRestockOrderProductsByRestockOrderID(ID);
        let products = []
        for (let p of productsJson) {
            const itemID = p.ItemID;
            let item = await Item_dao.getItemByID(itemID);
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

    async getRestockOrderSKUItems(ID) {
        const skuItemsJson = await dao.getRestockOrderSKUItemsByRestockOrderID(ID);
        let skuItems = [];
        for (let s of skuItemsJson) {
            const RFID = s.RFID;
            const SKU = await SKUItem_dao.getSKUItemByRfid(RFID);
            const SKUID = SKU.SKUID;
            const skuItem = {"RFID": RFID, "SKUId": SKUID}
            skuItems.push(skuItem);
        }
        return skuItems;
    }

    async getRestockOrders(state) {
        let restockOrderIDs = await dao.getRestockOrders(state);
        let restockOrders = [];
        for (let r of restockOrderIDs) {
            const id = r.RestockOrderID;
            const restockOrder = await this.getRestockOrderByID(id);
            restockOrders.push(restockOrder);
        }
        return restockOrders;
    }

    async getRestockOrderByID(id) {
        const restockOrder = await dao.getRestockOrderByID(id);
        if (restockOrder === undefined) {
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

    async getRestockOrderReturnItems(id) {
        let restockOrderReturnItems = await dao.getRestockOrderReturnItems(id);
        if (restockOrderReturnItems === undefined) throw EzWhException.NotFound;
        else return restockOrderReturnItems;
    }

    async createRestockOrder(issueDate, products, supplierID) {
        const restockOrderID = await dao.createRestockOrder(issueDate, supplierID);
        console.log(restockOrderID);
        for (let product of products) {
            const item = await Item_dao.getItemBySKUIDAndSupplierID(product.SKUId, supplierID);
            console.log(item);
            if (item === undefined) {
                throw EzWhException.EntryNotAllowed;
            }
            await dao.createRestockOrderProduct(item.id, restockOrderID, product.qty);
        }
    }

    async modifyRestockOrderState(id, newState) {
        const rowChanges = await dao.modifyRestockOrderState(id, newState);
        if (rowChanges === 0) {
            throw EzWhException.NotFound;
        }
    }

    async addSkuItemsToRestockOrder(ID, skuItems) {
        console.log("inside facade addSkuItemsToRestockOrder")
        const restockOrder = await dao.getRestockOrderByID(ID);
        console.log(restockOrder);
        if (restockOrder === undefined) throw EzWhException.NotFound;
        if (restockOrder.state !== "DELIVERED") throw EzWhException.EntryNotAllowed;
        for (let skuItem of skuItems) {
            await dao.addSkuItemToRestockOrder(ID, skuItem.rfid);
        }
    }

    async addTransportNoteToRestockOrder(ID, transportNote) {
        const restockOrder = await dao.getRestockOrderByID(ID);
        if (restockOrder === undefined) throw EzWhException.NotFound;
        if (restockOrder.state !== "DELIVERED") throw EzWhException.EntryNotAllowed;
        await dao.addTransportNoteToRestockOrder(ID, JSON.stringify(transportNote));
    }

    async deleteRestockOrder(ID) {
        await dao.deleteRestockOrder(ID);
    }
}

module.exports = RestockOrderService;
