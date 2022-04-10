
 #Requirements Document 

Date: 22 march 2022

Version: 1.2

 
| Version number | Change |
| ----------------- |:-----------|
|1.2 |adding Use Cases 1,2,3 | 


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
|   Mail Service         | Service used to contact suppliers for requesting new orders |

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

|	     Actor   		| Logical Interface | Physical Interface  |
| --------------------- |:---------------------------------------------:| -------------------------:|
|  Employee - Quality Office - OU	|  GUI			            | Keyboard , Mouse, Screen , Mobile Device 	|
|  Items			                | Function (ReadBarcode )   | Barcode reader | 
|  Mail service 					| API - Mail Protocols		| Internet Connection | 


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

| ID        | Type (efficiency, reliability, ..)  | Description  | Refers to |
| ------------- |:-------------:| :-----:| -----:|
|  NFR1     |  Usability |  Users should be able to use the software with 2 hours training | All FR |
|  NFR2     |  Efficiency  |  Software should provide response in less than 0.5s | All FR |
|  NFR3 	|  Reliability  |  Software shouldn't have more than 4 days of downtime every year | All FR |
|  NFR4 	|  Portability  | Software should run on Windows/Linux/MacOs | All FR |
|  NFR5		|  Mantainability  | Software can be reinstalled in another machine with a backup | All FR |
|  NFR6 	|  Security  |  Block login for 1 hour after 5 wrong login | FR2.1 Authenticate user |
|  NFR7 	|  Security  |  All information should be protected against unauthorized access | All FR |
|  NFR8 	|  Safety  |  Items should be placed in suitable space | FR4.9 Stock order into specific position |


# Use case diagram and use cases


## Use case diagram
\<define here UML Use case diagram UCD summarizing all use cases, and their relationships>


\<next describe here each use case in the UCD>
### Use case 1, UC1: Authentication
| Actors Involved        | User |
| ------------ |:-------------:| 
|  Precondition     | User registered (or not) && User not authenticated |
|  Post condition     | User authenticated and authorized || User not authenticated |
|  Nominal Scenario     | User authention is correct, First Login, Logout |
|  Variants     | User authentication is correct and user has to change the password |
|  Exceptions     | User authentication is failed |

##### Scenario 1.1 

| Scenario 1.1 | User athentication is correct |
| ------------- |:-------------:| 
|  Precondition     | User U registered && User U not authenticated |
|  Post condition   | User U authenticated and authorized |
| Step#       	    | Description  |
|  1     | User U wants to access to the system |  
|  2     | The system asks for username and password |
|  3     | The user U insert username and password |
|  4     | The system verifies the credential   |
|  5     | The credentials are valid, the user is authenticated |

##### Scenario 1.2

| Scenario 1.2 | User athentication is correct and user has to change the password|
| ------------- |:-------------:| 
|  Precondition     | User U registered && User U not authenticated |
|  Post condition   | User U authenticated and authorized && user U has a new password |
| Step#       	    | Description  |
|  1     | User U wants to access to the system |  
|  2     | The system asks for username and password |
|  3     | The user U insert username and password |
|  4     | The system verifies the credential   |
|  5     | The credentials are valid, the user is authenticated |
|  6     | The password has expired |
|  7     | The system ask for the new password |
|  8     | The user U insert new password |
|  9     | The password is updated    |

##### Scenario 1.3

| Scenario 1.3 | User athentication is failed |
| ------------- |:-------------:| 
|  Precondition     | User U registered && User U not authenticated |
|  Post condition   | User U not authenticated |
| Step#       	    | Description  |
|  1     | User U wants to access to the system |  
|  2     | The system asks for username and password |
|  3     | The user insert username and password |
|  4     | The system verifies the credential   |
|  5     | The credentials are not valid, the user is not authenticated |

##### Scenario 1.4

| Scenario 1.4 | First Login |
| ------------- |:-------------:| 
|  Precondition     | User U registered && User U without password |
|  Post condition   | User U authenticad && User with new password |
| Step#       	    | Description  |
|  1     | User U wants to access to the system for the first time |  
|  2     | The system asks new password |
|  3     | The user insert new password |
|  5     | New ppassword is inserted in the system && the user is authenticated |

### Use case 2, UC2: Manage users
| Actors Involved        | Administrator, users |
| ------------- |:-------------:| 
|  Precondition     | Administrator is authenticated |
|  Post condition   | User informations are inserted/modified/deleted  |
|  Nominal Scenario     | Create user, Modify user information, Delete user, Show users |
|  Variants     | Admin modifies user info/privileges, Show user - filtered  |
|  Exceptions     | \<exceptions, errors > |

