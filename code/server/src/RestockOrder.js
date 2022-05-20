class RestockOrder {
  constructor(
    id,
    issueDate,
    state,
    supplierId,
    transportNote,
    products = [],
    skuItems = []
  ) {
    this.id = id;
    this.issueDate = issueDate;
    this.state = state;
    this.supplierId = supplierId;
    this.transportNote = transportNote;
    this.products = products;
    this.skuItems = skuItems;
  }

  addProduct(product){
    this.products.push(product);
  }

  concatProducts(products){
    this.products = this.products.concat(products);
  }

  addSKUItem(SKUItem){
    this.skuItems.push(SKUItem);
  }

  concatSKUItems(SKUItems){
    this.skuItems = this.skuItems.concat(SKUItems);
  }
}

module.exports = RestockOrder;
