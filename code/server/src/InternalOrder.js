class InternalOrder{
    constructor(id, issueDate, state, products, customerId, skuItems){
        this.id = id;
        this.issueDate = issueDate;
        this.state = state;
        this.products = products;
        this.customerId = customerId;
        this.skuItems = skuItems;
    }
}

module.export = InternalOrder;