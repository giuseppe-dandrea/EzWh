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

const UserTypes = {
    ADMINISTRATOR: 0,
    MANAGER: 1,
    CLERK: 2,
    DELIVERY_EMPLOYEE: 3,
    QUALITY_CHECK_EMPLOYEE: 4,
    INTERNAL_CUSTOMER: 5,
    SUPPLIER: 6
}

const getUserTypes = (id) => {
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

module.exports = {User, UserTypes, getUserTypes};