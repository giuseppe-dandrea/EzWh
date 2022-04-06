
 #Requirements Document 

Date: 22 march 2022

Version: 0.0

 
| Version number | Change |
| ----------------- |:-----------|
| | | 


# Contents

- [Informal description](#informal-description)
- [Stakeholders](#stakeholders)
- [Context Diagram and interfaces](#context-diagram-and-interfaces)
	+ [Context Diagram](#context-diagram)
	+ [Interfaces](#interfaces) 
	
- [Stories and personas](#stories-and-personas)
- [Functional and non functional requirements](#functional-and-non-functional-requirements)
	+ [Functional Requirements](#functional-requirements)
	+ [Non functional requirements](#non-functional-requirements)
- [Use case diagram and use cases](#use-case-diagram-and-use-cases)
	+ [Use case diagram](#use-case-diagram)
	+ [Use cases](#use-cases)
    	+ [Relevant scenarios](#relevant-scenarios)
- [Glossary](#glossary)
- [System design](#system-design)
- [Deployment diagram](#deployment-diagram)

# Informal description
Medium companies and retailers need a simple application to manage the relationship with suppliers and the inventory of physical items stocked in a physical warehouse. 
The warehouse is supervised by a manager, who supervises the availability of items. When a certain item is in short supply, the manager issues an order to a supplier. In general the same item can be purchased by many suppliers. The warehouse keeps a list of possible suppliers per item. 

After some time the items ordered to a supplier are received. The items must be quality checked and stored in specific positions in the warehouse. The quality check is performed by specific roles (quality office), who apply specific tests for item (different items are tested differently). Possibly the tests are not made at all, or made randomly on some of the items received. If an item does not pass a quality test it may be rejected and sent back to the supplier. 

Storage of items in the warehouse must take into account the availability of physical space in the warehouse. Further the position of items must be traced to guide later recollection of them.

The warehouse is part of a company. Other organizational units (OU) of the company may ask for items in the warehouse. This is implemented via internal orders, received by the warehouse. Upon reception of an internal order the warehouse must collect the requested item(s), prepare them and deliver them to a pick up area. When the item is collected by the other OU the internal order is completed. 

EZWH (EaSy WareHouse) is a software application to support the management of a warehouse.



# Stakeholders


| Stakeholder name  | Description | 
| ----------------- |:-----------:|
|   Medium company    	 | The company interested in using the software EzWh  |
|   Suppliers		   	 | Vendors or entities that provide items to the company |
|   Inventory            | The physical space used to store recived items  |  
|   Warehouse manager 	 | An Employee who manages the warehouse and supervises the availability of items |
|   Administator         | Person who installs the application,  mantains it, defines users and assign privileges |
|   Quality office 		 | Applied specific tests for item, and reject them if they don't pass the check |
|   Organizational units | Other Internal company units that can make internal orders |
|   Warehouse employees  | Employees who receive orders and items and manage them |
|   Competitors		     | Other SWs for warehouse management |
|   Items                | Objects stored in the warehouse and requested in orders |
|   Mail Service          | Service used to contact suppliers for issuing new orders |

# Context Diagram and interfaces

## Context Diagram

```plantuml
left to right direction
skinparam actorStyle awesome

actor Employee as E
actor Adminstrator as A
actor "Organizational unit" as OU
actor "Quality Office" as QO
actor "Mail Service" as W
actor Item as I
actor Manager as M

rectangle System{
(EzWh) as EzWH
}
E -- EzWH
A --|> E
M --|> E
QO -- EzWH
OU -- EzWH
I -- EzWH
EzWH -- W
```

## Interfaces
\<describe here each interface in the context diagram>

\<GUIs will be described graphically in a separate document>

| Actor | Logical Interface | Physical Interface  |
| ------------- |:-------------:| -----:|
|   Actor x..     |  |  |

# Stories and personas
\<A Persona is a realistic impersonation of an actor. Define here a few personas and describe in plain text how a persona interacts with the system>

\<Persona is-an-instance-of actor>

\<stories will be formalized later as scenarios in use cases>


# Functional and non functional requirements

## Functional Requirements

# Stakeholders


| Stakeholder name  | Description | 
| ----------------- |:-----------:|
|   Medium company    	 | The company interested in using the software EzWh  |
|   Suppliers		   	 | Vendors or entities that provide items to the company |
|   Inventory            | The physical space used to store recived items  |  
|   Warehouse manager 	 | An Employee who manages the warehouse and supervises the availability of items |
|   Administator         | Person who installs the application,  mantains it, defines users and assign privileges |
|   Quality office 		 | Applied specific tests for item, and reject them if they don't pass the check |
|   Organizational units | Other Internal company units that can make internal orders |
|   Warehouse employees  | Employees who receive orders and items and manage them |
|   Competitors		     | Other SWs for warehouse management |
|   Items                | Objects stored in the warehouse and requested in orders |
|   Mail Service          | Service used to contact suppliers for issuing new orders |

# Context Diagram and interfaces

## Context Diagram

```plantuml
left to right direction
skinparam actorStyle awesome

actor Employee as E
actor Adminstrator as A
actor "Organizational unit" as OU
actor "Quality Office" as QO
actor "Mail Service" as W
actor Item as I
actor Manager as M

rectangle System{
(EzWh) as EzWH
}
E -- EzWH
A --|> E
M --|> E
QO -- EzWH
OU -- EzWH
I -- EzWH
EzWH -- W
```

## Interfaces
\<describe here each interface in the context diagram>

\<GUIs will be described graphically in a separate document>

| Actor | Logical Interface | Physical Interface  |
| ------------- |:-------------:| -----:|
|   Actor x..     |  |  |

# Stories and personas
\<A Persona is a realistic impersonation of an actor. Define here a few personas and describe in plain text how a persona interacts with the system>

\<Persona is-an-instance-of actor>

\<stories will be formalized later as scenarios in use cases>


# Functional and non functional requirements

## Functional Requirements

| ID        | Description  |
| ------------- |:-------------:| 
| FR 1     |  Manage users and rights |
| 	FR 1.1 	| Define new user |
| 	FR 1.2 	| Delete a user |
| 	FR 1.3 	| List all users   |
| 	FR 1.4 	| Search a user   |
| 	FR 1.4.1 	| Filtered Search for users  |
| 	FR 1.5 	|  Manage rights. Authorize access to functions to specific actors according to access rights |
| 	FR 1.6 	|  Modify User Information |
|  												|  								|
|  												|  								|
|  												|  								|
| 	FR 2 	| User's Authorization and functionalities |
| 	FR 2.1 	|  Authenticate user  |
| 	FR 2.2	|  Change Password  |
| 	FR 2.3	|  Edit user Information  |
|  												|  								|
|  												|  								|
|  												|  								|
| FR 3	  | Manage Items |\\min max count 
| 	FR 3.1 	| Create a new item |
| 	FR 3.2 	| Search  item  |
| 	FR 3.2.1 	| Filtered Search for an items  |
| 	FR 3.1 	| Modify item properties |
| 	FR 3.2 	| Show Item properties |
| 	FR 3.3 	| Issue stock treshold warning for a item type|
| 	FR 3.4 	| List all items|
| 	FR 3.5 	| Delete Item|
|  												|  								|
|  												|  								|
|  												|  								|
| FR 4   | Manage Items Orders|
|	FR 4.1 	| Issue an order |
|	FR 4.1.1 	| Re-order and modifiy items and/or quantity |
| 	FR 4.2 	| List all orders (Pending, Recieved, Checked , Completed , Rejected) |
| 	FR 4.3 	| Search an order |
| 	FR 4.3.1 	| Filtered search for an order |
| 	FR 4.4 	| Show order |
| 	FR 4.5 	| Cancel a pending order |
| 	FR 4.6 	| Change order state to (Recieved)  |\\ change state to recieved
| 	FR 4.7 	| Submit recieved order to quality office |
| 	FR 4.8 	| Change order state to (Ready to be Stocked)  |
| 	FR 4.9 	| Stock order into specific position |
| 	FR 4.10 | Reject order and send back |
|  												|  								|
|  												|  								|
|  												|  								|
| FR 5   | Manage suppliers |
|	FR 5.1 	| Create or modify a supplier |
| 	FR 5.2	| Delete a supplier  |
|	FR 5.3	| Search suppliers  |
|	FR 5.3.1	| Filtered Search for suppliers  |
| 	FR 5.4 	| List  all suppliers  |
| 	FR 5.5 	| List  all supplied items for a supplier  |
|  												|  								|
|  												|  								|
|  												|  								|
| FR 6 	| Manage Inventory  |
| 	FR 6.1 	| Show Inventrory overview  |
| 	FR 6.2 	| Show Available spaces |
|  												|  								|
|  												|  								|
|  												|  								|
| FR 7	| Manage Internal Order  |
| 	FR 7.1	| Notify for arriving order  |
| 	FR 7.2	| Check items availabilty and position  |
| 	FR 7.3	| Approve / Reject Order   |
| 	FR 7.4	| Show all internal ordres   |
| 	FR 7.5	| Search internal order   |
| 	FR 7.5.1	| Filtered search internal order   |
| 	FR 7.6	| Change order State (Pending , Ready to collect , Collected , Rejected, Cancelled)  |
|  												|  								|
|  												|  								|
|  												|  								|
| FR 8	|  Internal Orders  |
|	FR 8.1 	| Issue an internal order |
|	FR 8.1.1 	| Re-order and modifiy items and/or quantity |
| 	FR 8.2	| Show items availabilty  |
| 	FR 8.3	| Cancel an internal order   |


## Non Functional Requirements

\<Describe constraints on functional requirements>

| ID        | Type (efficiency, reliability, ..)           | Description  | Refers to |
| ------------- |:-------------:| :-----:| -----:|
|  NFR1     |   |  | |
|  NFR2     | |  | |
|  NFR3     | | | |
| NFRx .. | | | | 


# Use case diagram and use cases


## Use case diagram
\<define here UML Use case diagram UCD summarizing all use cases, and their relationships>


\<next describe here each use case in the UCD>
### Use case 1, UC1
| Actors Involved        |  |
| ------------- |:-------------:| 
|  Precondition     | \<Boolean expression, must evaluate to true before the UC can start> |
|  Post condition     | \<Boolean expression, must evaluate to true after UC is finished> |
|  Nominal Scenario     | \<Textual description of actions executed by the UC> |
|  Variants     | \<other normal executions> |
|  Exceptions     | \<exceptions, errors > |

##### Scenario 1.1 

\<describe here scenarios instances of UC1>

\<a scenario is a sequence of steps that corresponds to a particular execution of one use case>

\<a scenario is a more formal description of a story>

\<only relevant scenarios should be described>

| Scenario 1.1 | |
| ------------- |:-------------:| 
|  Precondition     | \<Boolean expression, must evaluate to true before the scenario can start> |
|  Post condition     | \<Boolean expression, must evaluate to true after scenario is finished> |
| Step#        | Description  |
|  1     |  |  
|  2     |  |
|  ...     |  |

##### Scenario 1.2

##### Scenario 1.x

### Use case 2, UC2
..

### Use case x, UCx
..



# Glossary

\<use UML class diagram to define important terms, or concepts in the domain of the system, and their relationships> 

\<concepts are used consistently all over the document, ex in use cases, requirements etc>

# System Design
\<describe here system design>

\<must be consistent with Context diagram>

# Deployment Diagram 

\<describe here deployment diagram >




