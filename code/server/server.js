"use strict";
const morgan = require('morgan');
const express = require("express");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);
const EzWhException = require("./src/EzWhException.js");
const EzWhFacade = require("./src/EzWhFacade");
const { validationResult, param, check, body } = require("express-validator");
const { UserTypes } = require("./src/User");
const facade = new EzWhFacade();

// init express
const app = new express();
const port = 3001;

app.use(express.json());
app.use(morgan('dev'));

// EzWhFacade
//GET /api/test
app.get("/api/create", async (req, res) => {
  try{
    new EzWhFacade();
    return res.status(200).end();
  } catch (err) {
    console.log(err);
    return res.status(500).end();
  }
});


//GET /api/test
app.get("/api/hello", (req, res) => {
  let message = {
    message: "Hello World!",
  };
  return res.status(200).json(message);
});

//GET /api/skus
app.get("/api/skus", async (req, res) => {
  try {
    let skus = await facade.getSKUs();
    skus.map((s) => {return {
        id: s.id,
        description: s.description,
        weight: s.weight,
        volume: s.volume,
        notes: s.notes,
        position: s.position ? s.position.id : s.position,
        availableQuantity: s.availableQuantity,
        price: s.price,
        testDescriptors: s.testDescriptors.map((t) => t.id)
    }});
    return res.status(200).json(skus);
  } catch (err) {
    if (err === EzWhException.InternalError) return res.status(500).end();
  }
});

//GET /api/skus/:id
app.get("/api/skus/:id", param("id").isInt({min : 1}),
	async (req, res) => {
	const validationErrors = validationResult(req);
	if (!validationErrors.isEmpty()) {
		return res.status(422).end();
	}
	try {
		let sku = await facade.getSKUById(req.params.id);
		return res.status(200).json({
            id: sku.id,
            description: sku.description,
            weight: sku.weight,
            volume: sku.volume,
            notes: sku.notes,
            position: sku.position ? sku.position.id : sku.position,
            availableQuantity: sku.availableQuantity,
            price: sku.price,
            testDescriptors: sku.testDescriptors.map((t) => t.id)
        });
	} catch (err) {
		if (err === EzWhException.InternalError)
			return res.status(500).end();
		else if (err === EzWhException.NotFound)
			return res.status(404).end();
	}
});

//POST /api/sku
app.post(
  "/api/sku",
  body("description").exists(),
  body("weight").isFloat({ min: 0 }),
  body("volume").isFloat({ min: 0 }),
  body("notes").exists(),
  body("price").isFloat({ min: 0 }),
  body("availableQuantity").isInt({ min: 0 }),
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(422).end();
    }
    try {
      await facade.createSKU(
        req.body.description,
        req.body.weight,
        req.body.volume,
        req.body.notes,
        req.body.price,
        req.body.availableQuantity
      );
      return res.status(201).end();
    } catch (err) {
      if (err === EzWhException.InternalError) {
        return res.status(503).end();
      }
    }
  }
);

//PUT /api/sku/:id
app.put(
    "/api/sku/:id",
    param("id").isInt({min : 1}),
	body("newDescription").isString(),
	body("newWeight").isFloat({min : 0}),
	body("newVolume").isFloat({min : 0}),
	body("newNotes").isString(),
	body("newPrice").isFloat({min : 0}),
	body("newAvailableQuantity").isInt({min : 0}),
	async (req, res) => {
		const validationErrors = validationResult(req);
		if (!validationErrors.isEmpty()) {
			return res.status(422).end();
		}
		try {
			await facade.modifySKU(req.params.id, req.body.newDescription, req.body.newWeight, req.body.newVolume, req.body.newNotes, req.body.newPrice, req.body.newAvailableQuantity
      );
      return res.status(200).end();
    } catch (err) {
      if (err === EzWhException.PositionFull) {
        //TODO: test when position ready
        return res.status(422).end();
      } else if (err === EzWhException.InternalError) {
        return res.status(503).end();
      }
      else if (err === EzWhException.NotFound) {
          return res.status(404).end();
      }
    }
  }
);

//PUT /api/sku/:id/position
app.put(
    "/api/sku/:id/position",
    param("id").isInt({min : 1}),
	body("position").exists().isString().isNumeric().isLength({ min: 12, max: 12 }),
	async (req, res) => {
		const validationErrors = validationResult(req);
		if (!validationErrors.isEmpty()) {
			return res.status(422).end();
		}
		try {
			await facade.addSKUPosition(req.params.id, req.body.position);
			return res.status(200).end();
		} catch (err) {
			if (err === EzWhException.NotFound)
				return res.status(404).end();
			else if (err === EzWhException.PositionFull)
				return res.status(422).end();
			else if (err === EzWhException.InternalError)
				return res.status(503).end();
		}
});

