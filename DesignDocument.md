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

<discuss architectural styles used, if any>
<report package diagram, if needed>

# Low level design

```plantuml
class EzWh {
	+ SKUs : List<SKU>
	+ SKUItems : List<SKUItem>
	+ positions : List<Position>
	testDescriptors: Array<TestDescriptor>
	users: Array<User>
	+restockOrderList : List<RestockOrder>
	+returnOrderList : List<ReturnOrder>
	+internalOrderList : List<InternalOrder>
	__
	+ getSKUs() : List<SKU>
	+ getSKUById(id : String) : SKU
	+ getSKUByDescription(description : String) : List<SKU>
	+ createSKU(description : String, weight : Double, volume : Double, notes : string, price : Double, availableQuantity : Integer) : SKU
	+ modifySKU(id : String, newDescription : String, newWeight : Double, newVolume : Double, newNotes : string, newPrice : Double, newAvailableQuantity : Integer) : void
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
	{method} listAllTestDescriptors(): Array<TestDescriptor>
	{method} getTestDescriptorByID(ID: integer): TestDescriptor
	{method} addTestDescriptor(name: string, procedureDescription: string, idSKU: integer): void
	{method} modifyTestDescriptor(ID: integer, newName: string, newProcedureDescription: string, newIdSKU: integer): void
	{method} deleteTestDescriptor(ID: integer): void
	{method} listAllTestResultsByRFID(RFID: string): Array<TestResult>
	{method} getTestResultByIDAndRFID(RFID: string, ID: integer): TestResult
	{method} addTestResult(RFID: string, idTestDescriptor: integer, date: string, result: boolean): void
	{method} modifyTestResult(RFID: string, ID: integer, newIdTestDescriptor: integer, newDate: string, newResult: boolean): void
	{method} deleteTestResult(RFID: string, ID: integer): void
	{method} getUserInfo(ID: integer): User
	{method} listAllSuppliers(): Array<User>
	{method} listAllUsers(): Array<User>
	{method} addUser(email: string, name: string, surname: string, password: string, type: string): void
	{method} login(email: string, password: string, type: string): User
	{method} logout(ID: integer): void
	{method} modifyUserRights(email: string, oldType: string, newType: string): void
	{method} deleteUser(email: string, type: string): void

	 ..
	+ getItems (): List<Item>
	+ getItemById (id: string) : Item
	+ addNewItem( description: string, price : double, SKUId : string, supplierId : string): Item
	+ modifyItem(id: string, newDescription: string, newPrice: double ): void
	+ deleteItem(id:string) : void
	..
	+getRestockOrders() : List<RestockOrder>
	+getRestockOrdersIssued() : List<RestockOrder>
	+getRestockOrderById(id : Integer) : RestockOrder
	+getRestockOrderReturnItems(id : Integer) : List<SKUItem>
	+createRestockOrder(issueDate : String, products : List <SKU>, supplierId : Integer) : void
	+modifyRestockOrder(id : Integer, state : String)
	+addSkuItemsToRestockOrder(id : Integer, skuItems : List<skuItems>) : void
	+addTransportNoteToRestockOrder(transportNote : JSON) : void
	+deleteRestockOrder(id : Integer) : void
	..
	+getReturnOrders() : List<ReturnOrder>
	+getReturnOrderById(id : Integer) : ReturnOrder
	+createReturnOrder(returnDate : String, products : List<SkuItem>, restockOrderId : Integer) : void
	+deleteReturnOrder(id : Integer) : void
	..
	+getInternalOrders() : List<InternalOrder>
	+getInternalOrdersIssued() : List<InternalOrder>
	+getInternalOrdersAccepted() : List<InternalOrder>
	+getInternalOrderById(id : Integer) : InternalOrder
	+createInternalOrder(issueDate : String, state : String, products : List<SkuItem>) : void
	+ModifyInternalOrderState(state : String, RFIDs : List<JSON>)
	+deleteInternalOrder(id : Integer) : void
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
	+ SKU(id : String, description : String, weight : Double, volume : Double, notes : string, price : Double, availableQuantity : Integer) : SKU
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

class TestDescriptor {
	ID: integer
	name: string
	procedureDescription: string
	idSKU: integer
	{method} getID(): integer
	{method} setID(ID: integer): void
	{method} getName(): string
	{method} setName(name: string): void
	{method} getProcedureDescription(): string
	{method} setProcedureDescription(procedureDescription: string): void
	{method} getIdSKU(): integer
	{method} setIdSKU(idSKU: integer): void
	{method} new(ID: integer, name: string, procedureDescription: string, idSKU: integer): TestDescriptor
}


class TestResult {
	ID: integer
	idTestDescriptor: integer
	date: string
	result: boolean
	{method} getID(): integer
	{method} setID(ID: integer): void
	{method} getIdTestDescriptor(): integer
	{method} setIdTestDescriptor(idTestDescriptor: integer): void
	{method} getDate(): string
	{method} setDate(date: string): void
	{method} getResult(): boolean
	{method} setResult(result: boolean): void
	{method} new(ID: integer, idTestDescriptor: integer, date: string, result: boolean): TestResult
}

class SKUItem {
	RFID: string
	testResults: Array<TestResult>
	{method} getTestResults(): Array<TestResult>
	{method} addTestResult(ID: integer, idTestDescriptor: integer, date: string, result: boolean): void
	{method} modifyTestResult(ID: integer, newIdTestDescriptor: integer, newDate: string, newResult: boolean): void
	{method} deleteTestResult(ID: integer): void
}

class User {
	ID: integer
	name: string
	surname: string
	email: string
	type: string
	password: string
	{method} getID(): integer
	{method} setID(ID: integer): void
	{method} getName(): string
	{method} setName(name: string): void
	{method} getSurname(): string
	{method} setSurname(surname: string): void
	{method} getEmail(): string
	{method} setEmail(email: string): void
	{method} getType(): string
	{method} setType(): string
	{method} getPassword(): string
	{method} setPassword(password: string): void
	{method} new(ID: integer, name: string, surname: string, email: string, type: string, password: string): User
}

class Item{
	- Id:String
	- description : string
	- price : double
	- SKUId : string
	- supplierId : string
	__
	+ getId() : string
	+ getDescription() : string
	+ getPrice() : double
	+ getSKUId() : string
	+ getSupplierId() : string
	..
	+ setId(Id:String) : void
	+ setDescription(description : string) : void
	+ setPrice(price : double) : void
	+ setSKUId(SKUId :string) : void
	+ setSupplierId(supplierId : string) : void
}
class InternalOrder{
	-id : Integer
	-issueDate : String
	-state : String
	-products : List<SkuItems>
	-customerId : Integer
	--
	+getId() : Integer
	+getIssueDate() : String
	+getState() : String
	+getProducts() : List<SkuItem>
	+getCustomerId() : Integer
	..
	+setId(id : Integer) : void
	+setIssueDate(issueDate : String) : void
	+setState(state : String) : void
	+setProducts(products : List<SkuItem>) : void
	+setCustomerId(customerId : Integer) : void
}

class ReturnOrder{
	-id : Integer
	-returnDate : String
	-products : List<SkuItem>
	-restockOrderId : Integer
	--
	+getId() : Integer
	+getReturnDate() : String
	+getProducts() : List<SkuItem>
	+getRestockOrderId() : Integer
	..
	+setId(id : Integer) : void
	+setReturnDate(returnDate : String) : void
	+setProducts(products : List<SkuItem>) : void
	+setRestockOrderId(restockOrderId : Integer) : void
}

class RestockOrder{
	-id : Integer
	-issueDate : String
	-state : String
	-products : List<SKU>
	-supplierId : Integer
	-transportNote : JSON
	-skuItems : List<SKUItem>
	--
	+getId() : Integer
	+getIssueDate() : String
	+getState() : String
	+getProducts() : List<SKU>
	+getSupplierId() : Integer
	+getTransportNote() : ???
	+getSkuItems() : List<SKUItem>
	..
	+setId(id : Integer) : void
	+setIssueDate(issueDate : String) : void
	+setState(state : String) : void
	+setProducts(products : List<SKU>) : void
	+setSupplierId(supplierId : Integer) : void
	+setTransportNote(transportNote : JSON) : void
	+setSkuItems(skuItems : List<SKUItem>) : void
}

EzWh -- "*" SKU
SKU -- "*" SKUItem
SKUItem -- "*" TestResult
TestDescriptor -- "*" TestResult
```

# Verification traceability matrix

| FR  | EzWh | User | SKU | SKUItem | TestDescriptor | TestResult | Position | Item | RestockOrder | InternalOrder | ReturnOrder |
| --- | :--: | :--: | :-: | :-----: | :------------: | :--------: | :------: | :--: | :----------: | :-----------: | :---------: |
| FR1 |  x   |      |     |         |                |            |          |      |              |               |             |
| FR2 |  x   |      |     |         |                |            |          |      |              |               |             |
| FR3 |  x   |      |     |         |                |            |          |      |              |               |             |
| FR4 |  x   |      |     |         |                |            |          |      |              |               |             |
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
