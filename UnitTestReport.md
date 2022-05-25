# Unit Testing Report

Date:

Version:

# Contents

- [Black Box Unit Tests](#black-box-unit-tests)




- [White Box Unit Tests](#white-box-unit-tests)


# Black Box Unit Tests

    <Define here criteria, predicates and the combination of predicates for each function of each class.
    Define test cases to cover all equivalence classes and boundary conditions.
    In the table, report the description of the black box test case and (traceability) the correspondence with the Jest test case writing the 
    class and method name that contains the test case>
    <Jest tests  must be in code/server/unit_test  >

 ### **Class *class_name* - method *name***



**Criteria for method *name*:**
	

 - 
 - 





**Predicates for method *name*:**

| Criteria | Predicate |
| -------- | --------- |
|          |           |
|          |           |
|          |           |
|          |           |





**Boundaries**:

| Criteria | Boundary values |
| -------- | --------------- |
|          |                 |
|          |                 |



**Combination of predicates**:


| Criteria 1 | Criteria 2 | ... | Valid / Invalid | Description of the test case | Jest test case |
|-------|-------|-------|-------|-------|-------|
|||||||
|||||||
|||||||
|||||||
|||||||




# White Box Unit Tests

### Test cases definition
    
    
    <Report here all the created Jest test cases, and the units/classes under test >
    <For traceability write the class and method name that contains the test case>


| Class name        | Unit name                                | Jest File         | Jest test case                                    |
|-------------------|------------------------------------------|-------------------|---------------------------------------------------|
| SKU_dao           | getSKUs                                  | SKU_dao           | Get all SKUs                                      |
|                   | getTestDescriptorsBySKUID                | SKU_dao           | Get test descriptors of SKUID :skuid              |
|                   | createSKU                                | SKU_dao           | Create SKU                                        |
|                   | getSKUById                               | SKU_dao           | Get SKU by ID :skuid                              |
|                   | modifySKU                                | SKU_dao           | Modify SKU :skuid                                 |
|                   | addSKUPosition                           | SKU_dao           | Add position :positionid to SKU :skuid            |
|                   | deleteSKU                                | SKU_dao           | Delete SKU :skuid                                 |
|                   |                                          |                   |                                                   |
| SKUItem_dao       | getSKUItems                              | SKUItem_dao       | Get all SKUItems                                  |
|                   | getSKUItemsBySKU                         | SKUItem_dao       | Get SKUItems for SKUID :skuid                     |
|                   | getSKUItemByRfid                         | SKUItem_dao       | Get SKUItem by RFID :rfid                         |
|                   | createSKUItem                            | SKUItem_dao       | Create SKUItem :rfid                              |
|                   | modifySKUItem                            | SKUItem_dao       | Modify SKUItem :rfid                              |
|                   | deleteSKUItem                            | SKUItem_dao       | Delete SKUItem :rfid                              |
|                   |                                          |                   |                                                   |
| Position_dao      | getPositions                             | Position_dao      | Get all Positions                                 |
|                   | getPositionByID                          | Position_dao      | Get Position by ID :positionid                    |
|                   | createPosition                           | Position_dao      | Create Position :positionid                       |
|                   | modifyPosition                           | Position_dao      | Modify Position Info :positionid                  |
|                   | modifySKUPosition                        | Position_dao      | Modify SKU :skuid assigned Position :positionid   |
|                   | modifyPositionID                         | Position_dao      | Modify Position ID :positionid                    |
|                   | deletePosition                           | Position_dao      | Delete Position :positionid                       |
|                   |                                          |                   |                                                   |
| InternalOrder_dao | getInternalOrders                        | InternalOrder_dao | Get InternalOrders with state=:state              |
|                   | getInternalOrderByID                     | InternalOrder_dao | **Modify InternalOrder :id to state :state        |
|                   | getInternalOrderProductByInternalOrderID | InternalOrder_dao | **Create InternalOrder                            |
|                   | getInternalOrderSKUItemByInternalOrderID | InternalOrder_dao | **Modify InternalOrder :id to state :state        |
|                   | createInternalOrder                      | InternalOrder_dao | Create InternalOrder                              |
|                   | createInternalOrderProduct               | InternalOrder_dao | **Create InternalOrder                            |
|                   | createInternalOrderSKUItem               | InternalOrder_dao | **Modify InternalOrder :id to state :state        |
|                   | modifyInternalOrderState                 | InternalOrder_dao | Modify InternalOrder :id to state :state          |
|                   | deleteInternalOrder                      | InternalOrder_dao | Delete InternalOrder :id                          |
|                   |                                          |                   |                                                   |
| User_dao          | getUsers                                 | User_dao          | Get all Users                                     |
|                   | getSuppliers                             | User_dao          | Get all Suppliers                                 |
|                   | getUserByEmail                           | User_dao          | Get User :email                                   |
|                   | getUserByID                              | User_dao          | **Create User :type :email                        |
|                   | createUser                               | User_dao          | Create User :type :email                          |
|                   | modifyUserRights                         | User_dao          | Modify User :type :email to :newType              |
|                   | deleteUser                               | User_dao          | Delete User :type :email                          |
|                   |                                          |                   |                                                   |
| Item_dao          | getItems                                 | Item_dao          | Get All Items                                     |
|                   | getItemByID                              | Item_dao          | GET Item by ID :id                                |
|                   | getItemBySKUIDAndSupplierID              | Item_dao          | Get Item by supplier :supplierid and SKUID :skuid |
|                   | createItem                               | Item_dao          | Create Item :itemid                               |
|                   | modifyItem                               | Item_dao          | Modify Item :id                                   |
|                   | deleteItem                               | Item_dao          | Delete Item :id                                   |

### Code coverage report

    <Add here the screenshot report of the statement and branch coverage obtained using
    the coverage tool. >


### Loop coverage analysis

    <Identify significant loops in the units and reports the test cases
    developed to cover zero, one or multiple iterations >

|Unit name | Loop rows | Number of iterations | Jest test case |
|---|---|---|---|
|||||
|||||
||||||



