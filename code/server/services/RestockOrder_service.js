const dao = require("../database/RestockOrder_dao");
const Item_dao = require("../database/Item_dao");
const User_dao = require("../database/User_dao");
const SKUItem_dao = require("../database/SKUItem_dao");
const EzWhException = require("../modules/EzWhException.js");
const dayjs = require('dayjs');
const Item = require("../modules/Item");

class RestockOrderService {
    constructor() {
    }

    async getRestockOrderProducts(ID) {
        // console.log("inside getRestockOrderProducts!");
        // console.log(`ID is ${ID}`);
        const productsJson = await dao.getRestockOrderProductsByRestockOrderID(ID);
        let products = []
        for (let p of productsJson) {
            const itemID = p.ItemID;
            // console.log(`ItemID is ${p.ItemID}`);
            let item = await Item_dao.getItemByID(itemID);
            item = item[0];
            const product = {
                "SKUId": item.skuId,
                "description": item.description,
                "price": item.price,
                "qty": p.QTY,
            }
            products.push(product);
        }
        // console.log(products);
        return products;
    }

    async getRestockOrderSKUItems(ID) {
        const skuItemsJson = await dao.getRestockOrderSKUItemsByRestockOrderID(ID);
        let skuItems = [];
        for (let s of skuItemsJson) {
            const RFID = s.RFID;
            const SKU = await SKUItem_dao.getSKUItemByRfid(RFID);
            const SKUID = SKU.SKUID;
            const skuItem = {"rfid": RFID, "SKUId": SKU.sku}
            skuItems.push(skuItem);
        }
        return skuItems;
    }

    async getRestockOrders(state) {
        let restockOrders = await dao.getRestockOrders(state);
        // console.log(restockOrders);
        for (let restockOrder of restockOrders){
            const products = await this.getRestockOrderProducts(restockOrder.id);
            const skuItems = await this.getRestockOrderSKUItems(restockOrder.id);
            restockOrder.concatProducts(products);
            restockOrder.concatSKUItems(skuItems);
        }
        console.log(JSON.stringify(restockOrders, null, "  "));
        return restockOrders;
    }

    async getRestockOrderByID(id) {
        const restockOrder = await dao.getRestockOrderByID(id);
        if (restockOrder === undefined) {
            return undefined;
        }
        const products = await this.getRestockOrderProducts(id);
        const skuItems = await this.getRestockOrderSKUItems(id);
        restockOrder.concatProducts(products);
        restockOrder.concatSKUItems(skuItems);
        console.log(JSON.stringify(restockOrder, null, "  "));
        return restockOrder;
    }

    async getRestockOrderReturnItems(id) {
        let restockOrder = await dao.getRestockOrderByID(id);
        if (restockOrder === undefined) throw EzWhException.NotFound;
        if (restockOrder.state !== "COMPLETEDRETURN") throw EzWhException.EntryNotAllowed;
        let restockOrderReturnItems = await dao.getRestockOrderReturnItems(id);
        if (restockOrderReturnItems === undefined) throw EzWhException.NotFound;
        else return restockOrderReturnItems;
    }

    async createRestockOrder(issueDate, products, supplierID) {
        const supplier = await User_dao.getUserByID(supplierID);
        if (supplier===undefined || supplier.type !== "supplier"){
            console.log(`>>Supplier ${supplierID} not found!`);
            throw EzWhException.EntryNotAllowed;
        }
        const restockOrderID = await dao.createRestockOrder(issueDate, supplierID);
        // console.log(`>>ResstockOrderID is ${restockOrderID}!`);
        for (let product of products) {
            if(product.SKUId===undefined || product.description===undefined||
                product.price===undefined || product.qty===undefined || !Number.isInteger(product.SKUId) ||
                !Number.isInteger(product.qty) || product.qty < 0 || typeof product.price !== "number" ||
                    product.price < 0 || product.SKUId < 0 || typeof product.description !== "string") {
                await dao.deleteRestockOrder(restockOrderID);
                throw EzWhException.EntryNotAllowed;
            }
            const item = await Item_dao.getItemBySKUIDAndSupplierID(product.SKUId, supplierID);
            // console.log(`>>Item is ${item}!`);
            if (item === undefined) {
                const id = await Item_dao.createItem(new Item(`${product.SKUId}${supplierID}`, product.description, product.price, product.SKUId, supplierID));
                await dao.createRestockOrderProduct(id, restockOrderID, product.qty);
            }
            else{
                await dao.createRestockOrderProduct(item.id, restockOrderID, product.qty);
            }
        }
    }

    async modifyRestockOrderState(id, newState) {
        const rowChanges = await dao.modifyRestockOrderState(id, newState);
        if (rowChanges === 0) {
            throw EzWhException.NotFound;
        }
    }

    async addSkuItemsToRestockOrder(ID, skuItems) {
        // console.log("inside facade addSkuItemsToRestockOrder")
        const restockOrder = await dao.getRestockOrderByID(ID);
        // console.log(restockOrder);
        if (restockOrder === undefined) throw EzWhException.NotFound;
        if (restockOrder.state !== "DELIVERED") throw EzWhException.EntryNotAllowed;
        for (let skuItem of skuItems) {
            if(skuItem.SKUId===undefined||skuItem.rfid===undefined)
                throw EzWhException.EntryNotAllowed;
            let getSkuItem = await SKUItem_dao.getSKUItemByRfid(skuItem.rfid);
            if (getSkuItem === undefined || getSkuItem.sku !== skuItem.SKUId) {
                SKUItem_dao.createSKUItem(skuItem.rfid, skuItem.SKUId, restockOrder.issueDate) //modify date
                //throw EzWhException.EntryNotAllowed;
            }
        }
        for (let skuItem of skuItems) {
            await dao.addSkuItemToRestockOrder(ID, skuItem.rfid);
        }
    }

    async addTransportNoteToRestockOrder(ID, transportNote) {
        const restockOrder = await dao.getRestockOrderByID(ID);
        if (restockOrder === undefined) throw EzWhException.NotFound;
        if (restockOrder.state !== "DELIVERY") throw EzWhException.EntryNotAllowed;
        if(transportNote.deliveryDate===undefined || !dayjs(transportNote.deliveryDate, ['YYYY/MM/DD', 'YYYY/MM/DD HH:mm'], true).isValid() ||
             dayjs(transportNote.deliveryDate).isBefore(dayjs(restockOrder.issueDate)))
             throw EzWhException.EntryNotAllowed;
        await dao.addTransportNoteToRestockOrder(ID, JSON.stringify(transportNote));
    }

    async deleteRestockOrder(ID) {
        await dao.deleteRestockOrder(ID);
    }
}

module.exports = RestockOrderService;
