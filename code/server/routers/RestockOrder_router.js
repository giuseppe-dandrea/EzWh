const express = require("express");
const { validationResult, param, body } = require("express-validator");
const EzWhException = require("./modules/EzWhException.js");

const router = express.Router();

router.get(
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

router.get(
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

router.get(
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

router.get(
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

router.post("/api/restockOrder",
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

router.put("/api/restockOrder/:ID",
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

router.put("/api/restockOrder/:ID/skuItems",
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

router.put("/api/restockOrder/:ID/transportNote",
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

router.delete(
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

module.exports = router;