##### Scenario 2.1 

| Scenario 2.1 | Create user |
| ------------- |:-------------:| 
|  Precondition     | Administrator is authenticated && user non registered|
|  Post condition   | New user can insert his/her new password |
| Step#       	    | Description  |
|  1     | The administrator create new account for the user with his/her informations and privileges |  
|  2     | The system send an email to the user for inserting the new password  |

##### Scenario 2.2

| Scenario 2.2 | Administrator modify user informations and/or priviledges |
| ------------- |:-------------:| 
|  Precondition     | Administrator is authenticated |
|  Post condition   | Administrator has modified user informations and/or priviledges |
| Step#       	    | Description  |
|  1     | Admin wants to modify user informations and/or priviledges  |  
|  2     | The system shows user informations  |
|  3     | The admin modify the informations that he/she chooses |

##### Scenario 2.3

| Scenario 2.3 | User modify its informations |
| ------------- |:-------------:| 
|  Precondition     | User U is authenticated |
|  Post condition   | User U has modified his/her informations |
| Step#       	    | Description  |
|  1     | User U wants to modify his/her informations |  
|  2     | The system shows user informations that he/she can modify  |
|  3     | The user U modify the informations that he/she chooses |

##### Scenario 2.4

| Scenario 2.4 |  Delete user |
| ------------- |:-------------:| 
|  Precondition     | administrator is authenticated && user is registered into the system |
|  Post condition   | User is deleted from the system |
| Step#       	    | Description  |
|  1     |  Administrator searches for user U  |  
|  2     | Admin deletes him/her from the system  |
|  3     | The user U modify the informations that he/she chooses |


### Use case 3, UC3: Manage items
| Actors Involved        | Users, item type |
| ------------ |:-------------:| 
|  Precondition     | user is authenticated && item type is not (or is) present in the system |
|  Post condition     | Item type is info are inserted/modified/deleted |
|  Nominal Scenario     | Insert new item type, Modify items information, Delete item, Show items |
|  Variants     |  Modify items information - alarm, Show items - filtered |
|  Exceptions     | Insert new item type - failure, Modify items information - failure, delete item - failure |

##### Scenario 3.1

| Scenario 3.1 |  Insert new item type |
| ------------- |:-------------:| 
|  Precondition     | user is authenticated && item type is not present in the system |
|  Post condition   | Item type is inserted in the system |
| Step#       	    | Description  |
|  1     |  User insert new item type I and its information in the system  |  

##### Scenario 3.2

| Scenario 3.2 |  Insert new item type - failure |
| ------------- |:-------------:| 
|  Precondition     | user is authenticated && item type is present in the system |
|  Post condition   | Item type is not inserted in the system |
| Step#       	    | Description  |
|  1     |  User insert new item type I and its information in the system  |  
|  2     | Item type is already present in the system and the operation is aborted |


##### Scenario 3.3 

| Scenario 3.3 | Moodify item informations |
| ------------- |:-------------:| 
|  Precondition     | user is authenticated && Item is present in the system |
|  Post condition   | Items informations are modified |
| Step#       	    | Description  |
|  1     | user accesses the item informations that he/she can modify |  
|  2     | user modify the informations that he/she chooses  |
|  3     | Items informations are successfully modified |

##### Scenario 3.4

| Scenario 3.4 | Modify items information - failure  |
| ------------- |:-------------:| 
|  Precondition     | user is authenticated && Item is present in the system |
|  Post condition   | Items informations are not modified |
| Step#       	    | Description  |
|  1     | user accesses the item informations that he/she can modify |  
|  2     | user modify the informations that he/she chooses  |
|  3     | Items informations are wrong (quantity <0, NaN, ...) so the operation is aborted |

##### Scenario 3.5

| Scenario 3.5 | Modify items information - alarm  |
| ------------- |:-------------:| 
|  Precondition     | user is authenticated && Item is present in the system |
|  Post condition   | Items informations are not modified && a notification is sent to WH manager |
| Step#       	    | Description  |
|  1     | user accesses the item informations that he/she can modify |  
|  2     | user modify the informations that he/she chooses  |
|  3     | Items informations are below the threashold so the system notifies the WH manager |

##### Scenario 3.6 

| Scenario 3.6 | Delete item |
| ------------- |:-------------:| 
|  Precondition     | Warehouse manager is authenticated && Item is not present in the warehouse |
|  Post condition   | Item is deleted from the system |
| Step#       	    | Description  |
|  1     | Wareghouse manager search for the item to delete  |  
|  2     | Warehouse manager to delete the item  |

##### Scenario 3.7

