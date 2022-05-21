const express = require("express");
const { validationResult, param, body } = require("express-validator");
const EzWhException = require("./modules/EzWhException.js");

const router = express.Router();

router.post(
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

router.get(
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

router.get("/api/returnOrders/:ID", param("ID"), async (req, res) => {
  try {
    const returnOrder = await facade.getReturnOrderByID(req.params.ID);
    return res.status(200).json(returnOrder);
  } catch (err) {
    console.log(err);
    return res.status(500).end();
  }
});

router.delete(
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

module.exports = router;