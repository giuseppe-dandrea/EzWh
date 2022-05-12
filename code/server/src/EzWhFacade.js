const DbHelper = require("./DbHelper.js");
const EzWhException = require("./EzWhException.js");
const { User } = require("./User");

class EzWhFacade {
  constructor() {
    this.db = new DbHelper("./dev.db");
    this.db.createTables();
  }

  //TestDescriptor
  async getTestDescriptors() {
    try {
      let TestDescriptorList = await this.db.getTestDescriptors();
      return TestDescriptorList.map((td) => {
        return {
          id: td.id,
          name: td.name,
          procedureDescription: td.procedureDescription,
          idSKU: td.idSKU,
        };
      });
    } catch (err) {
      throw EzWhException.InternalError;
    }
  }

  async getTestDescriptorByID(id) {
    try {
      let TestDescriptorList = await this.db.getTestDescriptors();
      let td = TestDescriptorList.filter((testD) => testD.id == id);
      if (td == undefined) throw EzWhException.NotFound;
      return {
        id: td.id,
        name: td.name,
        procedureDescription: td.procedureDescription,
        idSKU: td.idSKU,
      };
    } catch (err) {
      throw EzWhException.InternalError;
    }
  }

  async createTestDescriptor(name, procedureDescription, idSKU) {
    try {
      // check idSKU exists (throw EzWhException.NotFound)
      await this.db.createTestDescriptor(name, procedureDescription, idSKU);
    } catch (err) {
      throw EzWhException.InternalError;
    }
  }

  async modifyTestDescriptor(id, newName, newProcedureDescription, newIdSKU) {
    try {
      let td = this.getTestDescriptorByID(id);
      if (td == undefined) throw EzWhException.NotFound;
      td.name = newName;
      td.procedureDescription = newProcedureDescription;
      td.idSKU = newIdSKU;
      await this.db.modifyTestDescriptor(td);
    } catch (err) {
      if (err == EzWhException.NotFound) throw err;
      throw EzWhException.InternalError;
    }
  }

  async deleteTestDescriptor(id) {
    try {
      await this.db.deleteTestDescriptor(id);
    } catch (err) {
      throw EzWhException.InternalError;
    }
  }

  // TestResult
  async getTestResultsByRFID(RFID) {
    try {
      //check SKUItem  throw EzWhexception.NotFound
      let TestResultList = await this.db.getTestResultsByRFID(RFID);
      if (TestResultList == undefined) throw EzWhException.NotFound;
      else
        return TestResultList.map((tr) => {
          return {
            id: tr.TestResultID,
            idTestDescriptor: tr.TestDescriptorID,
            Date: tr.date,
            Result: tr.result,
          };
        });
    } catch (err) {
      throw EzWhException.InternalError;
    }
  }

  async getTestResultByIDAndRFID(RFID, id) {
    try {
      //check SKUItem  throw EzWhexception.NotFound
      let td = await this.db.getTestResultByIDAndRFID(RFID, id);
      if (td == undefined) throw EzWhException.NotFound;
      else
        return {
          id: tr.TestResultID,
          idTestDescriptor: tr.TestDescriptorID,
          Date: tr.date,
          Result: tr.result,
        };
    } catch (err) {
      throw EzWhException.InternalError;
    }
  }

  async addTestResult(RFID, idTestDescriptor, date, result) {
    try {
      // check RFID exists (throw EzWhException.NotFound)
      let tr = this.getTestDescriptorByID(idTestDescriptor);
      if (tr == undefined) throw EzWhException.NotFound;
      await this.db.addTestResult(RFID, idTestDescriptor, date, result);
    } catch (err) {
      if (err == EzWhException.NotFound) throw err;
      throw EzWhException.InternalError;
    }
  }

  async modifyTestResult(RFID, id, newIdTestDescriptor, newDate, newResult) {
    try {
      //check RFID exists
      let td = this.getTestDescriptorByID(newIdTestDescriptor);
      if (td == undefined) throw EzWhException.NotFound;
      let tr = this.getTestResultByIDAndRFID(RFID, id);
      if (tr == undefined) throw EzWhException.NotFound;
      tr.idTestDescriptor = newIdTestDescriptor;
      tr.date = newDate;
      tr.result = newResult;
      await this.db.modifyTestResult(tr);
    } catch (err) {
      if (err == EzWhException.NotFound) throw err;
      throw EzWhException.InternalError;
    }
  }

  async deleteTestResult(RFID, id) {
    try {
      await this.db.deleteTestResult(RFID, id);
    } catch (err) {
      throw EzWhException.InternalError;
    }
  }

  // User
  getUserInfo(id) {} // TO DO

  async getSuppliers() {
    try {
      let suppliers = await this.db.getSuppliers();
      return suppliers.map((s) => {
        return {
          id: s.id,
          name: s.name,
          surname: s.surname,
          email: s.email,
        };
      });
    } catch (err) {
      throw EzWhException.InternalError;
    }
  }

  async getUsers() {
    try {
      let users = await this.db.getUsers();
      return users.map((u) => {
        return {
          id: u.id,
          name: u.name,
          surname: u.surname,
          email: u.email,
          type: u.type,
        };
      });
    } catch (err) {
      throw EzWhException.InternalError;
    }
  }

  async createUser(email, name, surname, password, type) {
    try {
      await this.db.createUser(
        email,
        name,
        surname,
        User.storePassword(password),
        type
      );
    } catch (err) {
      throw EzWhException.InternalError;
    }
  }

  async login(email, password, type) {
    try {
      let u = await this.db.getUserByEmail(email, type);
      if (u == undefined) throw EzWhException.Unauthorized;
      else {
        if (u.verifyPassword(password))
          return {
            id: u.id,
            name: u.name,
            surname: u.surname,
          };
        else throw EzWhException.Unauthorized;
      }
    } catch (err) {
      throw EzWhException.InternalError;
    }
  }

  logout(id) {} // TO DO

  async modifyUserRights(email, oldType, newType) {
    try {
      let u = await this.db.getUserByEmail(email, oldType);
      if (u == undefined) throw EzWhException.NotFound;
      await this.db.modifyUserRights(email, oldType, newType);
    } catch (err) {
      throw EzWhException.InternalError;
    }
  }

  async deleteUser(email, type) {
    try {
      await this.db.deleteUser(email, type);
    } catch (err) {
      throw EzWhException.InternalError;
    }
  }

  async getUserByEmail(email, type) {
    try {
      let u = await this.db.getUserByEmail(email, type);
      return {
        id: u.id,
        name: u.name,
        surname: u.surname,
      };
    } catch (err) {
      throw EzWhException.InternalError;
    }
  }
}

module.exports = EzWhFacade;
