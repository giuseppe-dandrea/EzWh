"use strict";
const express = require("express");
const { body, param, validationResult } = require('express-validator');
const EzWhFacade = require("./src/EzWhFacade.js");
const dayjs = require("dayjs");
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);
const EzWhException = require("./src/EzWhException.js");
const facade = new EzWhFacade();

// init express
const app = new express();
const port = 3001;

app.use(express.json());

// middleware to strip the first colon from :param
const stripColonFromParam = (param) => {
	return (req, res, next) => {
		if (req.params[param] && req.params[param][0] === ":") {
			req.params[param] = req.params[param].substring(1);
		}
		next();
	}
}

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
			if (s.position)
				s.position = s.position.id;
			s.testDescriptors = s.testDescriptors.map((t) => t.id);
		}
		return res.status(200).json(skus);
	} catch (err) {
		if (err === EzWhException.InternalError)
			return res.status(500).end();
	}
});

//GET /api/skus/:id
app.get("/api/skus/:id",
	stripColonFromParam("id"),
	param("id").isInt({min : 1}),
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
app.post("/api/sku",
	body("description").exists(),
	body("weight").isFloat({min : 0}),
	body("volume").isFloat({min : 0}),
	body("notes").exists(),
	body("price").isFloat({min : 0}),
	body("availableQuantity").isInt({min : 0}),
	async (req, res) => {
	const validationErrors = validationResult(req);
	if (!validationErrors.isEmpty()) {
		return res.status(422).end();
	}
	try {
		await facade.createSKU(req.body.description, req.body.weight, req.body.volume, req.body.notes, req.body.price, req.body.availableQuantity);
		return res.status(201).end();
	} catch (err) {
		if (err === EzWhException.InternalError) {
			return res.status(503).end();
		}
	}
});

//PUT /api/sku/:id
app.put("/api/sku/:id",
	stripColonFromParam("id"),
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
			await facade.modifySKU(req.params.id, req.body.newDescription, req.body.newWeight, req.body.newVolume, req.body.newNotes, req.body.newPrice, req.body.newAvailableQuantity);
			return res.status(200).end();
		} catch (err) {
			if (err === EzWhException.PositionFull) {
				//TODO: test when position ready
				return res.status(422).end();
			} else if (err === EzWhException.InternalError) {
				return res.status(503).end();
			}
		}
});

//PUT /api/sku/:id/position
app.put("/api/sku/:id/position",
	stripColonFromParam("id"),
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
app.delete("/api/skus/:id",
	stripColonFromParam("id"),
	param("id").isInt({min : 1}),
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
		return res.status(200).json(skuitems.map((s) => {
			return {
				RFID: s.rfid,
				SKUId: s.sku.id,
				Available: s.available,
				DateOfStock: s.dateOfStock
			}
		}));
	} catch (err) {
		return res.status(500).end();
	}
});

//GET /api/skuitems/sku/:id
app.get("/api/skuitems/sku/:id",
	stripColonFromParam("id"),
	param("id").isInt({min : 1}),
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
				DateOfStock: s.dateOfStock
			}
		}));
		} catch (err) {
			if (err === EzWhException.NotFound)
				return res.status(404).end();
			else
				return res.status(500).end();
		}
});

//GET /api/skuitems/:rfid
app.get("/api/skuitems/:rfid",
	stripColonFromParam("rfid"),
	param("rfid").exists(),
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
				DateOfStock: skuitem.dateOfStock
			});
		} catch (err) {
			if (err === EzWhException.NotFound) {
				return res.status(404).end();
			} else
				return res.status(500).end();
		}
});

//POST /api/skuitem
app.post("/api/skuitem",
	body("RFID").exists(),
	body("SKUId").isInt({min : 1}),
	body("DateOfStock").custom((value) => {
		if (value !== null && !dayjs(value, ['YYYY/MM/DD', 'YYYY/MM/DD H:m'], true).isValid()) {
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
			if (err === EzWhException.NotFound)
				return res.status(404).end();
			else if (err === EzWhException.InternalError)
				return res.status(503).end();
		}
});

//PUT /api/skuitems/:rfid
app.put("/api/skuitems/:rfid",
	stripColonFromParam("rfid"),
	param("rfid").exists(),
	body("newRFID").exists(),
	body("newAvailable").isInt({min : 0, max: 1}),
	body("newDateOfStock").custom((value) => {
		if (value !== null && !dayjs(value, ['YYYY/MM/DD', 'YYYY/MM/DD H:m'], true).isValid()) {
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
			if (err === EzWhException.NotFound)
				return res.status(404).end();
			else
				return res.status(503).end();
		}
});

//DELETE /api/skuitems/:rfid
app.delete("/api/skuitems/:rfid",
	stripColonFromParam("rfid"),
	param("rfid").exists(),
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

// activate the server
app.listen(port, () => {
	console.log(`Server listening at http://localhost:${port}`);
});

module.exports = app;