//DELETE /api/skus/:id
app.delete("/api/skus/:id", param("id").isInt({min : 1}),
	async (req, res) => {
		const validationErrors = validationResult(req);
		if (!validationErrors.isEmpty()) {
			return res.status(422).end();
		}
		try {
			await facade.deleteSKU(req.params.id);
			return res.status(204).end();
		} catch (err) {
			if (err === EzWhException.InternalError)
				return res.status(500).end();
			else if (err === EzWhException.NotFound)
				return res.status(404).end();
		}
});

//GET /api/skuitems
app.get("/api/skuitems", async (req, res) => {
  try {
    let skuitems = await facade.getSKUItems();
    return res.status(200).json(
      skuitems.map((s) => {
        return {
          RFID: s.rfid,
          SKUId: s.sku.id,
          Available: s.available,
          DateOfStock: s.dateOfStock,
        };
      })
    );
  } catch (err) {
    return res.status(500).end();
  }
});

//GET /api/skuitems/sku/:id
app.get("/api/skuitems/sku/:id", param("id").isInt({min : 1}),
	async (req, res) => {
		const validationErrors = validationResult(req);
		if (!validationErrors.isEmpty()) {
			return res.status(422).end();
		}
		try {
			let skuitems = await facade.getSKUItemsBySKU(req.params.id);
			return res.status(200).json(skuitems.map((s) => {
			return {
				RFID: s.rfid,
				SKUId: s.sku.id,
				DateOfStock: s.dateOfStock,
        };
      })
    );
  } catch (err) {
    if (err === EzWhException.NotFound) return res.status(404).end();
    else return res.status(500).end();
  }
});

//GET /api/skuitems/:rfid
app.get("/api/skuitems/:rfid", param("rfid").isNumeric().isLength({min: 32, max: 32}),
	async (req, res) => {
		const validationErrors = validationResult(req);
		if (!validationErrors.isEmpty()) {
			return res.status(422).end();
		}
		try {
			let skuitem = await facade.getSKUItemByRfid(req.params.rfid);
			return res.status(200).json({
				RFID: skuitem.rfid,
				SKUId: skuitem.sku.id,
				Available: skuitem.available,
				DateOfStock: skuitem.dateOfStock,
    });
  } catch (err) {
    if (err === EzWhException.NotFound) {
      return res.status(404).end();
    } else return res.status(500).end();
  }
});

//POST /api/skuitem
app.post(
  "/api/skuitem",
  body("RFID").isNumeric().isLength({min: 32, max: 32}),
  body("SKUId").isInt({ min: 1 }),
  body("DateOfStock").custom((value) => {
    if (value !== null && !dayjs(value, ["YYYY/MM/DD", "YYYY/MM/DD H:m"], true).isValid()) {
      throw new Error("Invalid date");
    }
    return true;
  }),
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(422).end();
    }
    try {
      await facade.createSKUItem(req.body.RFID, req.body.SKUId, req.body.DateOfStock);
      return res.status(201).end();
    } catch (err) {
      if (err === EzWhException.NotFound) return res.status(404).end();
      else if (err === EzWhException.InternalError) return res.status(503).end();
    }
  }
);

//PUT /api/skuitems/:rfid
app.put(
    "/api/skuitems/:rfid",
    param("rfid").isNumeric().isLength({min: 32, max: 32}),
	body("newRFID").exists().isNumeric().isLength({min: 32, max: 32}),
	body("newAvailable").isInt({min : 0, max: 1}),
	body("newDateOfStock").custom((value) => {
		if (value !== null && !dayjs(value, ["YYYY/MM/DD", "YYYY/MM/DD H:m"], true).isValid()) {
      throw new Error("Invalid date");
    }
    return true;
  }),
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(422).end();
    }
    try {
      await facade.modifySKUItem(req.params.rfid, req.body.newRFID, req.body.newAvailable, req.body.newDateOfStock);
      return res.status(200).end();
    } catch (err) {
      if (err === EzWhException.NotFound) return res.status(404).end();
      else return res.status(503).end();
    }
  }
);

