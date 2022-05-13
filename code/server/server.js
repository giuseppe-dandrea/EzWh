"use strict";
const express = require("express");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);
const EzWhException = require("./src/EzWhException.js");
const EzWhFacade = require("./src/EzWhFacade");
const { validationResult, param, check, type, body } = require("express-validator");
const { UserTypes, User } = require("./src/User");
const facade = new EzWhFacade();

// init express
const app = new express();
const port = 3001;

app.use(express.json());


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
    for (let s of skus) {
      if (s.position) s.position = s.position.id;
      s.testDescriptors = s.testDescriptors.map((t) => t.id);
    }
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
		if (sku.position)
			sku.position = sku.position.id;
		sku.testDescriptors = sku.testDescriptors.map((t) => t.id);
		return res.status(200).json(sku);
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
	body("newDescription").exists(),
	body("newWeight").isFloat({min : 0}),
	body("newVolume").isFloat({min : 0}),
	body("newNotes").exists(),
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
    }
  }
);

//PUT /api/sku/:id/position
app.put(
    "/api/sku/:id/position",
    param("id").isInt({min : 1}),
	body("position").exists(),
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
app.get("/api/skuitems/:rfid", param("rfid").exists(),
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
  body("RFID").exists(),
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
    param("rfid").exists(),
	body("newRFID").exists(),
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
app.delete("/api/skuitems/:rfid", param("rfid").exists(),
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

// Test Descriptor
app.get("/api/testDescriptors", (req, res) => {
  try {
    const testDescriptors = facade.getTestDescriptors();
    return res.status(200).json(testDescriptors);
  } catch (err) {
    return res.status(500).end();
  }
});

app.get("/api/testDescriptors/:id", [param("id").isInt({ min: 1 })], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).end();
    }
    const testDescriptor = facade.getTestDescriptorByID(req.params.id);
    return res.status(200).json(testDescriptor);
  } catch (err) {
    if (err === EzWhException.NotFound) return res.status(404);
    else return res.status(500).end();
  }
});

app.post(
  "/api/testDescriptor",
  [check("name"), check("procedureDescription"), check("idSKU").isInt({ min: 1 })],
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty() || Object.keys(req.body) != 3) {
        return res.status(422).end();
      }
      facade.createTestDescriptor(req.body.name, req.body.procedureDescription, req.body.idSKU);
      return res.status(201).end();
    } catch (err) {
      if (err === EzWhException.NotFound) return res.status(404).end();
      else return res.status(503).end();
    }
  }
);

app.put(
  "/api/testDescriptor/:id",
  [
    param("id").isInt({ min: 1 }),
    check("newName"),
    check("newProceudreDescription"),
    check("newIdSKU").isInt({ min: 1 }),
  ],
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty() || Object.keys(req.body) != 3) {
        return res.status(422).end();
      }
      facade.modifyTestDescriptor(req.params.id, req.body.newName, req.body.newProceudreDescription, req.body.newIdSKU);
      return res.status(200).end();
    } catch (err) {
      if (err == EzWhException.NotFound) return res.status(404).end();
      else return res.status(503).end();
    }
  }
);

app.delete("/api/testDescriptor/:id", [param("id").isInt({ min: 1 })], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).end();
    }
    facade.deleteTestDescriptor(req.params.id);
    return res.status(204).end();
  } catch (err) {
    return res.status(503).end();
  }
});

// TestResult
app.get("/api/skuitems/:rfid/testResults", [param("rfid").isLength({ min: 32, max: 32 })], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).end();
    }
    const testResults = facade.getTestResultsByRFID(req.param.rfid);
    return res.status(200).json(testResults);
  } catch (err) {
    if (err == EzWhException.NotFound) return res.status(404).end();
    return res.status(500).end();
  }
});

app.get(
  "/api/skuitems/:rfid/testResults/:id",
  [param("rfid").isLength({ min: 32, max: 32 }), param("id").isInt({ min: 1 })],
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).end();
      }
      const testResult = facade.getTestResultByIDAndRFID(req.params.rfid, req.params.id);
      return res.status(200).json(testDescriptor);
    } catch (err) {
      if (err === EzWhException.NotFound) return res.status(404).end();
      else return res.status(500).end();
    }
  }
);

