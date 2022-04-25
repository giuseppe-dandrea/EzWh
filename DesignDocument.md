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

<for each package in high level design, report class diagram. Each class should detail attributes and operations>

```plantuml

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


class EZWH {
  testDescriptors: Array<TestDescriptor>
  SKUItems: Array<SKUItem>
  users: Array<User>
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

SKUItem -- "*" TestResult
TestDescriptor -- "*" TestResult 

```

# Verification traceability matrix

\<for each functional requirement from the requirement document, list which classes concur to implement it>











# Verification sequence diagrams 
\<select key scenarios from the requirement document. For each of them define a sequence diagram showing that the scenario can be implemented by the classes and methods in the design>

