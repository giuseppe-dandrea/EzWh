const express = require("express");
const { validationResult, param, body } = require("express-validator");
const EzWhException = require("./modules/EzWhException.js");

const router = express.Router();

//GET /api/items
router.get("/api/items", async (req, res) => {
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
router.get("/api/items/:id", param("id").isInt({ min: 1 }), async (req, res) => {
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
router.post(
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
router.put(
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
router.delete("/api/items/:id", param("id").isInt({ min: 1 }), async (req, res) => {
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

module.exports = router;