app.post(
  "/api/skuitems/testResult",
  [
    check("rfid").isLength({ min: 32, max: 32 }),
    check("idTestDescriptor").isInt({ min: 1 }),
    check("Date"),
    check("Result").isBoolean(),
  ],
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (
        !errors.isEmpty() ||
        Object.keys(req.body) != 4 ||
        !dayjs(req.body.Date, ["YYYY/MM/DD", "YYYY/MM/DD HH:mm"], true).isValid()
      ) {
        return res.status(422).end();
      }
      facade.addTestResult(req.params.rfid, req.body.idTestDescriptor, req.body.Date, req.body.Result);
      return res.status(201).end();
    } catch (err) {
      if (err === EzWhException.NotFound) return res.status(404).end();
      else return res.status(503).end();
    }
  }
);

app.put(
  "/api/skuitems/:rfid/testResult/:id",
  [
    param("rfid").isLength({ min: 32, max: 32 }),
    param("id").isInt({ min: 1 }),
    check("newIdTestDescriptor").isInt({ min: 1 }),
    check("newDate"),
    check("newResult").isBoolean(),
  ],
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (
        !errors.isEmpty() ||
        Object.keys(req.body) != 3 ||
        !dayjs(req.body.newDate, ["YYYY/MM/DD", "YYYY/MM/DD HH:mm"], true).isValid()
      ) {
        return res.status(422).end();
      }
      facade.modifyTestResult(
        req.params.rfid,
        req.params.id,
        req.body.newTestDescriptor,
        req.body.newDate,
        req.body.newResult
      );
      return res.status(200).end();
    } catch (err) {
      if (err == EzWhException.NotFound) return res.status(404).end();
      else return res.status(503).end();
    }
  }
);

app.delete(
  "/api/skuitems/:rfid/testResult/:id",
  [param("rfid").isLength({ min: 32, max: 32 }), param("id").isInt({ min: 1 })],
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).end();
      }
      facade.deleteTestResult(req.params.rfid, req.params.id);
      return res.status(204).end();
    } catch (err) {
      return res.status(503).end();
    }
  }
);

// User
app.get("/api/userinfo", (req, res) => {}); // TO DO

app.get("/api/suppliers", (req, res) => {
  try {
    const suppliers = facade.getSuppliers();
    return res.status(200).json(suppliers);
  } catch (err) {
    return res.status(500).end();
  }
});

app.get("/api/users", (req, res) => {
  try {
    const users = facade.getUsers();
    return res.status(200).json(users);
  } catch (err) {
    return res.status(500).end();
  }
});

app.post(
  "/api/newUser",
  [check("username").isEmail(), check("name"), check("surname"), check("password").isLength({ min: 8 }), check(type)],
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (
        !errors.isEmpty() ||
        Object.keys(req.body) != 5 ||
        !UserTypes.isUserTypes(req.body.type) ||
        req.body.type == UserTypes.MANAGER ||
        req.body.type == UserTypes.ADMINISTRATOR
      ) {
        return res.status(422).end();
      }
      if (facade.getUserByEmail(req.body.username, req.body.type) != undefined) return res.status(409).end();
      facade.createUser(req.body.username, req.body.name, req.body.surname, req.body.password, req.body.type);
      return res.status(201).end();
    } catch (err) {
      return res.status(503).end();
    }
  }
);

app.post("/api/managerSessions", [check("username").isEmail(), check("password").isLength({ min: 4 })], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty() || Object.keys(req.body) != 2) {
      return res.status(401).end();
    }
    let user = facade.login(req.body.username, req.body.password, UserTypes.MANAGER);
    return res.status(201).json(user);
  } catch (err) {
    return res.status(500).end();
  }
});

app.post("/api/customerSessions", [check("username").isEmail(), check("password").isLength({ min: 4 })], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty() || Object.keys(req.body) != 2) {
      return res.status(401).end();
    }
    let user = facade.login(req.body.username, req.body.password, UserTypes.INTERNAL_CUSTOMER);
    return res.status(201).json(user);
  } catch (err) {
    return res.status(500).end();
  }
});

