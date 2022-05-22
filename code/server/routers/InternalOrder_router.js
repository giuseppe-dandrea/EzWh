const express = require("express");
const { validationResult, param, body } = require("express-validator");
const InternalOrderService = require('../services/InternalOrder_service');
const internalOrderService = new InternalOrderService();
const dayjs = require("dayjs");
const EzWhException = require("../modules/EzWhException");

const router = express.Router();

router.post("/internalOrders",
  body("issueDate").exists(),
  body("products").isArray(),
  body("customerId").isInt({ min: 1 }),
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty() || !dayjs(req.body.issueDate, ['YYYY/MM/DD', 'YYYY/MM/DD HH:mm'], true).isValid()) {
      return res.status(422).end();
    }
    try {
      // console.log(req.body)
      await internalOrderService.createInternalOrder(req.body.issueDate, req.body.products, req.body.customerId);
      return res.status(201).end();
    } catch (err) {
      console.log(err);
      return res.status(503).end();
    }
});

router.get("/internalOrders",
  async (req, res) => {
    try{
      const internalOrders = await internalOrderService.getInternalOrders();
      return res.status(200).json(internalOrders);
    } catch (err) {
      console.log(err);
      return res.status(500).end();
    }
});

router.get("/internalOrdersIssued",
  async (req, res) => {
    try{
      const internalOrders = await internalOrderService.getInternalOrdersIssued();
      return res.status(200).json(internalOrders);
    } catch (err) {
      console.log(err);
      return res.status(500).end();
    }
});

router.get("/internalOrdersAccepted",
  async (req, res) => {
    try{
      const internalOrders = await internalOrderService.getInternalOrdersAccepted();
      return res.status(200).json(internalOrders);
    } catch (err) {
      console.log(err);
      return res.status(500).end();
    }
});

router.get("/internalOrders/:ID", param("ID").isInt({ min: 1 }), async (req, res) => {
  try {
    const internalOrder = await internalOrderService.getInternalOrderByID(req.params.ID);
    if (internalOrder===undefined)
      return res.status(404).end();
    else
      return res.status(200).json(internalOrder);
  } catch (err) {
    console.log(err);
    return res.status(500).end();
  }
});

router.put("/internalOrders/:id",
  param("id").isInt({min:1}),
  body("newState").isString(),
  body("products").optional().isArray(),
  async (req, res) => {
      const validationErrors = validationResult(req);
      if (!validationErrors.isEmpty()) {
          return res.status(422).end();
      }
  try {
      if(req.body.newState !== "COMPLETED"){
          await internalOrderService.modifyInternalOrder(req.params.id, req.body.newState);
          return res.status(200).end();
      }
      else if(req.body.newState === "COMPLETED"){
          await internalOrderService.modifyInternalOrder(req.params.id, req.body.newState);
          await internalOrderService.completeInternalOrder(req.params.id, req.body.newState, req.body.products);
          return res.status(200).end();
      }
    // const internalOrder = await internalOrderService.modifyInternalOrder(req.params.ID, req.body.newState, req.body.products);
    // if (internalOrder===undefined)
    //   return res.status(404).end();
    // else
    //   return res.status(200).end();
  } catch (err) {
      if  (err === EzWhException.NotFound) {
          return res.status(404).end();
      }
      else
          return res.status(500).end();
  }
});

router.delete(
  "/InternalOrders/:ID",
  param("ID").isInt({ min: 1 }),
  async (req, res) => {
    try {
      await internalOrderService.deleteInternalOrder(req.params.ID);
      return res.status(204).end();
    } catch (err) {
      console.log(err);
      return res.status(503).end();
    }
  }
);

module.exports = router;
