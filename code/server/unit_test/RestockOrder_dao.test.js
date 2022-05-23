const chai = require('chai');
chai.should();
const dao = require('../database/RestockOrder_dao');
const RestockOrder = require("../modules/RestockOrder");
const dbConnection = require("../database/DatabaseConnection");

function testGetRestockOrders(expectedRestockOrders) {
    test('Get All RestockOrders', async function () {
        let restockOrders = await dao.getRestockOrders();
        restockOrders.length.should.be.equal(expectedRestockOrders.length);
        for (let i = 0; i < expectedRestockOrders.length; i++)
            expectedRestockOrders.some((restockOrder) => {
                return compareRestockOrder(restockOrders[i], restockOrder)
            }).should.be.true;
    });
}

function compareRestockOrder(actualRestockOrder, expectedRestockOrder) {
    // console.log(expectedRestockOrder);
    // console.log(actualRestockOrder);
    return actualRestockOrder.issueDate === expectedRestockOrder.issueDate &&
    actualRestockOrder.state === expectedRestockOrder.state &&
    actualRestockOrder.supplierID === expectedRestockOrder.supplierID &&
    actualRestockOrder.transportNote === expectedRestockOrder.transportNote;
}

describe('Test RestockOrder createRestockOrder', () => {
    const id = 1;
    const issueDate = "2020/01/01 08:00";
    const state = "ISSUED";
    const supplierID = 1;
    beforeAll(async () => {
        await dbConnection.createConnection();
        await dao.createRestockOrder(issueDate, supplierID);
    })
    testGetRestockOrders([new RestockOrder(id, issueDate, state, supplierID)]);
    afterAll(async ()=>{
        await dao.deleteRestockOrder(id);
    })
})