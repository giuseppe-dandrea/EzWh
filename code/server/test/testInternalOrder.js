const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { Router } = require('express');
chai.use(chaiHttp);
chai.should();

function newInternalOrder(expectedHTTPStatus, internalOrder) {
    it('adding a new internal order', function (done) {
        if (internalOrder !== undefined) {
            agent.post('/api/internalOrders').send(internalOrder)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.post('/api/internalOrders')
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}

function deleteInternalOrder(expectedHTTPStatus, id) {
    it('deleting an internal order', function (done) {
        agent.delete(`/api/internalOrders/${id}`)
            .then(function (res) {
                res.should.have.status(expectedHTTPStatus);
                done();
            });
    });
}

function modifyInternalOrder(expectedHTTPStatus, id, modifications) {
    it('modifing an internal order', function (done) {
        if (modifications !== undefined) {
            agent.put(`/api/internalOrders/${id}`).send(modifications)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.put(`/api/internalOrders/${id}`)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}

function getInternalOrdersByStatus(expectedHTTPStatus, expectedLength, expectedInternalOrders, status) {
    it('getting all internal orders', function (done) {
        agent.get(`/api/internalOrders${status}`)
            .then(function (res) {
                res.should.have.status(expectedHTTPStatus);
                res.body.should.be.json;
                res.body.should.be.an('array');
                res.body.should.have.lengthOf(expectedLength);
                for (let i = 0; i < expectedLength; i++) {
                    let io = res.body[i];
                    io.should.haveOwnProperty("id");
                    io.shoudl.haveOwnProperty("issueDate");
                    io.should.haveOwnProperty("state");
                    io.should.haveOwnProperty("products");
                    io.products.should.be.an('array');
                    io.should.haveOwnProperty("customerId");
                    expectedInternalOrders.some((intOrd) => {
                        compareInternalOrder(intOrd, io)
                    }).should.be.equal(true);
                    done();
                }
            });
    });
}

function getInternalOrder(expectedHTTPStatus, id, expectedInternalOrder) {
    it('getting all internal orders', function (done) {
        if (expectedInternalOrder !== undefined) {
            agent.get(`/api/internalOrders/${id}`)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    res.body.should.be.json;
                    res.body.should.be.an('array');
                    res.body.should.have.lengthOf(expectedLength);
                    for (let i = 0; i < expectedLength; i++) {
                        let io = res.body[i];
                        io.should.haveOwnProperty("id");
                        io.shoudl.haveOwnProperty("issueDate");
                        io.should.haveOwnProperty("state");
                        io.should.haveOwnProperty("products");
                        io.products.should.be.an('array');
                        io.should.haveOwnProperty("customerId");
                        expectedInternalOrders.some((intOrd) => {
                            compareInternalOrder(intOrd, io)
                        }).should.be.equal(true);
                        done();
                    }
                });
        } else {
            agent.get(`/api/internalOrders/${id}`)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}

function modifyInternalOrder(expectedHTTPStatus, id, modifications) {
    it('getting all internal orders', function (done) {
        if (modifications !== undefined) {
            agent.put(`/api/internalOrders/${id}`).send(modifications)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                    });
        } else {
            agent.put(`/api/internalOrders/${id}`)
                .then(function (res) {
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}

function compareInternalOrder(expectedIO, actualIO) {
    let cmp_flag = true;
    if (expectedIO.issueDate !== actualIO.issueDate) return false;
    if (expectedIO.state !== actualIO.state) return false;
    if (expectedIO.products.length !== actualIO.products.length)
        return false;
    for (let i = 0; i < expectedIO.products.length; i++) {
        exppr = expectedIO.products[i];
        cmp_flag = actualIO.products.some((p) => {
            return p.SKUId === exppr.SKUId &&
                p.description === exppr.description &&
                p.price === exppr.price &&
                ((p.RFID !== undefined && p.RFID === exppr.RFID) ||
                    (p.q.ty !== undefined && p.qty === exppr.qty));
        });
        if (!cmp_flag) return false;
    }
    if (expectedIO.customerId !== actualIO.custoemrId) return false;
    return true;
}

describe('test internalOrder api', () => {
    
});
