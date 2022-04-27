# Design Document

Authors: Abdelrahman SAYED AHMED , Giuseppe D'Andrea , Shayan Taghinezhad Roudbaraki , Giacomo Bruno

Date: 26/04/2022

Version:

# Contents

- [High level design](#package-diagram)
- [Low level design](#class-diagram)
- [Verification traceability matrix](#verification-traceability-matrix)
- [Verification sequence diagrams](#verification-sequence-diagrams)

# Instructions

The design must satisfy the Official Requirements document, notably functional and non functional requirements, and be consistent with the APIs

# High level design

```plantuml

package Frontend <<Folder>>{
    package View <<Folder>>{
}
    package Controller <<Folder>>{
}
}
package Backend <<Folder>>{

    package Controller/API <<Folder>>{
}
    package Model <<Folder>>{
}

}

Controller <|-- View
"Controller/API" --|> Model
Frontend --|>Backend


```

Architectural pattern: Hybird of layerd pattern and MVC , separating Frontend and Backend .

# Low level design

```plantuml
class EzWh {
	+ SKUs : List<SKU>
	+ SKUItems : List<SKUItem>
	+ positions : List<Position>
	+ testDescriptors: List<TestDescriptor>
	+ users: List<User>
	+ restockOrders : List<RestockOrder>
	+ returnOrders : List<ReturnOrder>
	+ internalOrders : List<InternalOrder>
	__
	+ getSKUs() : List<SKU>
	+ getSKUById(id : String) : SKU
	+ getSKUByDescription(description : String) : List<SKU>
	+ createSKU(description : String, weight : Double, volume : Double, notes : String, price : Double, availableQuantity : Integer) : SKU
	+ modifySKU(id : String, newDescription : String, newWeight : Double, newVolume : Double, newNotes : String, newPrice : Double, newAvailableQuantity : Integer) : void
	+ addSKUPosition(id : String, position : Position) : void
	+ deleteSKU(id : String) : void
	..
	+ getSKUItems() : List<SKUItem>
	+ getSKUItemsBySKU(SKUid : String) : List<SKUItem>
	+ getSKUItemByRfid(rfid : String) : SKUItem
	+ createSKUItem(rfid : String, SKUid : String, dateOfStock : String) : SKUItem
	+ modifySKUItem(rfid : String, newRfid : String, newAvailable : Bool, newDateOfStock : String) : void
	+ deleteSKUItem(rfid : String) : void
	..
	+ getPositions() : List<Position>
	+ createPosition(positionId : String, aisleId : String, row : String, col : String, maxWeight : Double, maxVolume : Double) : Position
	+ modifyPosition(positionId : String, newAisleId : String, newRow : String, newCol : String, newMaxWeight : Double, newMaxVolume : Double, newOccupiedWeight : Double, newOccupiedVolume : Double) : void
	+ modifyPositionId(positionId : String, newPositionId: String) : void
	+ deletePositionId(positionId : String) : void
	~ getPositionById(positionId : String) : Position
	..
	+ listAllTestDescriptors(): List<TestDescriptor>
	+ getTestDescriptorByID(id: Integer): TestDescriptor
	+ addTestDescriptor(name: String, procedureDescription: String, idSKU: Integer): void
	+ modifyTestDescriptor(id: Integer, newName: String, newProcedureDescription: String, newIdSKU: Integer): void
	+ deleteTestDescriptor(id: Integer): void
	..
	+ listAllTestResultsByRFID(RFID: String): List<TestResult>
	+ getTestResultByIDAndRFID(RFID: String, id: Integer): TestResult
	+ addTestResult(RFID: String, idTestDescriptor: Integer, date: String, result: boolean): void
	+ modifyTestResult(RFID: String, id: Integer, newIdTestDescriptor: Integer, newDate: String, newResult: boolean): void
	+ deleteTestResult(RFID: String, id: Integer): void
	..
	+ getUserInfo(id: Integer): User
	+ listAllSuppliers(): List<User>
	+ listAllUsers(): List<User>
	+ addUser(email: String, name: String, surname: String, password: String, type: String): void
	+ login(email: String, password: String, type: String): User
	+ logout(id : Integer): void
	+ modifyUserRights(email: String, oldType: String, newType: String): void
	+ deleteUser(email: String, type: String): void
	~ getUserByEmail(email: String): User
	..
	+ getItems (): List<Item>
	+ getItemById (id: String) : Item
	+ addNewItem( description: String, price : double, SKUId : String, supplierId : String): Item
	+ modifyItem(id: String, newDescription: String, newPrice: double ): void
	+ deleteItem(id:String) : void
	..
	+ getRestockOrders() : List<RestockOrder>
	+ getRestockOrdersIssued() : List<RestockOrder>
	+ getRestockOrderById(id : Integer) : RestockOrder
	+ getRestockOrderReturnItems(id : Integer) : List<SKUItem>
	+ createRestockOrder(issueDate : String, products : Map<Item, Integer>, supplierId : Integer) : void
	+ modifyRestockOrder(id : Integer, state : RestockOrderState)
	+ addSkuItemsToRestockOrder(id : Integer, skuItems : List<SKUItem>) : void
	+ addTransportNoteToRestockOrder(transportNote : TransportNote) : void
	+ deleteRestockOrder(id : Integer) : void
	..
	+ getReturnOrders() : List<ReturnOrder>
	+ getReturnOrderById(id : Integer) : ReturnOrder
	+ createReturnOrder(returnDate : String, products : List<SkuItem>, restockOrderId : Integer) : void
	+ deleteReturnOrder(id : Integer) : void
	..
	+ getInternalOrders() : List<InternalOrder>
	+ getInternalOrdersIssued() : List<InternalOrder>
	+ getInternalOrdersAccepted() : List<InternalOrder>
	+ getInternalOrderById(id : Integer) : InternalOrder
	+ createInternalOrder(issueDate : String, products : Map<SKU, Integer>, customerId : Integer) : void
	+ modifyInternalOrderState(state : InternalOrderState, RFIDs : List<JSON>)
	+ deleteInternalOrder(id : Integer) : void
}

class SKU {
	- id : String
	- description : String
	- weight : Double
	- volume : Double
	- price : Double
	- notes : String
	- position : Position
	- availableQuantity : Integer
	- testDescriptors : List<TestDescriptor>
	__
	+ SKU(id : String, description : String, weight : Double, volume : Double, notes : String, price : Double, availableQuantity : Integer) : SKU
	..
	+ getId() : String
	+ getDescription() : String
	+ getWeight() : Double
	+ getVolume() : Double
	+ getPrice() : Double
	+ getNotes() : String
	+ getPosition() : Position
	+ getAvailableQuantity() : Integer
	+ getTestDescriptors() : List<TestDescriptor>
	..
	+ setId(id : String) : void
	+ setDescription(description : String) : void
	+ setWeight(weight : Double) : void
	+ setVolume(volume : Double) : void
	+ setPrice(price : Double) : void
	+ setNotes(notes : String) : void
	+ setPosition(position : Position) : void
	+ setAvailableQuantity(availableQuantity : Integer) : void
	+ setTestDescriptors(testDescriptors : List<TestDescriptor>) : void
	..
	+ initTestDescriptor() : void
	+ addTestDescriptor(testDescriptor : TestDescriptor) : void

}

class Position {
	- positionId : String
	- aisleId : String
	- row : String
	- col : String
	- maxWeight : Double
	- maxVolume : Double
	- occupiedWeight : Double
	- occupiedVolume : Double
	- sku : SKU
	__
	+ Position(positionId : String, aisleId : String, row : String, col : String, maxWeight : Double, maxVolume : Double) : Position
	..
	+ getPositionId() : String
	+ getAisleId() : String
	+ getRow() : String
	+ getCol() : String
	+ getMaxWeight() : Double
	+ getMaxVolume() : Double
	+ getOccupiedWeight() : Double
	+ getOccupiedVolume() : Double
	+ getSku() : SKU
	..
	+ setPositionId(positionId : String) : void
	+ setAisleId(aisleId : String) : void
	+ setRow(row : String) : void
	+ setCol(col : String) : void
	+ setMaxWeight(maxWeight : Double) : void
	+ setMaxVolume(maxVolume : Double) : void
	+ setOccupiedWeight(occupiedWeight : Double) : void
	+ setOccupiedVolume(occupiedVolume : Double) : void
	+ setSku(sku : SKU) : void
}

together {

class SKUItem {
	- rfid : String
	- sku : SKU
	- available : Bool
	- dateOfStock : String
	- testResults : List<TestResult>
	__
	+ SKUItem(rfid : String, SKUid : String, dateOfStock : String) : SKUItem
	+ getRfid() : String
	+ getSKU() : SKU
	+ getAvailable() : Bool
	+ getDateOfStock() : String
	+ getTestResults() : List<TestResult>
	..
	+ setRfid(rfid : String) : void
	+ setSKU(sku : SKU) : void
	+ setAvailable(available : Bool) : void
	+ setDateOfStock(dateOfStock : String) : void
	+ setTestResults(testResults : List<TestResult>) : void
	..
	+ initTestResults() : void
	+ addTestResult(testResult : TestResult) : void
	+ modifyTestResult(id: Integer, newIdTestDescriptor: Integer, newDate: String, newResult: boolean): void
	+ deleteTestResult(id: Integer): void
}

class TestDescriptor {
	- id: Integer
	- name: String
	- procedureDescription: String
	- idSKU: Integer
	__
	+ TestDescriptor(id: Integer, name: String, procedureDescription: String, idSKU: Integer): TestDescriptor
	..
	+ getID(): Integer
	+ getName(): String
	+ getProcedureDescription(): String
	+ getIdSKU(): Integer
	..
	+ setID(id: Integer): void
	+ setName(name: String): void
	+ setProcedureDescription(procedureDescription: String): void
	+ setIdSKU(idSKU: Integer): void
}

class TestResult {
	- id: Integer
	- idTestDescriptor: Integer
	- date: String
	- result: boolean
	__
	+ TestResult(id: Integer, idTestDescriptor: Integer, date: String, result: boolean): TestResult
	..
	+ getID(): Integer
	+ getIdTestDescriptor(): Integer
	+ getDate(): String
	+ getResult(): boolean
	..
	+ setID(id: Integer): void
	+ setIdTestDescriptor(idTestDescriptor: Integer): void
	+ setDate(date: String): void
	+ setResult(result: boolean): void
}

}

enum UserType {
	ADMINISTRATOR
	MANAGER
	CLERK
	DELIVERYEMLPOYEE
	QUALITYCHECKEMPLOYEE
	INTERNALCUSTOMER
	SUPPLIER
}

class User {
	- id: Integer
	- name: String
	- surname: String
	- email: String
	- type: UserType
	- password: String
	__
	+ User(id: Integer, name: String, surname: String, email: String, type: String, password: String): User
	..
	+ getID(): Integer
	+ getName(): String
	+ getSurname(): String
	+ getEmail(): String
	+ getType(): UserType
	+ getPassword(): String
	..
	+ setID(id: Integer): void
	+ setName(name: String): void
	+ setSurname(surname: String): void
	+ setEmail(email: String): void
	+ setType(type : UserType): String
	+ setPassword(password: String): void
}

class Item {
	- id:String
	- description : String
	- price : double
	- SKUId : String
	- supplierId : String
	__
	+ Item(id : String, description: String, price : double, SKUId : String, supplierId : String)
	..
	+ getId() : String
	+ getDescription() : String
	+ getPrice() : double
	+ getSKUId() : String
	+ getSupplierId() : String
	..
	+ setId(id:String) : void
	+ setDescription(description : String) : void
	+ setPrice(price : double) : void
	+ setSKUId(SKUId :String) : void
	+ setSupplierId(supplierId : String) : void
}

enum InternalOrderState {
	ISSUED
	ACCEPTED
	REFUSED
	CANCELED
	COMPLETED
}

class InternalOrder {
	- id : Integer
	- issueDate : String
	- state : InternalOrderState
	- products : Map<SKU, Integer>
	- customerId : Integer
	- skuItems : List<SKUItem>
	--
	+ InternalOrder(id: Integer, issueDate : String, state : InternalOrderState, products : List<SkuItem>, customerId : Integer) : void
	..
	+ getId() : Integer
	+ getIssueDate() : String
	+ getState() : InternalOrderState
	+ getProducts() : Map<SKU, Integer>
	+ getCustomerId() : Integer
	+ getSkuItems() : List<SKUItem>
	..
	+ setId(id : Integer) : void
	+ setIssueDate(issueDate : String) : void
	+ setState(state : InternalOrderState) : void
	+ setProducts(products : Map<SKU, Integer>) : void
	+ setCustomerId(customerId : Integer) : void
	+ setSkuItems(skuItems : List<SKUItem>) : void
}

class ReturnOrder {
	- id : Integer
	- returnDate : String
	- products : List<SkuItem>
	- restockOrderId : Integer
	--
	+ ReturnOrder(id: Integer, returnDate : String, products : List<SkuItem>, restockOrderId : Integer) : void
	..
	+ getId() : Integer
	+ getReturnDate() : String
	+ getProducts() : List<SkuItem>
	+ getRestockOrderId() : Integer
	..
	+ setId(id : Integer) : void
	+ setReturnDate(returnDate : String) : void
	+ setProducts(products : List<SkuItem>) : void
	+ setRestockOrderId(restockOrderId : Integer) : void
}

enum RestockOrderState {
	ISSUED
	DELIVERY
	DELIVERED
	TESTED
	COMPLETEDRETURN
	COMPLETED
}

class RestockOrder {
	- id : Integer
	- issueDate : String
	- state : RestockOrderState
	- products : Map<Item, Integer>
	- supplierId : Integer
	- transportNote : TransportNote
	- skuItems : List<SKUItem>
	--
	+ RestockOrder(id: Integer, issueDate : String, state : RestockOrderState, products : List <SKU>, supplierId : Integer, transportNote : TransportNote) : void
	+ RestockOrder(id: Integer, issueDate : String, state : RestockOrderState, products : List <SKU>, supplierId : Integer, transportNote : TransportNote, skuItems : List<SKUItem>) : void
	..
	+ getId() : Integer
	+ getIssueDate() : String
	+ getState() : RestockOrderState
	+ getProducts() : Map<Item, Integer>
	+ getSupplierId() : Integer
	+ getTransportNote() : TransportNote
	+ getSkuItems() : List<SKUItem>
	..
	+ setId(id : Integer) : void
	+ setIssueDate(issueDate : String) : void
	+ setState(state : RestockOrderState) : void
	+ setProducts(products : Map<Item, Integer>) : void
	+ setSupplierId(supplierId : Integer) : void
	+ setTransportNote(transportNote : TransportNote) : void
	+ setSkuItems(skuItems : List<SKUItem>) : void
}

class TransportNote {
	- shipmentDate : String
	__
	+ TransportNote(shipmentDate : String)
	..
	+ getShipmentDate() : String
	..
	+ setShipmentDate(shipmentDate : String) : void
}

EzWh -- SKU : Inventory
SKU --  SKUItem : Describe
SKUItem -- TestResult
TestResult -u- TestDescriptor: Describe
EzWh -- RestockOrder
EzWh -- ReturnOrder
EzWh -- InternalOrder
RestockOrder -- Item
EzWh -- User
EzWh -- Position : Warehouse
UserType -- User
InternalOrderState -- InternalOrder
RestockOrderState -- RestockOrder
RestockOrder -- TransportNote
```

Design Pattern : Facade

# Verification traceability matrix

| FR  | EzWh | User | SKU | SKUItem | TestDescriptor | TestResult | Position | Item | RestockOrder | InternalOrder | ReturnOrder |
| --- | :--: | :--: | :-: | :-----: | :------------: | :--------: | :------: | :--: | :----------: | :-----------: | :---------: |
| FR1 |  x   |  x   |     |         |                |            |          |      |              |               |             |
| FR2 |  x   |      |     |         |                |            |          |      |              |               |             |
| FR3 |  x   |      |     |         |       x        |            |          |      |              |               |             |
| FR4 |  x   |  x   |     |         |                |            |          |      |              |               |             |
| FR5 |  x   |      |     |         |                |            |          |      |              |               |             |
| FR6 |  x   |      |     |         |                |            |          |      |              |               |             |
| FR7 |  x   |      |     |         |                |            |          |      |              |               |             |
| FR8 |  x   |  x   |  x  |         |                |            |          |  x   |              |               |             |

# Verification sequence diagrams

\<select key scenarios from the requirement document. For each of them define a sequence diagram showing that the scenario can be implemented by the classes and methods in the design>

## Scenario 1-1

```plantuml
actor Manager
participant EzWh
note over EzWh: Includes Frontend and\ninterface for Backend
participant Facade
participant SKU

Manager -> EzWh: Selects description D, weight W, volume V,\nnotes N, price P, availableQuantity Q
EzWh -> Facade: createSKU(D, W, V, N, P, Q)
activate Facade
Facade -> Facade: id = len(SKUs)
Facade -> SKU: new SKU(id, D, W, V, N, P, Q)
activate SKU
SKU --> Facade: SKU
deactivate SKU
deactivate Facade
```

## Scenario 1-3

```plantuml
actor Manager
participant EzWh
note over EzWh: Includes Frontend and\ninterface for Backend
participant Facade
participant SKU


Manager -> EzWh: Selects SKU S, description D, newWeight W, newVolume V,\nnotes N, price, P, availableQuantity Q
EzWh -> Facade: modifySKU(S, D, W, V, N, P, Q)
activate Facade
Facade -> Facade: SKU = getSKUById(S)
Facade -> SKU: SKU.setDescription(D)
activate SKU
SKU --> Facade: Done
deactivate SKU
Facade -> SKU: SKU.setWeight(W)
activate SKU
SKU --> Facade: Done
deactivate SKU
Facade -> SKU: SKU.setVolume(V)
activate SKU
SKU --> Facade: Done
deactivate SKU
Facade -> SKU: SKU.setNotes(N)
activate SKU
SKU --> Facade: Done
deactivate SKU
Facade -> SKU: SKU.setPrice(P)
activate SKU
SKU --> Facade: Done
deactivate SKU
Facade -> SKU: SKU.setAvailableQuantity(Q)
activate SKU
SKU --> Facade: Done
deactivate SKU
deactivate Facade
```

## Scenario 2-1

```plantuml
actor Manager
participant EzWh
note over EzWh: Includes Frontend and\ninterface for Backend
participant Facade
participant Position

Manager -> EzWh: Selects positionId P, aisleId A, row R,\ncol C, maxWeight W, maxVolume V
EzWh -> Facade: createPosition(P, A, R, C, W, V)
activate Facade
Facade -> Position: new Position(P, A, R, C, W, V)
activate Position
Position --> Facade: Position
deactivate Position
deactivate Facade
```

## Scenario 2-2

```plantuml
actor Manager
participant EzWh
note over EzWh: Includes Frontend and\ninterface for Backend
participant Facade
participant Position

Manager -> EzWh: Selects positionId P and newPositionId N
EzWh -> Facade: modifyPositionId(P, N)
activate Facade
Facade -> Facade: pos = getPositionById(P)
Facade -> Position: pos.setPositionId(N)
activate Position
Position --> Facade: Done
deactivate Position
deactivate Facade
```

## Scenario 3-1

```plantuml
actor Manager
participant EzWh
note over EzWh: Includes Frontend and\ninterface for Backend
participant Facade
participant RestockOrder

Manager -> EzWh: Creates Restock Order, inserts issueDate D, Item I, quantity Q and Supplier SP
EzWh -> Facade: CreateRestockOrder (D, (I, Q), SP)
activate Facade
Facade -> RestockOrder: new RestockOrder(null, D, "ISSDUED", null, SP, null)
activate RestockOrder
RestockOrder --> Facade: RestockOrder
deactivate RestockOrder
deactivate Facade
```

## Scenario 4-1 <!-- Manager -->

```plantuml
actor Administrator
participant EzWh
note over EzWh: Includes Frontend and\ninterface for Backend
participant Facade
participant User

Administrator -> EzWh: Selects email EM, name N, surname S, password P, type T
EzWh -> Facade: addUser(EM, N, S, P, T)
activate Facade
Facade -> Facade: id = len(users)
Facade -> User: new User(id, N, S, EM, T, P)
activate User
User -> Facade: User
deactivate User
Facade --> EzWh: Done
deactivate Facade
EzWh --> Administrator: Done
```

## Scenario 4-2 <!--Manager-->

```plantuml
actor Administrator
participant EzWh
note over EzWh: Includes Frontend and\ninterface for Backend
participant Facade
participant User

Administrator -> EzWh: Selects email EM, oldType OT, newType NT
EzWh -> Facade: modifyUserRights(EM, OT, NT)
activate Facade
Facade -> Facade: u = getUserByEmail(EM)
Facade -> User: u.setType(NT)
activate User
User --> Facade: Done
deactivate User
Facade --> EzWh: Done
deactivate Facade
EzWh --> Administrator: Done
```

## Scenario 5-1-1

```plantuml
actor Clerk
participant EzWh
note over EzWh: Includes Frontend and\ninterface for Backend
participant Facade
participant RestockOrder

Clerk -> EzWh: given Restock Order RO, it is in DELIVERY state, C records every item in the RO with a new RFID and changes state to DELIVERED
EzWh -> Facade: getRestockOrderById(RoId)
activate Facade
Facade --> EzWh: RestockOrder
deactivate Facade
EzWh --> Clerk: Done

Clerk -> EzWh: add RFID to SkuItem
EzWh -> Facade: createSKUItem(RFID, SKUid, dateOfStock)
activate Facade
Facade --> EzWh: Done
deactivate Facade
EzWh --> Clerk: Done

Clerk -> EzWh: Change Restock Order state to delivered
EzWh -> Facade: modifyRestockOrder(id , "DELIVERED")
activate Facade
Facade -> Facade: restockOrder = getRestockOrderById(id)
Facade -> RestockOrder: restockOrder.setState("DELIVERED")
activate RestockOrder
RestockOrder --> Facade: Done
Deactivate RestockOrder
Deactivate Facade
Facade --> EzWh: Done
EzWh --> Clerk: Done
```

## Scenario 9-1

```plantuml
actor Customer
participant EzWh
note over EzWh: Includes Frontend and\ninterface for Backend
participant Facade
participant InternalOrder
actor Manager

Customer -> EzWh: adds every SKU she wants in every qty to IO
EzWh -> Facade: createInternalOrder(date, <SKU,qty>, C.id)
Facade ->Facade :id = len(InternalOrders)
activate Facade
Facade ->InternalOrder: newInternalOrder(id,issueDate, ISSUED,  <SKU,qty>, C.id)
InternalOrder-->Facade : InternalOrder
Facade->Facade : modifySKU(newAvailableQuantity)
Facade->Facade :modifyPosition(newOccupiedWeight , newOccupiedVolume)
deactivate Facade
Manager->EzWh :select new internal order
EzWh -> Facade : modifyInternalOrderState(Accepted)
```

## Scenario 11-1

```plantuml
actor Supplier
participant EzWh
note over EzWh: Includes Frontend and\ninterface for Backend
participant Facade
participant Item

Supplier -> EzWh: Selects description D, Price P , SKU

EzWh -> Facade: addNewItem(D , SKU, P)

activate Facade
Facade -> Facade: id = len(Items)
Facade -> Item: new Item(id, D, P, SKU, S.id)
activate Item
Item --> Facade: Item
deactivate Facade
deactivate Item
```

## Scenario 11-2

```plantuml
actor Supplier
participant EzWh
note over EzWh: Includes Frontend and\ninterface for Backend
participant Facade


Supplier -> EzWh: Search Item I
EzWh -> Facade: getItembyId(id)
activate Facade
Facade --> EzWh : Item
deactivate Facade
Supplier -> EzWh: Select newDescription nD, newPrice nP
EzWh -> Facade: modifyItem(id , nD , Np)

```

## Scenario 12-1

```plantuml
actor Manager
participant EzWh
note over EzWh: Includes Frontend and\ninterface for Backend
participant Facade
participant TestDescriptor
participant SKU

Manager -> EzWh: Selects name N, procedureDescription PD, idSKU IS
EzWh -> Facade: addTestDescriptor(N, PD, IS)
activate Facade
Facade -> Facade: id = len(testDescriptors)
Facade -> TestDescriptor: td = new TestDescriptor(id, N, PD, IS)
activate TestDescriptor
TestDescriptor --> Facade: Done
deactivate TestDescriptor
Facade -> Facade: s = getSKUByID(IS)
Facade -> SKU: s.addTestDescriptor(t)
activate SKU
SKU --> Facade: Done
deactivate SKU
Facade --> EzWh: Done
deactivate Facade
EzWh --> Manager: Done
```

## Scenario 12-2

```plantuml
actor Manager
participant EzWh
note over EzWh: Includes Frontend and\ninterface for Backend
participant Facade
participant TestDescriptor

Manager -> EzWh: Selects ID, newProcedureDescription NPD, name N, idSKU IS
EzWh -> Facade: modifyTestDescriptor(ID, N, NPD, IS)
activate Facade
Facade -> Facade: td = getTestDescriptorByID(ID)
Facade -> TestDescriptor: td.setProcedureDescription(NPD)
activate TestDescriptor
TestDescriptor --> Facade: Done
deactivate TestDescriptor
Facade --> EzWh: Done
deactivate Facade
EzWh --> Manager: Done
```
