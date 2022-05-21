const express = require("express");
const { validationResult, param, check } = require("express-validator");
const EzWhException = require("./modules/EzWhException.js");

const router = express.Router();

// TestResult
router.get('/api/skuitems/:rfid/testResults', param('rfid').isNumeric().isLength({min: 32, max: 32}),
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

router.get('/api/skuitems/:rfid/testResults/:id', param('rfid').isNumeric().isLength({min: 32, max: 32}),
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

router.post('/api/skuitems/testResult', check('rfid').isNumeric().isLength({min: 32, max: 32}),
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

router.put('/api/skuitems/:rfid/testResult/:id', param('rfid').isNumeric().isLength({min: 32, max: 32}),
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

router.delete('/api/skuitems/:rfid/testResult/:id', param('rfid').isNumeric().isLength({min: 32, max: 32}),
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

module.exports = router;