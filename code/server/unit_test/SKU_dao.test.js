const chai = require('chai');
chai.should();
const skuDAO = require('../database/SKU_dao');
const posDAO = require('../database/Position_dao');
const SKU = require("../modules/SKU");
const Position = require("../modules/Position");
const dbConnection = require("../database/DatabaseConnection");
const { expect } = require('chai');

function testGetSKUs(expectedSKUs) {
    test('get all skus', async function () {
        let skus = await skuDAO.getSKUs();
        skus.length.should.be.equal(expectedSKUs.length);
        for (let i = 0; i < expectedSKUs.length; i++)
            expectedSKUs.some((sku) => {
                return compareSKU(skus[i], sku)
            }).should.be.true;
    });
}

function testGetTestDescriptorsBySKUID(id, expectedTestDescriptors) {
    test(`get test descriptors of SKUid = ${id}`, async function () {
        let tds = await skuDAO.getTestDescriptorsBySKUID(id);
        //console.log(tds);
        tds.should.be.equal(expectedTestDescriptors.length);
        for (let i = 0; i < expectedTestDescriptors.length; i++)
            expect(expectedTestDescriptors.some((td) => {
                return compareTestDescriptor(tds[i], td)
            })).should.be.true;
    });
}

function testCreateSKU(expectedSKU) {
    test('create sku', async function () {
        await skuDAO.createSKU(expectedSKU.description, expectedSKU.weight,
            expectedSKU.volume, expectedSKU.notes, expectedSKU.price,
            expectedSKU.availableQuantity);
        let actualSKU = await skuDAO.getSKUById(expectedSKU.id);
        compareSKU(actualSKU, expectedSKU).should.be.true;
    })
}

function testGetSKUById(id, expectedSKU) {
    test(`get sku with id=${id}`, async function () {
        let sku = await skuDAO.getSKUById(id);
        compareSKU(sku, expectedSKU).should.be.true;
    });
}

function testModifySKU(expectedSKU) {
    test(`modify sku with id=${expectedSKU.id}`, async function () {
        await skuDAO.modifySKU(expectedSKU.id, expectedSKU.description,
            expectedSKU.weight, expectedSKU.volume, expectedSKU.notes, expectedSKU.price,
            expectedSKU.availableQuantity);
        let sku = await skuDAO.getSKUById(expectedSKU.id);
        compareSKU(sku, expectedSKU).should.be.true;
    });
}

function testAddSKUPosition(expectedSKU) {
    test(`add position with id=${expectedSKU.positionID} to sku with id=${expectedSKU.id}`, async function () {
        await skuDAO.addSKUPosition(expectedSKU.id, expectedSKU.positionID);
        let sku = await skuDAO.getSKUById(expectedSKU.id);
        compareSKU(sku, expectedSKU).should.be.true;
    });
}

function testDeleteSKU(id) {
    test(`delete SKU with id = ${id}`, async () => {
        await skuDAO.deleteSKU(id);
        let sku = await skuDAO.getSKUById(id);
        expect(sku).to.be.undefined;
    });
}

function compareSKU(actualSKU, expectedSKU) {
    //console.log(expectedSKU);
    //console.log(actualSKU);
    if (expectedSKU === undefined) return true;
    else
        return actualSKU.description === expectedSKU.description &&
            actualSKU.weight === expectedSKU.weight &&
            actualSKU.volume === expectedSKU.volume &&
            actualSKU.notes === expectedSKU.notes &&
            actualSKU.availableQuantity === expectedSKU.availableQuantity &&
            actualSKU.positionID == expectedSKU.positionID &&
            actualSKU.position == expectedSKU.position &&
            actualSKU.price === expectedSKU.price &&
            actualSKU.testDescriptors.sort().join(",") ===
            expectedSKU.testDescriptors.sort().join(",");
}

function compareTestDescriptor(actualTD, expectedTD) {
    return actualTD.name === expectedTD.name &&
        actualTD.procedureDescription === expectedTD.procedureDescription &&
        actualTD.idSKU === expectedTD.idSKU;
}

let SKU1 = new SKU(1, "a new sku", 100, 50, "first SKU", 10.99, 50);
let SKU2 = new SKU(2, "a second sku", 110, 60, "second SKU", 11.99, 60);
let newSKU1 = new SKU(SKU1.id, "newDescription", SKU1.weight, 60, "newNotes", 12.99, 20);
let pos1 = new Position("800234543412", "8002", "3454", "3412", 1000, 1000);
let pos2 = new Position("801234543412", "8012", "3454", "3412", 1000, 1000);
let SKU1Pos = new SKU(newSKU1.id, newSKU1.description, newSKU1.weight, newSKU1.volume,
    newSKU1.notes, newSKU1.price, newSKU1.availableQuantity, pos1.positionID);
let SKU2Pos = new SKU(SKU2.id, SKU2.description, SKU2.weight, SKU2.volume,
        SKU2.notes, SKU2.price, SKU2.availableQuantity, pos2.positionID);

describe('Test SKU DAO', () => {
    beforeAll(async () => {
        await dbConnection.createConnection();
    });

    describe('test create/get functions', () => {
        testCreateSKU(SKU1);
        testGetSKUs([SKU1]);
        testCreateSKU(SKU2);
        testGetSKUById(1, SKU1);
        testGetSKUById(2, SKU2);
        testGetSKUs([SKU1, SKU2]);
        afterAll(async () => {
            await posDAO.createPosition(pos1);
            await posDAO.createPosition(pos2);
        });
    })
    describe('test modify/delete SKU', () => {
        testModifySKU(newSKU1);
        testGetSKUs([newSKU1, SKU2]);
        testAddSKUPosition(SKU1Pos);
        testAddSKUPosition(SKU2);
        testGetSKUs([SKU1Pos, SKU2]);
        testDeleteSKU(1);
        testDeleteSKU(2);
        testGetSKUs([]);
        afterAll(async ()=>{
            await posDAO.deletePosition(pos1.positionID);
            await posDAO.deletePosition(pos2.positionID);
        });
    });
})