//DELETE /api/skuitems/:rfid
app.delete("/api/skuitems/:rfid", param("rfid").isNumeric().isLength({min: 32, max: 32}),
	async (req, res) => {
		const validationErrors = validationResult(req);
		if (!validationErrors.isEmpty()) {
			return res.status(422).end();
		}
		try {
			await facade.deleteSKUItem(req.params.rfid);
			return res.status(204).end();
		} catch (err) {
			return res.status(503).end();
		}
});
//USED ONLY FOR TESTING
app.delete(
    "/api/skuitems/",
    async (req, res) => {
        try {
            await facade.deleteAllSKUItems();
            return res.status(204).end();
        } catch (err) {
            if (err === EzWhException.NotFound) return res.status(404).end();
            else if (err === EzWhException.InternalError) return res.status(503).end();
        }
    }
);

// Test Descriptor
app.get('/api/testDescriptors', async (req, res) => {
  try {
    const testDescriptors = await facade.getTestDescriptors()
    return res.status(200).json(testDescriptors);
  } catch (err) {
    console.log("Error in Server");
    console.log(err);
    return res.status(500).end();
  }
});

app.get('/api/testDescriptors/:id', param('id').isInt({ min: 1 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).end();
      }
      const testDescriptor = await facade.getTestDescriptorByID(req.params.id);
      return res.status(200).json(testDescriptor);
    } catch (err) {
      console.log("Error in Server");
      console.log(err);
      if (err === EzWhException.NotFound) return res.status(404).end();
      else return res.status(500).end();
    }
  });

app.post('/api/testDescriptor', check('name').exists(), check('procedureDescription').exists(),
check('idSKU').isInt({ min: 1 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty() || Object.keys(req.body).length === 0) {
        return res.status(422).end();
      }
      await facade.createTestDescriptor(req.body.name, req.body.procedureDescription,
        req.body.idSKU);
      return res.status(201).end();
    }
    catch (err) {
      console.log("Error in Server");
      console.log(err);
      if (err === EzWhException.NotFound) return res.status(404).end();
      else return res.status(503).end();
    }
  });

app.put('/api/testDescriptor/:id', param('id').isInt({ min: 1 }),
check('newName').exists(), check('newProcedureDescription').exists(),
check('newIdSKU').isInt({ min: 1 }), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty() || Object.keys(req.body).length === 0) {
      return res.status(422).end();
    }
    await facade.modifyTestDescriptor(req.params.id, req.body.newName,
      req.body.newProcedureDescription, req.body.newIdSKU);
    return res.status(200).end();
  }
  catch (err) {
    console.log("Error in Server");
    console.log(err);
    if (err === EzWhException.NotFound) return res.status(404).end();
    else return res.status(503).end();
  }
});

app.delete('/api/testDescriptor/:id', param('id').isInt({ min: 1 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).end();
      }
      await facade.deleteTestDescriptor(req.params.id);
      return res.status(204).end();
    }
    catch (err) {
      console.log("Error in Server");
      console.log(err);
      return res.status(503).end();
    }
  });

// TestResult 
app.get('/api/skuitems/:rfid/testResults', param('rfid').isNumeric().isLength({min: 32, max: 32}),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).end();
      }
      const testResults = await facade.getTestResultsByRFID(req.params.rfid);
      return res.status(200).json(testResults);
    } catch (err) {
      console.log("Error in Server");
      console.log(err);
      if (err === EzWhException.NotFound) return res.status(404).end();
      return res.status(500).end();
    }
  });

app.get('/api/skuitems/:rfid/testResults/:id', param('rfid').isNumeric().isLength({min: 32, max: 32}),
param('id').isInt({ min: 1 }), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).end();
    }
    const testResult = await facade.getTestResultByIDAndRFID(req.params.rfid, req.params.id);
    return res.status(200).json(testResult);
  } catch (err) {
    console.log("Error in Server");
    console.log(err);
    if (err === EzWhException.NotFound) return res.status(404).end();
    else return res.status(500).end();
  }
});

app.post('/api/skuitems/testResult', check('rfid').isNumeric().isLength({min: 32, max: 32}),
check('idTestDescriptor').isInt({ min: 1 }),
check('Date').exists(), check('Result').isBoolean(), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty() || Object.keys(req.body).length === 0 ||
      !dayjs(req.body.Date, ['YYYY/MM/DD', 'YYYY/MM/DD HH:mm'], true).isValid()) {
      return res.status(422).end();
    }
    await facade.addTestResult(req.body.rfid, req.body.idTestDescriptor,
      req.body.Date, req.body.Result);
    return res.status(201).end();
  }
  catch (err) {
    console.log("Error in Server");
    console.log(err);
    if (err === EzWhException.NotFound) return res.status(404).end();
    else return res.status(503).end();
  }
});

