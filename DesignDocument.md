# Design Document 


Authors: 

Date:

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

EzWh -- "*" SKU
SKU -- "*" SKUItem
SKUItem -- "*" TestResult
TestDescriptor -- "*" TestResult 
```

# Verification traceability matrix

\<for each functional requirement from the requirement document, list which classes concur to implement it>











# Verification sequence diagrams 
\<select key scenarios from the requirement document. For each of them define a sequence diagram showing that the scenario can be implemented by the classes and methods in the design>

