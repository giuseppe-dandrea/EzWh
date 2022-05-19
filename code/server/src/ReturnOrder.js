class ReturnOrder {
    constructor(id, returnDate, products, restockOrderId){
        this.id = id;
        this.returnDate = returnDate;
        this.products = products;
        this.restockOrderId=restockOrderId;
    }
}

module.exports = ReturnOrder;