app.put('/api/skuitems/:rfid/testResult/:id', param('rfid').isNumeric().isLength({min: 32, max: 32}),
param('id').isInt({ min: 1 }), check('newIdTestDescriptor').isInt({ min: 1 }),
check('newDate').exists(), check('newResult').isBoolean(), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty() || Object.keys(req.body).length === 0 ||
      !dayjs(req.body.newDate, ['YYYY/MM/DD', 'YYYY/MM/DD HH:mm'], true).isValid()) {
      return res.status(422).end();
    }
    await facade.modifyTestResult(req.params.rfid, req.params.id,
      req.body.newIdTestDescriptor, req.body.newDate, req.body.newResult);
    return res.status(200).end();
  }
  catch (err) {
    console.log("Error in Server");
    console.log(err);
    if (err === EzWhException.NotFound) return res.status(404).end();
    else return res.status(503).end();
  }
});

app.delete('/api/skuitems/:rfid/testResult/:id', param('rfid').isNumeric().isLength({min: 32, max: 32}),
param('id').isInt({ min: 1 }), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).end();
    }
    await facade.deleteTestResult(req.params.rfid, req.params.id);
    return res.status(204).end();
  }
  catch (err) {
    console.log("Error in Server");
    console.log(err);
    return res.status(503).end();
  }
});



// User
app.get('/api/userinfo', (req, res) => {  //TODO
  return res.status(500).end();
});

app.get('/api/suppliers', async (req, res) => {
  try {
    const suppliers = await facade.getSuppliers();
    return res.status(200).json(suppliers);
  } catch (err) {
    console.log("Error in Server");
    console.log(err);
    return res.status(500).end();
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await facade.getUsers();
    return res.status(200).json(users);
  } catch (err) {
    console.log("Error in Server");
    console.log(err);
    return res.status(500).end();
  }
});

app.post('/api/newUser',  // TODO
  check('username').isEmail(), check('name').exists(), check('surname').exists(),
  check('password').isLength({ min: 8 }), check('type').exists(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty() || Object.keys(req.body).length === 0
        || !UserTypes.isUserTypes(req.body.type) ||
        req.body.type === UserTypes.MANAGER || req.body.type === UserTypes.ADMINISTRATOR) {
        return res.status(422).end();
      }
      await facade.createUser(req.body.username, req.body.name,
        req.body.surname, req.body.password, req.body.type);
      return res.status(201).end();
    }
    catch (err) {
      console.log("Error in Server");
      console.log(err);
      if (err === EzWhException.Conflict) return res.status(409).end();
      return res.status(503).end();
    }
  });

app.post('/api/managerSessions',
  check('username').isEmail(), check('password').isLength({ min: 8 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty() || Object.keys(req.body).length === 0) {
        return res.status(401).end();
      }
      let user = await facade.login(req.body.username, req.body.password, UserTypes.MANAGER);
      return res.status(200).json(user);
    }
    catch (err) {
      console.log("Error in Server");
      console.log(err);
      if (err === EzWhException.Unauthorized) return res.status(401).end();
      return res.status(500).end();
    }
  });

app.post('/api/customerSessions',
  check('username').isEmail(), check('password').isLength({ min: 8 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty() || Object.keys(req.body).length === 0) {
        return res.status(401).end();
      }
      let user = await facade.login(req.body.username, req.body.password, UserTypes.INTERNAL_CUSTOMER);
      return res.status(200).json(user);
    }
    catch (err) {
      console.log("Error in Server");
      console.log(err);
      if (err === EzWhException.Unauthorized) return res.status(401).end();
      return res.status(500).end();
    }
  });

app.post('/api/supplierSessions',
  check('username').isEmail(), check('password').isLength({ min: 8 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty() || Object.keys(req.body).length === 0) {
        return res.status(401).end();
      }
      let user = await facade.login(req.body.username, req.body.password, UserTypes.SUPPLIER);
      return res.status(200).json(user);
    }
    catch (err) {
      console.log("Error in Server");
      console.log(err);
      if (err === EzWhException.Unauthorized) return res.status(401).end();
      return res.status(500).end();
    }
  });