| Scenario 3.7 | Delete item - failure |
| ------------- |:-------------:| 
|  Precondition     | Warehouse manager is authenticated && Item is present in the warehouse |
|  Post condition   | Item is not deleted from the system |
| Step#       	    | Description  |
|  1     | Wareghouse manager search for the item to delete  |  
|  2     | Warehouse manager try to delete the item  |
|  3     | The system stops the operation because the item is still present in the database |

### Use case 4, UC4: Manage orders to suppliers 
| Actors Involved        | Users, item type, mail service |
| ------------ |:-------------:| 
|  Precondition     | user is authenticated && all item type are present in the system |
|  Post condition     | Order is created/modified/deleted |
|  Nominal Scenario     | Create order, Modify order status into received, delete order, show orders |
|  Variants     |  Modify order status into checked, Modify order status into completed, show orders - filtered |
|  Exceptions     | Modify order status into rejected |

##### Scenario 4.1

| Scenario 4.1 |  Create order |
| ------------- |:-------------:| 
|  Precondition     | WH manager is authenticated && wh manager has received a notification of low quantity for a certain item |
|  Post condition   | A new order to the supplier is created via mail && order status is pending |
| Step#       	    | Description  |
|  1     |  The system show to the WH manager the list of item to be ordered and their information  |  
|  2     |  For each item the WH manager chooses the supplier from item's list  and qauntity to be ordered | 
|  3     | Then WH insert these information in a new order on in existing one if present |
|  4     | When WH manager finishes the order is sent to supplier and the order state is set to pending |

##### Scenario 4.2

| Scenario 4.2 | Modify order status into received |
| ------------- |:-------------:| 
|  Precondition     | WH employee is authenticated && items have arrived in the warehouse && order status is pending |
|  Post condition   | A notification to the QO is sent && order status is received |
| Step#       	    | Description  |
|  1     |  when items arrive in the warehouse, WH employee accesses the order and set its status to received  |  
|  2     |  The system notifies the QO employee | 

##### Scenario 4.3

| Scenario 4.3 | Modify order status into checked |
| ------------- |:-------------:| 
|  Precondition     | QO employee is authenticated && QO employee has received a notification && order status is received  |
|  Post condition   | A notification to the WH employee is sent && order status is checked |
| Step#       	    | Description  |
|  1     |  The QO employee decides if and which items should be tested  |  
|  2     |  For each tested item QO employee search for the item and insert item quality |
|  3     |  All items pass the tests, so the QO employee change order status into checked |
|  4     |  The system sends a notification to warehouse employee |

##### Scenario 4.4

| Scenario 4.4 | Modify order status into rejected |
| ------------- |:-------------:| 
|  Precondition     | QO employee is authenticated && QO employee has received a notification && order status is received |
|  Post condition   | A notification to the WH manager is sent && order status is rejected |
| Step#       	    | Description  |
|  1     |  The QO employee decides if and which items should be tested  |  
|  2     |  For each tested item QO employee search for the item and insert item quality |
|  3     |  Some items don't pass the tests, so the QO employee change order status into rejected |
|  4     |  The system sends a notification to warehouse manager |
|  5     | The warehouse manager start procedure to reject order |

##### Scenario 4.5

| Scenario 4.5 | Modify order status into completed |
| ------------- |:-------------:| 
|  Precondition     | WH employee is authenticated && WH employee has received a notification && order status is checked |
|  Post condition   | A notification to the WH manager is sent && order status is completed |
| Step#       	    | Description  |
|  1     |  The WH emplyee through the mobile device reads items barcode and the system update item quantity  |  
|  2     |  When all the items are placed in the warehouse the WH employee set order status to completed |
|  4     |  The system sends a notification to warehouse manager |

##### Scenario 4.6

| Scenario 4.6 | delete order |
| ------------- |:-------------:| 
|  Precondition     | ?? |
|  Post condition   | ?? |
| Step#       	    | Description  |
|  1     |  ??  |  
|  2     |  ?? |
|  4     | ??  |

### Use case 5, UC5: Manage inventory 
| Actors Involved        | Users, item type, inventory |
| ------------ |:-------------:| 
|  Precondition     | user is authenticated |
|  Post condition     | ?? |
|  Nominal Scenario     | Show inventory |
|  Variants     |  Show inventory - filter |
|  Exceptions     |  |

##### Scenario 5.1

| Scenario 5.1 |  Show inventory |
| ------------- |:-------------:| 
|  Precondition     | user is authenticated |
|  Post condition   | ?? |
| Step#       	    | Description  |
|  1     |  The user ask to look at the inventory map  |  
|  2     |  The system shows him/her the map with all items | 

