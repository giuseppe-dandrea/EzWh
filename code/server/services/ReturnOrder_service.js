const dao = require("../database/ReturnOrder_dao");
const SKU_dao = require("../database/SKU_dao");
const SKUItem_dao = require("../database/SKUItem_dao");
const ReturnOrder = require("../modules/ReturnOrder");
const EzWhException = require("./src/EzWhException.js");

class ReturnOrderService {
    constructor() {
    }

    async createReturnOrder(returnDate, products, restockOrderID) {
        const returnOrderID = await dao.createReturnOrder(returnDate, restockOrderID);
        for (let product of products) {
            await dao.createReturnOrderProducts(returnOrderID, product.RFID)
        }
    }

    async getReturnOrderProducts(returnOrderID) {
        let returnProducts = [];
        const products = await dao.getReturnOrderProducts(returnOrderID);
        console.log(`products: ${products}`)
        for (let product of products) {
            const SKUItem = await SKUItem_dao.getSKUItemByRfid(product.RFID);
            console.log(`SKUItem: ${SKUItem}`)
            const SKU = await SKU_dao.getSKUById(SKUItem.SKUID)
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
        const returnOrders = await dao.getReturnOrders();
        console.log(returnOrders);
        for (let returnOrder of returnOrders) {
            const products = await this.getReturnOrderProducts(returnOrder.id);
            console.log(products);
            for (let p of products) {
                returnOrder.addProduct(p);
            }
        }
        return returnOrders;
    }

    async getReturnOrderByID(ID) {
        const returnOrder = await dao.getReturnOrderByID(ID);
        const products = await this.getReturnOrderProducts(ID);
        for (let p of products) {
            returnOrder.addProduct(p);
        }
        return returnOrder;
    }

    async deleteReturnOrder(ID) {
        await dao.deleteReturnOrder(ID);
    }

}

module.exports = ReturnOrderService;