app.post("/api/supplierSessions", [check("username").isEmail(), check("password").isLength({ min: 4 })], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty() || Object.keys(req.body) != 2) {
      return res.status(401).end();
    }
    let user = facade.login(req.body.username, req.body.password, UserTypes.SUPPLIER);
    return res.status(201).json(user);
  } catch (err) {
    return res.status(500).end();
  }
});

app.post("/api/clerkSessions", [check("username").isEmail(), check("password").isLength({ min: 4 })], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty() || Object.keys(req.body) != 2) {
      return res.status(401).end();
    }
    let user = facade.login(req.body.username, req.body.password, UserTypes.CLERK);
    return res.status(201).json(user);
  } catch (err) {
    return res.status(500).end();
  }
});

app.post(
  "/api/qualityEmployeeSessions",
  [check("username").isEmail(), check("password").isLength({ min: 4 })],
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty() || Object.keys(req.body) != 2) {
        return res.status(401).end();
      }
      let user = facade.login(req.body.username, req.body.password, UserTypes.QUALITY_CHECK_EMPLOYEE);
      return res.status(201).json(user);
    } catch (err) {
      return res.status(500).end();
    }
  }
);

app.post(
  "/api/deliveryEmployeeSessions",
  [check("username").isEmail(), check("password").isLength({ min: 4 })],
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty() || Object.keys(req.body) != 2) {
        return res.status(401).end();
      }
      let user = facade.login(req.body.username, req.body.password, UserTypes.DELIVERY_EMPLOYEE);
      return res.status(201).json(user);
    } catch (err) {
      return res.status(500).end();
    }
  }
);

app.post("/api/logout", (req, res) => {
  return res.status(200).end();
});

app.put("/api/users/:username", [param("username").isEmail(), check("oldType"), check("newType")], (req, res) => {
  try {
    const errors = validationResult(req);
    if (
      !errors.isEmpty() ||
      Object.keys(req.body) != 2 ||
      !UserTypes.isUserTypes(req.body.oldType) ||
      !UserTypes.isUserTypes(req.body.newType) ||
      req.body.oldType == UserTypes.MANAGER ||
      req.body.newDate == UserTypes.ADMINISTRATOR
    ) {
      return res.status(422).end();
    }
    facade.modifyUserRights(req.params.username, req.body.oldType, req.body.newType);
    return res.status(200).end();
  } catch (err) {
    if (err == EzWhException.NotFound) return res.status(404);
    else return res.status(503).end();
  }
});

app.delete("/api/users/:username/:type", [param("username").isEmail(), param("type")], (req, res) => {
  try {
    const errors = validationResult(req);
    if (
      !errors.isEmpty() ||
      !UserTypes.isUserTypes(req.params.type) ||
      req.params.type == UserTypes.ADMINISTRATOR ||
      req.params.type == UserTypes.MANAGER
    ) {
      return res.status(422).end();
    }
    facade.deleteUser(req.params.username, req.params.type);
    return res.status(204).end();
  } catch (err) {
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
    return res.status(200).json(position[0]);
  } catch (err) {
    if (err === EzWhException.NotFound) return res.status(404).end();
    else res.status(500).end();
  }
});

//POST /api/position
app.post(
  "/api/position",
  body("positionID").isString().isNumeric().isLength({ min: 12, max: 12 }),
  body("aisleID").isString().isNumeric().isLength({ min: 4, max: 4 }),
  body("row").isString().isNumeric().isLength({ min: 4, max: 4 }),
  body("col").isString().isNumeric().isLength({ min: 4, max: 4 }),
  body("maxWeight").isInt(),
  body("maxVolume").isInt(),
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

/***ITEMS***/

//GET /api/items
app.get("/api/items", async (req, res) => {
  try {
    const items = await facade.getItems();
    return res.status(200).json(items);
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
    return res.status(200).json(item[0]);
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

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

module.exports = app;
