const dao = require("../database/InternalOrder_dao");
const SKU_dao = require("../database/SKU_dao");
const SKUItem_dao = require("../database/SKUItem_dao");
const InternalOrder = require("../modules/InternalOrder");
const EzWhException = require("../modules/EzWhException.js");
const {getSKUById} = require("../database/SKU_dao");
const {createInternalOrderSKUItem} = require("../database/InternalOrder_dao");

class InternalOrderService {
    constructor() {
    }

    async createInternalOrder(issueDate, products, customerID) {
        try{
            for (let product of products){//Discard order Before inserting in InternalOrder table if SKUID not found
                let sku = await SKU_dao.getSKUById(product.SKUId);
                if (sku === undefined) {
                    throw EzWhException.InternalError;
                }
            }
            const lastID = await dao.createInternalOrder(issueDate, customerID);
            for (let product of products) {
                await dao.createInternalOrderProduct(lastID, product.SKUId, product.description , product.price, product.qty);
            }
        }catch (err) {
            throw EzWhException.InternalError;
        }
    }

    async getInternalOrders(state) {
        const internalOrders = await dao.getInternalOrders(state);
        for (let internalOrder of internalOrders) {
            const state = internalOrder.state;
            let products = [];
            if (state === "COMPLETED") {
                products = await this.getInternalOrderProducts(internalOrder.id);
            } else {
                products = await this.getInternalOrderSKUItems(internalOrder.id);
            }
            internalOrder.concatProducts(products)
        }
        return internalOrders;
    }

    async getInternalOrdersIssued() {
        return this.getInternalOrders("ISSUED");
    }

    async getInternalOrdersAccepted() {
        return this.getInternalOrders("ACCEPTED");
    }

    async getInternalOrderProducts(ID) {
        let products = []
        let internalOrderProducts = await dao.getInternalOrderSKUItemByInternalOrderID(ID);
        for (let internalProduct of internalOrderProducts) {
            let RFID = internalProduct.RFID;
            let SKU = await SKUItem_dao.getSKUItemByRfid(RFID);
            if (SKU !== undefined) {
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

    async getInternalOrderSKUItems(ID) {
        let products = []
        let internalOrderProducts = await dao.getInternalOrderProductByInternalOrderID(ID);
        for (let internalProduct of internalOrderProducts) {
            let SKUID = internalProduct.SKUID;
            let SKU = await SKU_dao.getSKUById(SKUID);
            if (SKU !== undefined) {
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
        const internalOrder = await dao.getInternalOrderByID(ID);
        if (internalOrder === undefined) {
            return undefined;
        }
        const state = internalOrder.state;
        let products;
        if (state === "COMPLETED") {
            products = await this.getInternalOrderProducts(internalOrder.id);

        } else {
            products = await this.getInternalOrderSKUItems(internalOrder.id);
        }
        internalOrder.concatProducts(products)
        return internalOrder;
    }

    async modifyInternalOrder(id, newState) {
        try{
            const internalOrder = await dao.getInternalOrderByID(id);
            if (internalOrder === undefined) {
                throw EzWhException.NotFound;
            }
            await dao.modifyInternalOrderState(id, newState);
        }
        catch(err){
            if (err === EzWhException.NotFound) throw EzWhException.NotFound;
            else throw EzWhException.InternalError;
        }

    }

    async completeInternalOrder(id , newState, products){
        try{
            const internalOrder = await dao.getInternalOrderByID(id);
            if (internalOrder === undefined) {
                throw EzWhException.NotFound;
            }
            await dao.modifyInternalOrderState(id, newState);
            for (let product in products){
                await createInternalOrderSKUItem(id,product.SkuID, product.RFID)
            }
        }
        catch{
            if (err === EzWhException.NotFound) throw EzWhException.NotFound;
            else throw EzWhException.InternalError;

        }
    }

    async deleteInternalOrder(ID) {
        await dao.deleteInternalOrder(ID);
    }
}

module.exports = InternalOrderService;
