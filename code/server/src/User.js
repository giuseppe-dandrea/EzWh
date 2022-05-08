class User {
    constructor(id, name, surname, email, type, password) {
        this.id=id;
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.type = type;
        this.password = this.password; // NOT IN CLEAR!!!!
    }

    setPassword(password) {
        this.password = password; // NOT IN CLEAR!!!!
    }
}


// MAP??
const UserTypes = {
    ADMINISTRATOR: 0,
    MANAGER: 1,
    CLERK: 2,
    DELIVERY_EMPLOYEE: 3,
    QUALITY_CHECK_EMPLOYEE: 4,
    INTERNAL_CUSTOMER: 5,
    SUPPLIER: 6
}

const getUserTypesByID = (id) => {
    switch(id) {
        case 0:
            return "Administrator";
        case 1:
            return "Manager";
        case 2:
            return "Clerk";
        case 3:
            return "Delivery employee";
        case 4:
            return "Quality check employee";
        case 5:
            return "Internal customer";
        case 6:
            return "Supplier";
        default:
            //exception ???
    }
}

const getUserTypesByString = (userType) => {
    switch(userType) {
        case "Administrator":
            return 0;
        case "Manager":
            return 1;
        case "Clerk":
            return 2;
        case "Delivery employee":
            return 3;
        case "Quality check employee":
            return 4;
        case "Internal customer":
            return 5;
        case "Supplier":
            return 6;
        default:
            //exception ???
    }
}

module.exports = {User, UserTypes, getUserTypesByID, getUserTypesByString};