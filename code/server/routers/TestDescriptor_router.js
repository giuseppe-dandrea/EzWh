const express = require("express");
const { validationResult, param, check } = require("express-validator");
const EzWhException = require("./modules/EzWhException.js");

const router = express.Router();

// Test Descriptor
router.get('/api/testDescriptors', async (req, res) => {
  try {
    const testDescriptors = await facade.getTestDescriptors()
    return res.status(200).json(testDescriptors);
  } catch (err) {
    console.log("Error in Server");
    console.log(err);
    return res.status(500).end();
  }
});

router.get('/api/testDescriptors/:id', param('id').isInt({ min: 1 }),
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

router.post('/api/testDescriptor', check('name').exists(), check('procedureDescription').exists(),
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

router.put('/api/testDescriptor/:id', param('id').isInt({ min: 1 }),
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

router.delete('/api/testDescriptor/:id', param('id').isInt({ min: 1 }),
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

module.exports = router;