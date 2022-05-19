const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { Router } = require('express');
chai.use(chaiHttp);
chai.should();

const app = require('../server');
var agent = chai.request.agent(app);

const states = ["ISSUED", "DELIVERY", "DELIVERED",
    "TESTED", "COMPLETEDRETURN", "COMPLETED"];

function newRestockOrder(expectedHTTPStatus, restockOrder) {
    it('adding a new restock order', function (done) {
        if (restockOrder !== undefined) {
            agent.post('/api/restockOrder')
                .set('content-type', 'application/json')
                .send(restockOrder)
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.post('/api/restockOrder')
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}
function deleteRestockOrder(expectedHTTPStatus, id) {
    it(`deleting a restock order with id=${id}`, function (done) {
        agent.delete(`/api/restockOrder/${id}`)
            .end(function (err, res) {
                if (err) done(err);
                res.should.have.status(expectedHTTPStatus);
                done();
            });
    });
}
function modifyRestockOrderStatus(expectedHTTPStatus, id, status) {
    it(`modifing a restock order with id=${id} to status=${status}`, function (done) {
        if (status !== undefined) {
            agent.put(`/api/restockOrder/${id}`)
                .set('content-type', 'application/json')
                .send(status)
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.put(`/api/restockOrder/${id}`)
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}
function addSKUItemList(expectedHTTPStatus, id, SKUItemList) {
    it(`adding skuItem list to restock order ${id}`, function (done) {
        if (SKUItemList !== undefined) {
            agent.post(`/api/restockOrder/${id}/skuItems`)
                .set('content-type', 'application/json')
                .send(SKUItemList)
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedHTTPStatus);
                    done();
                }).catch(function (err) {
                    done(err);
                });
        } else {
            agent.post(`/api/restockOrder/${id}/skuItems`)
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}
function addTransportNote(expectedHTTPStatus, id, transportNote) {
    it(`adding transport note = ${transportNote} to ${id}`, function (done) {
        if (transportNote !== undefined) {
            agent.post(`/api/restockOrder/${id}/transportNote`)
                .set('content-type', 'application/json')
                .send(transportNote)
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.post(`/api/restockOrder/${id}/transportNote`)
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}
function getRestockOrders(expectedHTTPStatus, expectedLength, expectedRestockOrders) {
    it('getting all restock orders', function (done) {
        agent.get('/api/restockOrders')
            .end(function (err, res) {
                if (err) done(err);
                res.should.have.status(expectedHTTPStatus);
                res.body.should.be.json;
                res.body.should.be.an('array');
                res.body.should.have.lengthOf(expectedLength);
                for (let i = 0; i < expectedLength; i++) {
                    let ro = res.body[i];
                    ro.should.haveOwnProperty("id");
                    ro.shoudl.haveOwnProperty("issueDate");
                    ro.should.haveOwnProperty("state");
                    ro.should.haveOwnProperty("products");
                    ro.products.should.be.an('array');
                    ro.should.haveOwnProperty("supplierId");
                    ro.should.eventually.haveOwnProperty("transportNote");
                    ro.should.haveOwnProperty("skuItems");
                    ro.skuItems.should.be.an('array');
                    expectedRestockOrders.some((restOrd) => {
                        compareRestockOrder(restOrd, ro)
                    }).should.be.equal(true);
                    done();
                }
            });
    });
}
function getRestockOrdersIssued(expectedHTTPStatus, expectedLength, expectedRestockOrders) {
    it('getting all restock orders issued', function (done) {
        agent.get('/api/restockOrdersIssued')
            .end(function (err, res) {
                if (err) done(err);
                res.should.have.status(expectedHTTPStatus);
                res.body.should.be.json;
                res.body.should.be.an('array');
                res.body.should.have.lengthOf(expectedLength);
                for (let i = 0; i < expectedLength; i++) {
                    let ro = res.body[i];
                    ro.should.haveOwnProperty("id");
                    ro.shoudl.haveOwnProperty("issueDate");
                    ro.should.haveOwnProperty("state");
                    ro.should.haveOwnProperty("products");
                    ro.products.should.be.an('array');
                    ro.should.haveOwnProperty("supplierId");
                    ro.should.haveOwnProperty("skuItems");
                    ro.skuItems.should.be.an('array');
                    ro.skuItems.should.have.lengthOf(0);
                    expectedRestockOrders.some((restOrd) => {
                        compareRestockOrder(restOrd, ro)
                    }).should.be.equal(true);
                    done();
                }
            });
    });
}
function getRestockOrder(expectedHTTPStatus, id, expectedRestockOrder) {
    it(`getting a restock order with id=${id}`, function (done) {
        if (expectedRestockOrder !== undefined) {
            agent.get(`/api/restockOrders/${id}`)
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedHTTPStatus);
                    res.body.should.be.json;
                    ro = res.body;
                    ro.should.haveOwnProperty("id");
                    ro.shoudl.haveOwnProperty("issueDate");
                    ro.should.haveOwnProperty("state");
                    ro.should.haveOwnProperty("products");
                    ro.products.should.be.an('array');
                    ro.should.haveOwnProperty("supplierId");
                    ro.should.eventually.haveOwnProperty("transportNote");
                    ro.should.haveOwnProperty("skuItems");
                    ro.skuItems.should.be.an('array');
                    compareRestockOrder(expectedRestockOrder, ro).should.be.equal(true);
                    done();
                });
        } else {
            agent.get(`/api/restockOrders/${id}`)
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedHTTPStatus);
                    done();
                }).catch(function (err) {
                    done(err);
                });
        }
    });
}
function getReturnItems(expectedHTTPStatus, id, expectedLength, expectedReturnItems) {
    it(`getting returnItems of restockOrder ${id}`, function (done) {
        agent.get(`/api/restockOrders/${id}/returnItems`)
            .end(function (err, res) {
                if (err) done(err);
                res.should.have.status(expectedHTTPStatus);
                res.body.should.be.json;
                res.body.should.be.an('array');
                res.body.should.have.lengthOf(expectedLength);
                for (let i = 0; i < expectedLength; i++) {
                    let ri = res.body[i];
                    ri.should.haveOwnProperty("SKUid");
                    ri.shoudl.haveOwnProperty("rfid");
                    expectedReturnItems.some((retItem) => {
                        compareRestockOrder(retItem, ri)
                    }).should.be.equal(true);
                    done();
                }
            });
    });
}
function newSKU(expectedHTTPStatus, SKU) {
    it('adding a new SKU', function (done) {
        if (SKU !== undefined) {
            agent.post('/api/sku')
                .set('content-type', 'application/json')
                .send(SKU)
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.post('/api/sku')
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}
function deleteSKU(expectedHTTPStatus, id) {
    it('deleting a SKU', function (done) {
        agent.delete(`/api/skus/${id}`)
            .end(function (err, res) {
                if (err) done(err);
                res.should.have.status(expectedHTTPStatus);
                done();
            });
    });
}
function newSKUItem(expectedHTTPStatus, SKUItem) {
    it('adding a new SKUItem', function (done) {
        if (SKUItem !== undefined) {
            agent.post('/api/skuitem')
                .set('content-type', 'application/json')
                .send(SKUItem)
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.post('/api/skuitem')
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}
function deleteSKUItem(expectedHTTPStatus, rfid) {
    it('deleting a skuitem', function (done) {
        agent.delete(`/api/skuitems/${rfid}`)
            .end(function (err, res) {
                if (err) done(err);
                res.should.have.status(expectedHTTPStatus);
                done();
            });
    });
}
function newUser(expectedHTTPStatus, user) {
    it('adding a new user', function (done) {
        if (user !== undefined) {
            agent.post('/api/newUser')
                .set('content-type', 'application/json')
                .send(user)
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.post('/api/newUser')
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}
function deleteUser(expectedHTTPStatus, username, type) {
    it('deleting a user', function (done) {
        agent.delete(`/api/users/${username}/${type}`)
            .end(function (err, res) {
                if (err) done(err);
                res.should.have.status(expectedHTTPStatus);
                done();
            });
    });
}
function newItem(expectedHTTPStatus, item) {
    it('adding a new item', function (done) {
        if (item !== undefined) {
            agent.post('/api/item')
                .set('content-type', 'application/json')
                .send(item)
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.post('/api/item')
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}
function deleteItem(expectedHTTPStatus, id) {
    it('deleting an item', function (done) {
        agent.delete(`/api/items/${id}`)
            .end(function (err, res) {
                if (err) done(err);
                res.should.have.status(expectedHTTPStatus);
                done();
            });
    });
}
function compareRestockOrder(expectedRO, actualRO) {
    let cmp_flag = true;
    if (expectedRO.issueDate !== actualRO.issueDate) return false;
    if (expectedRO.state !== actualRO.state) return false;
    if (expectedRO.products.length !== actualRO.products.length)
        return false;
    for (let i = 0; i < expectedRO.products.length; i++) {
        exppr = expectedRO.products[i];
        cmp_flag = actualRO.products.some((p) => {
            return p.SKUId === exppr.SKUId &&
                p.description === exppr.description &&
                p.price === exppr.price &&
                p.qty === exppr.qty;
        });
        if (!cmp_flag) return false;
    }
    if (expectedRO.supplierId !== actualRO.supplierId) return false;
    if (expectedRO.transportNote !== undefined && 
        expectedRO.transportNote.deliveryDate !== actualRO.transportNote.deliveryDate)
        return false;
    if (!compareReturnItems(expectedRO.skuItems, actualRO.skuItems))
        return false;
    return true;
}
function compareReturnItems(expectedRI, actualRI) {
    let cmp_flag = true;
    if (expectedRI.length !== actualRI.length)
        return false;
    for (let i = 0; i < expectedRI.length; i++) {
        exppr = expectedRI[i];
        cmp_flag = actualRI.some((p) => {
            return p.SKUId === exppr.SKUId &&
                p.rfid === exppr.rfid;
        });
        if (!cmp_flag) return false;
    }
    return true;
}

function clearDB() {
    it('deleting all db entries', function (done) {
        let tmp_array = [];
        agent.get('/api/skus')
            .end(function (err, res) {
                if (err) done(err);
                for (i = 0; i < res.body.length; i++) {
                    tmp_array.push(res.body[i].id);
                }
            });
        for (i = 0; i < tmp_array.length; i++) {
            agent.delete(`/api/skus/${tmp_array[i]}`)
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(204);
                    console.log("deleted " + tmp_array[i]);
                });
        }
        done();
    });
}

let restockOrderIssued1 = {
    "issueDate": "2021/11/29 09:33",
    "products": [{ "SKUId": 1, "description": "first sku", "price": 10.99, "qty": 30 },
    { "SKUId": 2, "description": "second sku", "price": 10.99, "qty": 20 }],
    "supplierId": 1
};
let restockOrderIssued2 = {
    "issueDate": "2021/11/23",
    "products": [{ "SKUId": 1, "description": "first sku", "price": 10.99, "qty": 20 },
    { "SKUId": 3, "description": "third sku", "price": 10.99, "qty": 30 }],
    "supplierId": 2
};

let restockOrderError1 = {
    "issueDate": "2021/11/23 99:70",
    "products": [{ "SKUId": 1, "description": "first sku", "price": 10.99, "qty": 20 },
    { "SKUId": 3, "description": "third sku", "price": 10.99, "qty": 30 }],
    "supplierId": 2
};

let restockOrderError2 = {
    "issueDate": "2021/11",
    "products": [{ "SKUId": 1, "description": "first sku", "price": 10.99, "qty": 20 },
    { "SKUId": 3, "description": "third sku", "price": 10.99, "qty": 30 }],
    "supplierId": 2
};

let restockOrderError3 = {
    "issueDate": "",
    "products": [{ "SKUId": 1, "description": "first sku", "price": 10.99, "qty": 20 },
    { "SKUId": 3, "description": "third sku", "price": 10.99, "qty": 30 }],
    "supplierId": 2
};

let restockOrderError4 = {
    "products": [{ "SKUId": 1, "description": "first sku", "price": 10.99, "qty": 20 },
    { "SKUId": 3, "description": "third sku", "price": 10.99, "qty": 30 }],
    "supplierId": 2
};

let restockOrderError5 = {
    "issueDate": "2021/11/23",
    "products": [{ "SKUId": 4, "description": "first sku", "price": 10.99, "qty": 20 },
    { "SKUId": 3, "description": "third sku", "price": 10.99, "qty": 30 }],
    "supplierId": 2
};

let restockOrderError6 = {
    "issueDate": "2021/11/23",
    "products": [{ "SKUId": "abc", "description": "first sku", "price": 10.99, "qty": 20 },
    { "SKUId": 3, "description": "third sku", "price": 10.99, "qty": 30 }],
    "supplierId": 2
};

let restockOrderError7 = {
    "issueDate": "2021/11/23",
    "products": [{ "SKUId": 1, "description": "first sku", "price": 10.99 },
    { "SKUId": 3, "description": "third sku", "price": 10.99, "qty": 30 }],
    "supplierId": 2
};

let restockOrderError8 = {
    "issueDate": "2021/11/23",
    "products": [{ "SKUId": 1, "description": "first sku", "price": 10.99, "qty": 20 },
    { "SKUId": 3, "description": "third sku", "price": 10.99, "qty": 30 }],
    "supplierId": "abc"
};

let restockOrderError9 = {
    "issueDate": "2021/11/23",
    "products": [{ "SKUId": 1, "description": "first sku", "price": 10.99, "qty": 20 },
    { "SKUId": 3, "description": "third sku", "price": 10.99, "qty": 30 }],
    "supplierId": ""
};

let restockOrderError10 = {
    "issueDate": "2021/11/23",
    "products": [{ "SKUId": 1, "description": "first sku", "price": 10.99, "qty": 20 },
    { "SKUId": 3, "description": "third sku", "price": 10.99, "qty": 30 }],
    "supplierId": 4
};

let restockOrder1 = {
    ...restockOrderIssued1,
    "state": "ISSUED",
    "skuItems": []
};
let restockOrder2 = {
    ...restockOrderIssued2,
    "state": "ISSUED",
    "skuItems": []
};
let supplier1 = {
    "username": "user1@ezwh.com",
    "name": "John",
    "surname": "Smith",
    "password": "testpassword",
    "type": "supplier"
};
let supplier2 = {
    "username": "user2@ezwh.com",
    "name": "Paul",
    "surname": "Brown",
    "password": "testpassword",
    "type": "supplier"
};
let SKU1 = {
    "description": "first sku",
    "weight": 100,
    "volume": 50,
    "notes": "first SKU",
    "price": 10.99,
    "availableQuantity": 50
};
let SKU2 = {
    "description": "second sku",
    "weight": 100,
    "volume": 50,
    "notes": "first SKU",
    "price": 10.99,
    "availableQuantity": 20
};
let SKU3 = {
    "description": "third sku",
    "weight": 100,
    "volume": 50,
    "notes": "first SKU",
    "price": 10.99,
    "availableQuantity": 30
};
let SKUItem1 = {
    "RFID": "12345678901234567890123456789015",
    "SKUId": 1,
    "DateOfStock": "2021/11/29 12:30"
};
let SKUItem2 = {
    "RFID": "12345678901234567890123456789016",
    "SKUId": 1,
    "DateOfStock": "2021/11/29 12:30"
};
let SKUItem3 = {
    "RFID": "12345678901234567890123456789017",
    "SKUId": 1,
    "DateOfStock": "2021/11/29 12:30"
};
let SKUItem4 = {
    "RFID": "12345678901234567890123456789018",
    "SKUId": 1,
    "DateOfStock": "2021/11/29 12:30"
};
let SKUItem5 = {
    "RFID": "12345678901234567890123456789025",
    "SKUId": 2,
    "DateOfStock": "2021/11/29 12:30"
};
let SKUItem6 = {
    "RFID": "12345678901234567890123456789026",
    "SKUId": 2,
    "DateOfStock": "2021/11/29 12:30"
};
let SKUItem7 = {
    "RFID": "12345678901234567890123456789027",
    "SKUId": 2,
    "DateOfStock": "2021/11/29 12:30"
};
let item1 = {
    "id": 1,
    "description": "first sku",
    "price": 10.99,
    "SKUId": 1,
    "supplierId": 1
};
let item2 = {
    "id": 2,
    "description": "second sku",
    "price": 10.99,
    "SKUId": 2,
    "supplierId": 1
};
let item3 = {
    "id": 3,
    "description": "first sku",
    "price": 10.99,
    "SKUId": 1,
    "supplierId": 2
};
let item4 = {
    "id": 4,
    "description": "third sku",
    "price": 10.99,
    "SKUId": 3,
    "supplierId": 2
};
let transportNote1 = {"deliveryDate":"2021/12/29"};
let transportNote2 = {"deliveryDate":"2021/11/29"};
let skuItems1 =  [{"SKUId":1,"rfid":"12345678901234567890123456789015"},{"SKUId":1,"rfid":"12345678901234567890123456789016"}];
let skuItems2 =  [{"SKUId":1,"rfid":"12345678901234567890123456789017"},{"SKUId":1,"rfid":"12345678901234567890123456789018"}];
let skuItemsError1 =  [{"SKUId": "abc","rfid":"12345678901234567890123456789017"},{"SKUId":1,"rfid":"12345678901234567890123456789018"}];
let skuItemsError2 =  [{"SKUId":1,"rfid":"123453"},{"SKUId":1,"rfid":"12345678901234567890123456789018"}];
let skuItemsError3 =  [{"SKUId":1,"rfid":true},{"SKUId":1,"rfid":"12345678901234567890123456789018"}];
let skuItemsError4 =  [{"SKUId":1,"rfid":12345678901234567890123456789017n},{"SKUId":1,"rfid":"12345678901234567890123456789018"}];
let skuItemsError5 =  [{"SKUId":5,"rfid":"12345678901234567890123456789017"},{"SKUId":1,"rfid":"12345678901234567890123456789018"}];
let skuItemsError6 =  [{"SKUId":1,"rfid":"12345678901234567890123456789030"},{"SKUId":1,"rfid":"12345678901234567890123456789018"}];

function prepare() {
    describe('preparing environment', () => {
        newUser(201, supplier1);
        newUser(201, supplier2);
        newSKU(201, SKU1);
        newSKU(201, SKU2);
        newSKU(201, SKU3);
        newSKUItem(201, SKUItem1);
        newSKUItem(201, SKUItem2);
        newSKUItem(201, SKUItem3);
        newSKUItem(201, SKUItem4);
        newSKUItem(201, SKUItem5);
        newSKUItem(201, SKUItem6);
        newSKUItem(201, SKUItem7);
        newItem(201, item1);
        newItem(201, item2);
        newItem(201, item3);
        newItem(201, item4);
    });
}
function clean() {
    describe('cleaning environment', () => {
        deleteItem(204, 1);
        deleteItem(204, 2);
        deleteItem(204, 3);
        deleteItem(204, 4);
        deleteUser(204, supplier1.username, supplier1.type);
        deleteUser(204, supplier2.username, supplier2.type);
        deleteSKUItem(204, SKUItem1.RFID);
        deleteSKUItem(204, SKUItem2.RFID);
        deleteSKUItem(204, SKUItem3.RFID);
        deleteSKUItem(204, SKUItem4.RFID);
        deleteSKUItem(204, SKUItem5.RFID);
        deleteSKUItem(204, SKUItem6.RFID);
        deleteSKUItem(204, SKUItem7.RFID);
        deleteSKU(204, 1);
        deleteSKU(204, 2);
        deleteSKU(204, 3);
    });
}

prepare();

describe('test insert/get/delete restockOrder api', () => {
    newRestockOrder(201, restockOrderIssued1);
    newRestockOrder(201, restockOrderIssued2);
    getRestockOrders(200, 2, [restockOrder1, restockOrder2]);
    getRestockOrdersIssued(200, 2, [restockOrder1, restockOrder2]);
    getRestockOrder(200, 1, restockOrder1);
    getRestockOrder(200, 2, restockOrder2);
    deleteRestockOrder(204, 1);
    deleteRestockOrder(204, 2);
    getRestockOrders(200, 0, []);
});

describe('test error in insert/delete restockOrder api', () => {
    newRestockOrder(422);
    newRestockOrder(422, restockOrderError1);
    newRestockOrder(422, restockOrderError2);
    newRestockOrder(422, restockOrderError3);
    newRestockOrder(422, restockOrderError4);
    newRestockOrder(422, restockOrderError5);
    newRestockOrder(422, restockOrderError6);
    newRestockOrder(422, restockOrderError7);
    newRestockOrder(422, restockOrderError8);
    newRestockOrder(422, restockOrderError9);
    newRestockOrder(422, restockOrderError10);
    getRestockOrder(404, 3);
    getRestockOrder(422, "abc");
    getRestockOrder(422, true);
    deleteRestockOrder(422, "abc");
    deleteRestockOrder(422, true);
    deleteRestockOrder(204, 3);
});

describe('test modification of restockOrder status api', () => {
    newRestockOrder(201, restockOrderIssued1);
    newRestockOrder(201, restockOrderIssued2);
    modifyRestockOrderStatus(404, 3, { "newState": states[3] });
    modifyRestockOrderStatus(422, 3);
    modifyRestockOrderStatus(422, "abc", { "newState": states[3] });
    modifyRestockOrderStatus(422, 1, { "newState": "abcd" });
    modifyRestockOrderStatus(422, 1, { "newState": 1 });
    modifyRestockOrderStatus(422, 1, { "newState": true });
    modifyRestockOrderStatus(422, 1);
    modifyRestockOrderStatus(422, 1, { "new": states[1] });
    modifyRestockOrderStatus(422, 1, {});
    modifyRestockOrderStatus(200, 1, { "newState": states[1] });
    getRestockOrder(200, 1, { ...restockOrderIssued1, "state": states[1], "skuItems": [] });
    modifyRestockOrderStatus(200, 1, { "newState": states[2] });
    getRestockOrder(200, 1, { ...restockOrderIssued1, "state": states[2], "skuItems": [] });
    getRestockOrdersIssued(200, 1, [restockOrder2]);
    deleteRestockOrder(204, 1);
    deleteRestockOrder(204, 2);
});

describe('test transport note', ()=>{
    newRestockOrder(201, restockOrderIssued1);
    newRestockOrder(201, restockOrderIssued2);
    addTransportNote(422, 1, {"transportNote": transportNote1});
    addTransportNote(404, 3, {"transportNote": transportNote1});
    modifyRestockOrderStatus(200, 1, { "newState": states[1] });
    addTransportNote(200, 1, {"transportNote": transportNote1});
    getRestockOrder(200, 1, {...restockOrderIssued1, "state": states[1],
        "skuItems": [], "transportNote": transportNote1});
    addTransportNote(200,1, {"transportNote": transportNote2});
    getRestockOrder(200, 1, {...restockOrderIssued1, "state": states[1],
    "skuItems": [], "transportNote": transportNote2});
    addTransportNote(422, 1, {"transportNote":1});
    addTransportNote(422, 1, {"transportNote":"abc"});
    addTransportNote(422, 1, {"transport":1});
    addTransportNote(422, 1, {"transport":transportNote1});
    addTransportNote(422, 1, {"transportNote":{"deliveryDate": "abc"}});
    addTransportNote(422, 1, {"transportNote":{"deliveryDate": 1}});
    addTransportNote(422, 1, {"transportNote":{"deliveryDate": ""}});
    addTransportNote(422, 1, {"transportNote":{"delive":"2021/12/30"}});
    addTransportNote(422, 1, {"transportNote":{"deliveryDate": "abc"}});
    addTransportNote(422, 1, {"transportNote":{"deliveryDate": "2021/11/28"}});
    modifyRestockOrderStatus(200, 1, {"newState": states[2]});
    getRestockOrder(200, 1, {...restockOrderIssued1, "state": states[2],
    "skuItems": [], "transportNote": transportNote2});
    deleteRestockOrder(204, 1);
    deleteRestockOrder(204, 2);
});

describe('test return item of restock order', ()=>{
    newRestockOrder(201, restockOrderIssued1);
    newRestockOrder(201, restockOrderIssued2);
    addSKUItemList(422, 1, {"skuItems": skuItems1});
    addSKUItemList(404, 3, {"skuItems": skuItems1});
    modifyRestockOrderStatus(200, 1, {"newState": states[2]});
    addSKUItemList(422, 1, {"skuItems": skuItemsError1});
    addSKUItemList(422, 1, {"skuItems": skuItemsError2});
    addSKUItemList(422, 1, {"skuItems": skuItemsError3});
    addSKUItemList(422, 1, {"skuItems": skuItemsError4});
    addSKUItemList(422, 1, {"skuItems": skuItemsError5});
    addSKUItemList(422, 1, {"skuItems": skuItemsError6});
    addSKUItemList(200, 1, {"skuItems": skuItems1});
    getRestockOrders(200, 2, [{...restockOrderIssued1, "state": states[2], 
        "skuItems": skuItems1}, restockOrder2]);
    getReturnItems(404, 3);
    getReturnItems(422, 1);
    modifyRestockOrderStatus(200, 1, {"newState": states[4]});
    getReturnItems(200, 1, skuItems1);
    getReturnItems(422, true);
    getReturnItems(422, "abc");
    deleteRestockOrder(204, 1);
    deleteRestockOrder(204, 2);
})

clean();
