const express = require("express");
const { validationResult, param, body } = require("express-validator");

const router = express.Router();

router.post("/internalOrders",
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

router.get("/internalOrders",
  async (req, res) => {
    try{
      const internalOrders = await facade.getInternalOrders();
      return res.status(201).json(internalOrders);
    } catch (err) {
      console.log(err);
      return res.status(500).end();
    }
});

router.get("/internalOrdersIssued",
  async (req, res) => {
    try{
      const internalOrders = await facade.getInternalOrdersIssued();
      return res.status(201).json(internalOrders);
    } catch (err) {
      console.log(err);
      return res.status(500).end();
    }
});

router.get("/internalOrdersAccepted",
  async (req, res) => {
    try{
      const internalOrders = await facade.getInternalOrdersAccepted();
      return res.status(201).json(internalOrders);
    } catch (err) {
      console.log(err);
      return res.status(500).end();
    }
});

router.get("/internalOrders/:ID", param("ID"), async (req, res) => {
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

router.put("/internalOrders/:ID",
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

router.delete(
  "/InternalOrders/:ID",
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

module.exports = router;
