const dao = require("../database/InternalOrder_dao");
const SKU_dao = require("../database/SKU_dao");
const SKUItem_dao = require("../database/SKUItem_dao");
const InternalOrder = require("../modules/InternalOrder");
const EzWhException = require("../modules/EzWhException.js");
const {createSKUItem, getSKUItemByRfid} = require("../database/SKUItem_dao");
const {getSKUById} = require("../database/SKU_dao");

class InternalOrderService {
    constructor() {
    }

    async createInternalOrder(issueDate, products, customerID) {
        try{//User Verification ?
            for (let product of products){//Discard order Before inserting in InternalOrder table if SKUID not found
                if(product.SKUId===undefined || product.description===undefined||
                    product.price===undefined || product.qty===undefined || !Number.isInteger(product.SKUId) ||
                    !Number.isInteger(product.qty) || typeof product.price !== "number" ) 
                    throw EzWhException.EntryNotAllowed;
                let sku = await SKU_dao.getSKUById(product.SKUId);
                if (sku === undefined) {
                    throw EzWhException.EntryNotAllowed;
                }
            }
            // add customer check
            const lastID = await dao.createInternalOrder(issueDate, customerID);
            for (let product of products) {
                let sku = await SKU_dao.getSKUById(product.SKUId);
                await dao.createInternalOrderProduct(lastID, product.SKUId, sku.description , sku.price, product.qty);
            }
        }catch (err) {
            throw EzWhException.InternalError;
        }
    }

    async getAllInternalOrders(){
      let orders= new Array();
      let ISSUED = await this.getInternalOrders("ISSUED");
      // orders.push(... ISSUED );
      let ACCEPTED = await this.getInternalOrders("ACCEPTED");
      // orders.push(... ACCEPTED );
      let REFUSED = await this.getInternalOrders("REFUSED");
      // orders.push(... REFUSED );
      let CANCELED = await this.getInternalOrders("CANCELED");
      // orders.push(... CANCELED );
      let COMPLETED = await this.getInternalOrders("COMPLETED");
      // orders.push(... COMPLETED );
        orders=[...ISSUED, ...ACCEPTED, ...REFUSED , ...CANCELED, ...COMPLETED];
      return orders;
    }

    async getInternalOrders(state) {
        const internalOrders = await dao.getInternalOrders(state);
        for (let internalOrder of internalOrders) {
            const state = internalOrder.state;
            let products = [];
            if (state !== "COMPLETED") {
                products = await this.getInternalOrderProducts(internalOrder.id);
            } else {
                products = await this.getInternalOrderSKUItems(internalOrder.id);
            }
            for (let p of products) {
                internalOrder.addProduct(p);
            }
        }
        console.log(internalOrders);
        return internalOrders;
    }



    async getInternalOrdersIssued() {
        return this.getInternalOrders("ISSUED");
    }

    async getInternalOrdersAccepted() {
        return this.getInternalOrders("ACCEPTED");
    }


    async getInternalOrderSKUItems(ID) {
        let products = []
        let internalOrderProducts = await dao.getInternalOrderSKUItemByInternalOrderID(ID);
        for (let IOP of internalOrderProducts) {
            let skuitem = await getSKUItemByRfid(IOP.RFID);
            let sku=await getSKUById(IOP.SKUID);
            let product = {
                "SKUId": sku.id,
                "description": sku.description,
                "price": sku.price,
                "RFID": skuitem.RFID,
            }
            products.push(product);
        }
        return products;
    }
    async getInternalOrderProducts(ID) {
        let products = [];
        const internalOrderProducts = await dao.getInternalOrderProductByInternalOrderID(ID);
        for (let IOP of internalOrderProducts) {
            const sku=await SKU_dao.getSKUById(IOP.SKUID);
            const product = {
                "SKUId": sku.id,
                "description": sku.description,
                "price": sku.price,
                "qty": IOP.QTY,
            }
            products.push(product);
        }
        return products;
    }


    //GET BY ID
    async getInternalOrderByID(ID) {
        try{
            const I = await dao.getInternalOrderByID(ID);
            if (typeof I !== "undefined" && I.length === 0) throw EzWhException.NotFound;
            const IO=I[0];
            const state = IO.state;
            let products=[];
            if (state !== "COMPLETED") {
                products = await this.getInternalOrderProducts(ID);

            } else {
                products = await this.getInternalOrderSKUItems(ID);
            }
            for (let p of products) {
                IO.addProduct(p);
            }
            return IO;
        }
     catch(err){
            if(err === EzWhException.NotFound) throw EzWhException.NotFound;
            else throw EzWhException.InternalError;

     }
    }
    //State is checked in the router
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

    async completeInternalOrder(id , products){
        try{
            for (let product in products){
              //  await getSKUItemByRfid(product.RFID);
                await dao.createInternalOrderSKUItem(id,product.SkuID, product.RFID)
            }
        }
        catch(err){
             throw EzWhException.InternalError;

        }
    }

    async deleteInternalOrder(ID) {
        await dao.deleteInternalOrder(ID);
    }
}

module.exports = InternalOrderService;