app.post('/api/clerkSessions',
  check('username').isEmail(), check('password').isLength({ min: 8 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty() || Object.keys(req.body).length === 0) {
        return res.status(401).end();
      }
      let user = await facade.login(req.body.username, req.body.password, UserTypes.CLERK);
      return res.status(200).json(user);
    }
    catch (err) {
      console.log("Error in Server");
      console.log(err);
      if (err === EzWhException.Unauthorized) return res.status(401).end();
      return res.status(500).end();
    }
  });

app.post('/api/qualityEmployeeSessions',
  check('username').isEmail(), check('password').isLength({ min: 8 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty() || Object.keys(req.body).length === 0) {
        return res.status(401).end();
      }
      let user = await facade.login(req.body.username, req.body.password, UserTypes.QUALITY_CHECK_EMPLOYEE);
      return res.status(200).json(user);
    }
    catch (err) {
      console.log("Error in Server");
      console.log(err);
      if (err === EzWhException.Unauthorized) return res.status(401).end();
      return res.status(500).end();
    }
  });

app.post('/api/deliveryEmployeeSessions',
  check('username').isEmail(), check('password').isLength({ min: 8 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty() || Object.keys(req.body).length === 0) {
        return res.status(401).end();
      }
      let user = await facade.login(req.body.username, req.body.password, UserTypes.DELIVERY_EMPLOYEE);
      return res.status(200).json(user);
    }
    catch (err) {
      console.log("Error in Server");
      console.log(err);
      if (err === EzWhException.Unauthorized) return res.status(401).end();
      return res.status(500).end();
    }
  });

app.post('/api/logout', (req, res) => { // TODO
  return res.status(500).end();
});

app.put('/api/users/:username',
  param('username').isEmail(), check('oldType').exists(), check('newType').exists(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty() || Object.keys(req.body).length === 0 ||
        !UserTypes.isUserTypes(req.body.oldType) || !UserTypes.isUserTypes(req.body.newType)
        || req.body.oldType === UserTypes.MANAGER || req.body.oldType === UserTypes.ADMINISTRATOR
        || req.body.newType === UserTypes.MANAGER || req.body.newType === UserTypes.ADMINISTRATOR) {
        return res.status(422).end();
      }
      await facade.modifyUserRights(req.params.username,
        req.body.oldType, req.body.newType);
      return res.status(200).end();
    }
    catch (err) {
      console.log("Error in Server");
      console.log(err);
      if (err === EzWhException.NotFound) return res.status(404).end();
      else return res.status(503).end();
    }
  });

app.delete('/api/users/:username/:type',
  param('username').isEmail(), param('type').exists(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty() || !UserTypes.isUserTypes(req.params.type) ||
        req.params.type === UserTypes.ADMINISTRATOR || req.params.type === UserTypes.MANAGER) {
        return res.status(422).end();
      }
      await facade.deleteUser(req.params.username, req.params.type);
      return res.status(204).end();
    }
    catch (err) {
      console.log("Error in Server");
      console.log(err);
      return res.status(503).end();
    }
  });

/***POSITION***/

//GET /api/positions
app.get("/api/positions", async (req, res) => {
  try {
    const positions = await facade.getPositions();
    return res.status(200).json(positions);
  } catch (err) {
    return res.status(500).end();
  }
});

//GET /api/positions/:id
app.get("/api/positions/:id", param("id").isString().isNumeric().isLength({ min: 12, max: 12 }), async (req, res) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return res.status(422).end();
  }
  try {
    const position = await facade.getPositionByID(req.params.id);
    return res.status(200).json(position);
  } catch (err) {
    if (err === EzWhException.NotFound) return res.status(404).end();
    else res.status(500).end();
  }
});

//POST /api/position
app.post(
  "/api/position",
  body("positionID").exists().isString().isNumeric().isLength({ min: 12, max: 12 }),
  body("aisleID").exists().isString().isNumeric().isLength({ min: 4, max: 4 }),
  body("row").exists().isString().isNumeric().isLength({ min: 4, max: 4 }),
  body("col").exists().isString().isNumeric().isLength({ min: 4, max: 4 }),
  body("maxWeight").exists().isInt(),
  body("maxVolume").exists().isInt(),
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(422).end();
    }
    let id1 = req.body.aisleID.concat(req.body.row, req.body.col);
    let result = req.body.positionID.localeCompare(id1);
    if (result !== 0) {
      return res.status(422).end();
    }

    try {
      await facade.createPosition(
        req.body.positionID,
        req.body.aisleID,
        req.body.row,
        req.body.col,
        req.body.maxWeight,
        req.body.maxVolume
      );
      return res.status(201).end();
    } catch (err) {
      if (err === EzWhException.NotFound) return res.status(404).end();
      else if (err === EzWhException.EntryNotAllowed) return res.status(422).end();
      else if (err === EzWhException.InternalError) return res.status(503).end();
    }
  }
);

