const chai = require('chai');
chai.should();
const dbConnection = require("../database/DatabaseConnection");
const itemDAO = require("../database/Item_dao");
const userDAO = require("../database/User_dao");
const skuDAO = require("../database/SKU_dao");

let suppliers = [
    {
        username: "robertdunder@ezwh.com",
        name: "Robert",
        surname: "Dunder",
        password: "testpassword",
        type: "supplier"
    },
    {
        username: "robertmifflin@ezwh.com",
        name: "Robert",
        surname: "Mifflin",
        password: "testpassword",
        type: "supplier"
    }
];

const items = [
    {
        id: 12,
        description: "A new item",
        price: 10.99,
        skuId :1,
        supplierId: 7
    },
    {
        id: 13,
        description: "A newer item",
        price: 12.99,
        skuId : 2,
        supplierId: 8
    },
    {
        id: 14,
        description: "A very newer item",
        price: 12.99,
        skuId : 1,
        supplierId: 8
    }
]

function testCreateItem(item){
    test('Creating new Item', async()=>{
        console.log(item);
        await itemDAO.createItem(item);
        let getItems=await itemDAO.getItemByID(item.id);
        let getItem=getItems[0];
        getItem.should.be.an('object');
        compareItem(getItem, item).should.be.true;
    })
}
function testGetItems(expectedItems) {
    test('GET All Items', async function () {
        let items = [... await itemDAO.getItems()];
        items.length.should.be.equal(expectedItems.length);
        items.should.be.an('array');
        for (let i = 0; i < expectedItems.length; i++)
            expectedItems.some((item) => {
                return compareItem(items[i], item)
            }).should.be.true;
    });
}
function testGetItemByID(id,expectedItem) {
    test(`GET Item ${id}`, async function () {
        let items = [...await itemDAO.getItemByID(id)];
        let item = items[0];
        item.should.be.an('object');
        compareItem(item, expectedItem).should.be.true;
    });
}
function testGetItemBySKUIDAndSupplierID(SKUId , supplierId ,expectedItem) {
    test(`GET item by supplier and SKUID`, async function () {
        let item = await itemDAO.getItemBySKUIDAndSupplierID(SKUId,supplierId);
        item.should.be.an('object');
        compareItem(item, expectedItem).should.be.true;
    });
}

function testModifyItem(id, newDescription, newPrice ) {
    test(` Modifying Item`, async function () {
        let itemsBefore = [...await itemDAO.getItemByID(id)];
        let beforeItem = itemsBefore[0];
        let expectedItem={id:beforeItem.id, description:newDescription , price : newPrice , skuId: beforeItem.skuId , supplierId:beforeItem.supplierId};
        await itemDAO.modifyItem(id,newDescription,newPrice);
        let itemsAfter = [...await itemDAO.getItemByID(id)];
        let afterItem = itemsAfter[0];
        afterItem.should.be.an('object');
        compareItem(afterItem, expectedItem).should.be.true;
    });
}


function compareItem(actualItem, expectedItem) {
    return actualItem.id === expectedItem.id &&
        actualItem.description === expectedItem.description &&
        actualItem.price === expectedItem.price &&
        actualItem.skuId === expectedItem.skuId &&
        actualItem.supplierId === expectedItem.supplierId;

}

describe('Test Item DAO', () => {
    describe('Tests', ()=>{
        beforeAll(async () => {
            await dbConnection.createConnection();
            await skuDAO.createSKU("ID 1 Test SKU for Item", 10, 10, "No notes", 10.21,3);
            await skuDAO.createSKU("ID 2 Test SKU for Item", 10, 10, "No notes", 10.21,3);
            await skuDAO.createSKU("ID 3 Test SKU for Item", 10, 10, "No notes", 10.21,3);
            await userDAO.createUser(suppliers[0].username ,suppliers[0].name,suppliers[0].surname,suppliers[0].password,suppliers[0].type);
            await userDAO.createUser(suppliers[1].username ,suppliers[1].name,suppliers[1].surname,suppliers[1].password,suppliers[1].type);

        })
        testCreateItem(items[0]);
        testCreateItem(items[1]);
        testCreateItem(items[2]);

        testGetItems(items);
        testGetItemByID(12,items[0]);
        testGetItemBySKUIDAndSupplierID(1,8,items[2]);

        testModifyItem(13,"A new Description",12,21);



        //BY ID
        afterAll(async ()=>{
            await itemDAO.deleteItem(12);
            await itemDAO.deleteAllItems();
            await userDAO.deleteUser(suppliers[0].username,suppliers[0].type);
            await userDAO.deleteUser(suppliers[1].username,suppliers[1].type);
            await skuDAO.deleteAllSKUs();
        })
    })


})