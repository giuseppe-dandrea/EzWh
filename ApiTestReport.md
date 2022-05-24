# Integration and API Test Report

Date:

Version:

# Contents

- [Dependency graph](#dependency graph)

- [Integration approach](#integration)

- [Tests](#tests)

- [Scenarios](#scenarios)

- [Coverage of scenarios and FR](#scenario-coverage)
- [Coverage of non-functional requirements](#nfr-coverage)



# Dependency graph 

```plantuml

class server

package routers {
    class InternalOrder_router
    class Item_router
    class Position_router
    class RestockOrder_router
    class ReturnOrder_router
    class SKU_router
    class SKUItem_router
    class TestDescriptor_router
    class TestResult_router
    class User_router
}

package services {
    class InternalOrder_service
    class Item_service
    class Position_service
    class RestockOrder_service
    class ReturnOrder_service
    class SKU_service
    class SKUItem_service
    class TestDescriptor_service
    class TestResult_service
    class User_service
}

package dao {
    class InternalOrder_dao
    class Item_dao
    class Position_dao
    class RestockOrder_dao
    class ReturnOrder_dao
    class SKU_dao
    class SKUItem_dao
    class TestDescriptor_dao
    class TestResult_dao
    class User_dao
}

class DatabaseConnection

server <-- InternalOrder_router
server <-- Item_router
server <-- Position_router
server <-- RestockOrder_router
server <-- ReturnOrder_router
server <-- SKU_router
server <-- SKUItem_router
server <-- TestDescriptor_router
server <-- TestResult_router
server <-- User_router

InternalOrder_router <-- InternalOrder_service
Item_router <-- Item_service
Position_router <-- Position_service
RestockOrder_router <-- RestockOrder_service
ReturnOrder_router <-- ReturnOrder_service
SKU_router <-- SKU_service
SKUItem_router <-- SKUItem_service
TestDescriptor_router <-- TestDescriptor_service
TestResult_router <-- TestResult_service
User_router <-- User_service

InternalOrder_service <-- InternalOrder_dao
InternalOrder_service <-- SKU_dao
InternalOrder_service <-- SKUItem_dao
InternalOrder_service <-- User_dao
Item_service <-- Item_dao
Item_service <-- SKU_dao
Item_service <-- User_dao
Position_service <-- Position_dao
RestockOrder_service <-- RestockOrder_dao
RestockOrder_service <-- Item_dao
RestockOrder_service <-- SKUItem_dao
ReturnOrder_service <-- ReturnOrder_dao
ReturnOrder_service <-- RestockOrder_dao
ReturnOrder_service <-- SKU_dao
ReturnOrder_service <-- SKUItem_dao
SKU_service <-- SKU_dao
SKU_service <-- Position_dao
SKUItem_service <-- SKUItem_dao
SKUItem_service <-- SKU_dao
TestDescriptor_service <-- TestDescriptor_dao
TestDescriptor_service <-- SKU_dao
TestResult_service <-- TestResult_dao
TestResult_service <-- TestDescriptor_dao
TestResult_service <-- SKUItem_dao
User_service <-- User_dao

InternalOrder_dao <-- DatabaseConnection
Item_dao <-- DatabaseConnection
Position_dao <-- DatabaseConnection
RestockOrder_dao <-- DatabaseConnection
ReturnOrder_dao <-- DatabaseConnection
SKU_dao <-- DatabaseConnection
SKUItem_dao <-- DatabaseConnection
TestDescriptor_dao <-- DatabaseConnection
TestResult_dao <-- DatabaseConnection
User_dao <-- DatabaseConnection
```
     
# Integration approach

    <Write here the integration sequence you adopted, in general terms (top down, bottom up, mixed) and as sequence
    (ex: step1: class A, step 2: class A+B, step 3: class A+B+C, etc)> 
    <Some steps may  correspond to unit testing (ex step1 in ex above), presented in other document UnitTestReport.md>
    <One step will  correspond to API testing>
    


#  Integration Tests

   <define below a table for each integration step. For each integration step report the group of classes under test, and the names of
     Jest test cases applied to them, and the mock ups used, if any> Jest test cases should be here code/server/unit_test

## Step 1
| Classes  | mock up used |Jest test cases |
|--|--|--|
||||


## Step 2
| Classes  | mock up used |Jest test cases |
|--|--|--|
||||


## Step n 

   
| Classes  | mock up used |Jest test cases |
|--|--|--|
||||




# API testing - Scenarios


<If needed, define here additional scenarios for the application. Scenarios should be named
 referring the UC in the OfficialRequirements that they detail>

## Scenario UCx.y

| Scenario |  name |
| ------------- |:-------------:| 
|  Precondition     |  |
|  Post condition     |   |
| Step#        | Description  |
|  1     |  ... |  
|  2     |  ... |



# Coverage of Scenarios and FR


| Scenario ID       | Functional Requirements covered | Mocha  Test(s)                                     |
|-------------------|---------------------------------|----------------------------------------------------| 
| UC1               | FR2                             | "TEST SKU API" in testSKU.js                       |             
| UC2               | FR3.1                           | "TEST Position API" in testPosition.js             |             
| UC3, UC5.1, UC5.3 | FR5.1-5.8                       | "TEST RestockOrder API" in testRestockOrder.js     |   
| UC4, UC7          | FR1                             | "TEST User API" in testUser.js                     |             
| UC5.2             | FR5.8.2                         | "Add test results" in testTestResult.js            |
| UC5.3             | FR5.8                           | "TEST SKUItem API" in testSKUItem.js               |
| UC6               | FR5.9-5.12                      | "TEST ReturnOrder API" in testReturnOrder.js       |
| UC9, UC10         | FR6                             | "TEST InternalOrder API" in testInternalOrder.js   |
| UC11              | FR7                             | "TEST Item API" in testItem.js                     |
| UC12              | FR3.2                           | "Test TestDescriptor API" in testTestDescriptor.js |


# Coverage of Non Functional Requirements


<Report in the following table the coverage of the Non Functional Requirements of the application - only those that can be tested with automated testing frameworks.>


### 

| Non Functional Requirement | Test name                              |
|----------------------------|----------------------------------------|
| NFR4                       | "TEST Position API" in testPosition.js |
| NFR6                       | "TEST SKUItem API" in testSKUItem.js   |
| NFR9                       | "TEST SKUItem API" in testSKUItem.js   |