//PUT /api/position/:positionID
app.put(
  "/api/position/:positionID",
  param("positionID").isString().isNumeric().isLength({ min: 12, max: 12 }),
  body("newAisleID").isString().isNumeric().isLength({ min: 4, max: 4 }),
  body("newRow").isString().isNumeric().isLength({ min: 4, max: 4 }),
  body("newCol").isString().isNumeric().isLength({ min: 4, max: 4 }),
  body("newMaxWeight").isInt(),
  body("newMaxVolume").isInt(),
  body("newOccupiedWeight").isInt(),
  body("newOccupiedVolume").isInt(),
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(422).end();
    }
    const newPositionID = req.body.newAisleID.concat(req.body.newRow, req.body.newCol);
    try {
      await facade.modifyPosition(
        req.params.positionID,
        newPositionID,
        req.body.newAisleID,
        req.body.newRow,
        req.body.newCol,
        req.body.newOccupiedWeight,
        req.body.newMaxVolume,
        req.body.newOccupiedWeight,
        req.body.newOccupiedVolume
      );
      return res.status(200).end();
    } catch (err) {
      if (err === EzWhException.NotFound) return res.status(404).end();
      else if (err === EzWhException.InternalError) return res.status(503).end();
    }
  }
);

//PUT /api/position/:positionID/changeID
app.put(
  "/api/position/:positionID/changeID",
  param("positionID").isString().isNumeric().isLength({ min: 12, max: 12 }),
  body("newPositionID").isString().isNumeric().isLength({ min: 12, max: 12 }),
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(422).end();
    }
    const newAisleID = req.body.newPositionID.slice(0, 4);
    const newRow = req.body.newPositionID.slice(4, 8);
    const newCol = req.body.newPositionID.slice(8, 12);
    try {
      await facade.modifyPositionID(req.params.positionID, req.body.newPositionID, newAisleID, newRow, newCol);
      return res.status(200).end();
    } catch (err) {
      if (err === EzWhException.NotFound) return res.status(404).end();
      else if (err === EzWhException.InternalError) return res.status(503).end();
    }
  }
);

//DELETE /api/position/:positionID
app.delete(
  "/api/position/:positionID",
  param("positionID").isString().isNumeric().isLength({ min: 12, max: 12 }),
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(422).end();
    }
    try {
      await facade.deletePosition(req.params.positionID);
      return res.status(204).end();
    } catch (err) {
      if (err === EzWhException.NotFound) return res.status(404).end();
      else if (err === EzWhException.InternalError) return res.status(503).end();
    }
  }
);

//USED ONLY FOR TESTING
app.delete(
    "/api/position/",
    async (req, res) => {
        try {
            await facade.deleteAllPositions();
            return res.status(204).end();
        } catch (err) {
            if (err === EzWhException.NotFound) return res.status(404).end();
            else if (err === EzWhException.InternalError) return res.status(503).end();
        }
    }
);

/***ITEMS***/

//GET /api/items
app.get("/api/items", async (req, res) => {
  try {
    const items = await facade.getItems();
    return res.status(200).json(
        items.map((i) => {
            return {
                id: i.id,
                description: i.description,
                price: i.price,
                SKUId: i.skuId,
                supplierId: i.supplierId,
            };
        })
    );
  } catch (err) {
    return res.status(500).end();
  }
});

//GET /api/items/:id
app.get("/api/items/:id", param("id").isInt({ min: 1 }), async (req, res) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return res.status(422).end();
  }
  try {
    const item = await facade.getItemByID(req.params.id);
    return res.status(200).json({
        id: item.id,
        description: item.description,
        price: item.price,
        SKUId: item.skuId,
        supplierId: item.supplierId
    });
  } catch (err) {
    if (err === EzWhException.NotFound) return res.status(404).end();
    else res.status(500).end();
  }
});

