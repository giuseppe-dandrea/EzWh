const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { Router } = require('express');
chai.use(chaiHttp);
chai.should();

const app = require('../server');
var agent = chai.request.agent(app);

function newReturnOrder(expectedHTTPStatus, returnOrder) {
    it('adding a new return order', function (done) {
        if (returnOrder !== undefined) {
            agent.post('/api/returnOrder').send(returnOrder)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.post('/api/returnOrder')
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}

function deleteRestockOrder(expectedHTTPStatus, id) {
    it('deleting a return order', function (done) {
        agent.delete(`/api/returnOrder/${id}`)
            .then(function (res) {
                res.should.have.status(expectedHTTPStatus);
                done();
            });
    });
}

function getReturnOrders(expectedHTTPStatus, expectedLength, expectedReturnOrders) {
    it('getting all restock orders', function (done) {
        agent.get('/api/returnOrders')
            .then(function (res) {
                res.should.have.status(expectedHTTPStatus);
                res.body.should.be.json;
                res.body.should.be.an('array');
                res.body.should.have.lengthOf(expectedLength);
                for (let i = 0; i < expectedLength; i++) {
                    let ro= res.body[i];
                    ro.should.haveOwnProperty("id");
                    ro.shoudl.haveOwnProperty("returnDate");
                    ro.should.haveOwnProperty("products");
                    ro.should.haveOwnProperty("restockOrderId");
                    ro.products.should.be.an('array');
                    expectedReturnOrders.some((retOrd) => {
                        compareReturnOrder(retOrd, ro)
                    }).should.be.equal(true);
                    done();
                }
            });
    });
}

function getReturnOrder(expectedHTTPStatus, id, expectedReturnOrder) {
    it('getting a return order', function (done) {
        if (expectedReturnOrder !== undefined) {
            agent.get(`/api/returnOrders/${id}`)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    res.body.should.be.json;
                    ro = res.body;
                    ro.shoudl.haveOwnProperty("returnDate");
                    ro.should.haveOwnProperty("products");
                    ro.should.haveOwnProperty("restockOrderId");
                    ro.products.should.be.an('array');
                    compareReturnOrder(expectedReturnOrder, ro).should.be.equal(true);
                    done();
                });
        } else {
            agent.get(`/api/restockOrders/${id}`)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}

function compareReturnOrder(expectedRO, actualRO) {
    let cmp_flag = true;
    if (expectedRO.returnDate !== actualRO.returnDate) return false;
    if (expectedRO.products.length !== actualRO.products.length)
        return false;
    for (let i = 0; i < expectedRO.products.length; i++) {
        exppr = expectedRO.products[i];
        cmp_flag = actualRO.products.some((p) => {
            return p.SKUId === exppr.SKUId &&
                p.description === exppr.description &&
                p.price === exppr.price &&
                p.RFID === exppr.RFID;
        });
        if (!cmp_flag) return false;
    }
    if (expectedRO.restockOrderId !== actualRO.restockOrderId) return false;
    return true;
}

describe('test returnOrder api', () => {
    
});
