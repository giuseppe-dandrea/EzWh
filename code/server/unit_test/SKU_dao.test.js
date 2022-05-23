const chai = require('chai');
chai.should();
const skuDAO = require('../database/SKU_dao');
const SKU = require("../modules/SKU");
const dbConnection = require("../database/DatabaseConnection");

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
    test(`get test descriptors of SKUid = ${id}`, async () => {
        if (expectedTestDescriptors !== undefined) {
            try {
                let tds = await skuDAO.getTestDescriptorsBySKUID(id);
                for (let i = 0; i < expectedTestDescriptors.length; i++)
                    expect(expectedTestDescriptors.some((td) => {
                        return compareTestDescriptor(tds[i], td)
                    })).toStrictEqual(true);
            }
            catch (err) {
                console.log(err);
                expect(false).toStrictEqual(true);
            }
        } else {
            expect(async () => skuDAO.getTestDescriptorsBySKUID(id)).toThrow();
        }
    });
}

function compareSKU(actualSKU, expectedSKU) {
    console.log(expectedSKU);
    console.log(actualSKU);
    return actualSKU.description === expectedSKU.description &&
        actualSKU.weigth === expectedSKU.weigth &&
        actualSKU.volume === expectedSKU.volume &&
        actualSKU.notes === expectedSKU.notes &&
        actualSKU.availableQuantity === expectedSKU.availableQuantity &&
        actualSKU.price === expectedSKU.price;
}

function compareTestDescriptor(actualTD, expectedTD) {
    return actualTD.name === expectedTD.name &&
        actualTD.procedureDescription === expectedTD.procedureDescription &&
        actualTD.idSKU === expectedTD.idSKU;
}

describe('Test SKU DAO', () => {
    beforeAll(async () => {
        await dbConnection.createConnection();
        await skuDAO.createSKU("a new sku", 100, 50, "first SKU", 10.99, 50);
    })
    testGetSKUs([new SKU(1, "a new sku", 100, 50, "first SKU", 10.99, 50)]);
    afterAll(async ()=>{
        await skuDAO.deleteSKU(1);
    })
})