//POST /api/item
app.post(
  "/api/item",
  body("id").isInt({ min: 1 }),
  body("description").exists(),
  body("price").isFloat({ min: 0 }),
  body("SKUId").isInt({ min: 1 }),
  body("supplierId").isInt({ min: 1 }),
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(422).end();
    }
    try {
      await facade.createItem(req.body.id, req.body.description, req.body.price, req.body.SKUId, req.body.supplierId);
      return res.status(201).end();
    } catch (err) {
      if (err === EzWhException.NotFound) return res.status(404).end();
      else if (err === EzWhException.EntryNotAllowed) return res.status(422).end();
      else if (err === EzWhException.InternalError) return res.status(503).end();
    }
  }
);

//PUT /api/item/:id
app.put(
  "/api/item/:id",
  param("id").isInt({ min: 1 }),
  body("newDescription").exists(),
  body("newPrice").isFloat({ min: 0 }),
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(422).end();
    }
    try {
      await facade.modifyItem(req.params.id, req.body.newDescription, req.body.newPrice);
      return res.status(200).end();
    } catch (err) {
      if (err === EzWhException.NotFound) return res.status(404).end();
      else if (err === EzWhException.EntryNotAllowed) return res.status(422).end();
      else if (err === EzWhException.InternalError) return res.status(503).end();
    }
  }
);

//DELETE /api/items/:id
app.delete("/api/items/:id", param("id").isInt({ min: 1 }), async (req, res) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return res.status(422).end();
  }
  try {
    await facade.deleteItem(req.params.id);
    return res.status(204).end();
  } catch (err) {
    if (err === EzWhException.NotFound) return res.status(404).end();
    else if (err === EzWhException.InternalError) return res.status(503).end();
  }
});

app.get(
  "/api/restockOrders",
  async (req, res) => {
    try {
      const restockOrders = await facade.getRestockOrders();
      return res.status(200).json(restockOrders);
    } catch (err) {
      console.log(err);
      return res.status(500).end();
    }
  }
);

app.get(
  "/api/restockOrdersIssued",
  async (req, res) => {
    try {
      const restockOrdersIssued = await facade.getRestockOrders("ISSUED");
      return res.status(200).json(restockOrdersIssued);
    } catch (err) {
      return res.status(500).end();
    }
  }
);

app.get(
  "/api/restockOrders/:ID",
  param("ID").isInt({ min: 1 }),
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(422).end();
    }
    try {
      const restockOrder = await facade.getRestockOrderByID(req.params.ID);
      if (restockOrder===undefined)
        return res.status(404).end();
      else
        return res.status(200).json(restockOrder);
    } catch (err) {
      console.log(err);
      if (err === EzWhException.NotFound) return res.status(404).end();
      else return res.status(500).end();
    }
  }
);

app.get(
  "/api/restockOrders/:ID/returnItems",
  param("ID").isInt({ min: 1 }),
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(422).end();
    }
    try {
      const returnItems = await facade.getRestockOrderReturnItems(req.params.ID);
      return res.status(200).json(returnItems);
    } catch (err) {
      console.log(err);
      return res.status(500).end();
    }
  }
);

app.post("/api/restockOrder",
  body("issueDate").isDate(),
  body("products").isArray(),
  body("supplierId").isInt({ min: 1 }),
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(422).end();
    }
    try {
      await facade.createRestockOrder(req.body.issueDate, req.body.products, req.body.supplierId);
      return res.status(201).end();
    } catch (err) {
      console.log(err);
      if (err === EzWhException.EntryNotAllowed) return res.status(422).end();
      else return res.status(503).end();
    }
  }
);

app.put("/api/restockOrder/:ID",
  param("ID").isInt({ min:1 }),
  body("newState").isString(),
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(422).end();
    }
    try {
      // console.log(req.params.ID);
      await facade.modifyRestockOrderState(req.params.ID, req.body.newState);
      return res.status(200).end();
    } catch (err) {
      console.log(err);
      if (err === EzWhException.NotFound) return res.status(404).end();
      else return res.status(503).end();
    }
});

app.put("/api/restockOrder/:ID/skuItems",
  param("ID").isInt({ min:1 }),
  body("skuItems").isArray(),
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(422).end();
    }
    try {
      // console.log(req.body);
      await facade.addSkuItemsToRestockOrder(req.params.ID, req.body.skuItems)
      return res.status(200).end();
    } catch (err) {
      console.log(err);
      if (err === EzWhException.NotFound) return res.status(404).end();
      else if (err === EzWhException.EntryNotAllowed) return res.status(422).end();
      else return res.status(503).end();
    }
});