##### Scenario 5.2

| Scenario 5.2 |  Show inventory -filtered |
| ------------- |:-------------:| 
|  Precondition     | user is authenticated |
|  Post condition   | ?? |
| Step#       	    | Description  |
|  1     |  The user ask to look at the inventory map applying a filter |  
|  2     |  The system shows him/her the map with all requested informations (Available space, sector, group of items) |

### Use case 6, UC6: Internal Order 
| Actors Involved        | OU employee, item type, WH manager, WH employee |
| ------------ |:-------------:| 
|  Precondition     | users are authenticated && items are present in the warehouse |
|  Post condition     | Internal order is created/modified/deleted |
|  Nominal Scenario     | Create internal order, (modify internal order), delete internal order, show internal orders |
|  Variants     | Show internal orders - filtered  |
|  Exceptions     | Create internal order - failure |

##### Scenario 6.1

| Scenario 6.1 |  Create internal order |
| ------------- |:-------------:| 
|  Precondition     | OU employee is authenticated && items are in the warehouse|
|  Post condition   | New internal order is created with status pending && WH employee receives a notification by the system |
| Step#       	    | Description  |
|  1     |  OU employee wants to create a new order  |  
|  2     |  The system shows him/her items that are in the inventory with their quantities | 
|  3     |  The OU employee adds items to the order with quantities |
|  4     |  The operation is terminated with success, the order is created and a notification is sent to WH employee |

##### Scenario 6.2

| Scenario 6.2 |  Delete internal order |
| ------------- |:-------------:| 
|  Precondition     | OU employee is authenticated && the order is present in the system |
|  Post condition   | Internal order is deleted && WH employee/manager receive a notification by the system |
| Step#       	    | Description  |
|  1     |  OU employee wants to delete an order  |  
|  2     |  The system shows him/her orders that are in the system | 
|  3     |  The OU employee deletes the selected orders |
|  4     |  The operation is terminated with success, the order is deleted and a notification is sent to WH employee/manager |

##### Scenario 6.3

| Scenario 6.3 |  Create internal order - failure |
| ------------- |:-------------:| 
|  Precondition     | OU employee is authenticated && items are in the warehouse|
|  Post condition   | -  |
| Step#       	    | Description  |
|  1     |  OU employee wants to create a new order  |  
|  2     |  The system shows him/her items that are in the inventory with their quantities | 
|  3     |  The OU employee adds items to the order with quantities |
|  4     |  The operation is terminated with failure (ex. invalid quantities), the order isn't created |

### Use case 7, UC7: Manage Internal Order 
| Actors Involved        | item type, WH manager, WH employee |
| ------------ |:-------------:| 
|  Precondition     | users are authenticated && items are present in the warehouse && order is in the system|
|  Post condition     |  |
|  Nominal Scenario     | Modidfy order status into (Ready to collect , Collected , Rejected, Cancelled), show internal orders |
|  Variants     | Show internal orders - filtered  |
|  Exceptions     |  Modidfy order status into ??  |

##### Scenario 7.1

| Scenario 7.1 |  Modidfy order status into Ready to collect |
| ------------- |:-------------:| 
|  Precondition     | WH employee is authenticated && items are in the warehouse && order status is pending|
|  Post condition   | Order status is ready to collect && item quantities are modified && OU employee receives a notification |
| Step#       	    | Description  |
|  1     |  WH employee receives a notification for a new pending order  |  
|  2     |  The system shows him/her items that are in the order with their quantities and positions | 
|  3     |  The WH employee collect items of the order and read their barcode with mobile device |
|  4     |  The system updates items quantities |
|  5     |  When all items are collected and the order is prepared WH employee sends to pick up area and set order status as ready to 			  collect |
|  6     | The system sends a notitfication to OU employee |

##### Scenario 7.2

| Scenario 7.2 |  Modidfy order status into collected |
| ------------- |:-------------:| 
|  Precondition     | OU employee E1 is authenticated && order status is ready to collect |
|  Post condition   | Order status is collected |
| Step#       	    | Description  |
|  1     |  OU employee E2 receives a notification for a "ready to collect" order  |  
|  2     |  OU employee E1 identifies E2 and OU employee E2 collect the order from the pick up area | 
|  3     |  OU employee E1 set order status as collected |


# Glossary

\<use UML class diagram to define important terms, or concepts in the domain of the system, and their relationships> 

\<concepts are used consistently all over the document, ex in use cases, requirements etc>

# System Design

![Image](System%20Design.jpg "System Design")

# Deployment Diagram 

![Image](Deployment%20Diagram.jpg "Deployment Diagram")