app.put("/api/restockOrder/:ID/transportNote",
  body("transportNote").exists(),
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(422).end();
    }
    try {
      await facade.addTransportNoteToRestockOrder(req.params.ID, req.body.transportNote);
      return res.status(200).end();
    } catch (err) {
      console.log(err);
      if (err === EzWhException.NotFound) return res.status(404).end();
      else if (err === EzWhException.EntryNotAllowed) return res.status(422).end();
      else return res.status(503).end();
    }
});

app.delete(
  "/api/restockOrder/:ID",
  param("ID").isInt({ min: 1 }),
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(422).end();
    }
    try {
      await facade.deleteRestockOrder(req.params.ID);
      return res.status(204).end();
    } catch (err) {
      console.log(err);
      return res.status(503).end();
    }
  }
);

app.post(
  "/api/returnOrder",
  body("returnDate").isDate(),
  body("products").isArray(),
  body("restockOrderId").isInt({ min: 1 }),
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(422).end();
    }
    try{
      await facade.createReturnOrder(req.body.returnDate, req.body.products, req.body.restockOrderId)
      return res.status(201).end();
    } catch (err) {
      console.log(err);
      if (err === EzWhException.NotFound) return res.status(404).end();
      else return res.status(503).end();
    }
});

app.get(
  "/api/returnOrders",
  async (req, res) => {
    try{
      const returnOrders = await facade.getReturnOrders();
      return res.status(200).json(returnOrders);
    } catch (err) {
      console.log(err);
      return res.status(500).end();
    }
});

app.get("/api/returnOrders/:ID", param("ID"), async (req, res) => {
  try {
    const returnOrder = await facade.getReturnOrderByID(req.params.ID);
    return res.status(200).json(returnOrder);
  } catch (err) {
    console.log(err);
    return res.status(500).end();
  }
});

app.delete(
  "/api/returnOrder/:ID",
  param("ID").isInt({ min: 1 }),
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(422).end();
    }
    try {
      await facade.deleteReturnOrder(req.params.ID);
      return res.status(204).end();
    } catch (err) {
      console.log(err);
      return res.status(503).end();
    }
  }
);

app.post("/api/internalOrders",
  body("issueDate").isDate(),
  body("products").isArray(),
  body("customerId").isInt({ min: 1 }),
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(422).end();
    }
    try {
      // console.log(req.body)
      await facade.createInternalOrder(req.body.issueDate, req.body.products, req.body.customerId);
      return res.status(201).end();
    } catch (err) {
      console.log(err);
      return res.status(503).end();
    }
});

app.get("/api/internalOrders",
  async (req, res) => {
    try{
      const internalOrders = await facade.getInternalOrders();
      return res.status(201).json(internalOrders);
    } catch (err) {
      console.log(err);
      return res.status(500).end();
    }
});

app.get("/api/internalOrdersIssued",
  async (req, res) => {
    try{
      const internalOrders = await facade.getInternalOrdersIssued();
      return res.status(201).json(internalOrders);
    } catch (err) {
      console.log(err);
      return res.status(500).end();
    }
});

app.get("/api/internalOrdersAccepted",
  async (req, res) => {
    try{
      const internalOrders = await facade.getInternalOrdersAccepted();
      return res.status(201).json(internalOrders);
    } catch (err) {
      console.log(err);
      return res.status(500).end();
    }
});

app.get("/api/internalOrders/:ID", param("ID"), async (req, res) => {
  try {
    const internalOrder = await facade.getInternalOrderByID(req.params.ID);
    if (internalOrder===undefined)
      return res.status(404).end();
    else
      return res.status(200).json(internalOrder);
  } catch (err) {
    console.log(err);
    return res.status(500).end();
  }
});

app.put("/api/internalOrders/:ID",
  param("ID"),
  async (req, res) => {
  try {
    const internalOrder = await facade.modifyInternalOrder(req.params.ID, req.body.newState, req.body.products);
    if (internalOrder===undefined)
      return res.status(404).end();
    else
      return res.status(200).end();
  } catch (err) {
    console.log(err);
    return res.status(500).end();
  }
});

app.delete(
  "/api/InternalOrders/:ID",
  param("ID").isInt({ min: 1 }),
  async (req, res) => {
    try {
      await facade.deleteInternalOrder(req.params.ID);
      return res.status(204).end();
    } catch (err) {
      console.log(err);
      return res.status(503).end();
    }
  }
);

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

module.exports = app;
