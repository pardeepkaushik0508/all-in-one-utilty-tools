const express = require('express');
const {
  convertUnit,
  calculateAge,
  calculateEmi,
  convertCurrency
} = require('../services/utilityService');

const router = express.Router();

router.post('/unit-convert', (req, res, next) => {
  try {
    const { value, fromUnit, toUnit, category } = req.body;
    const result = convertUnit(value, fromUnit, toUnit, category);
    return res.json({ message: 'Unit converted successfully.', ...result });
  } catch (error) {
    return next(error);
  }
});

router.post('/age', (req, res, next) => {
  try {
    const result = calculateAge(req.body.birthDate);
    return res.json({ message: 'Age calculated successfully.', ...result });
  } catch (error) {
    return next(error);
  }
});

router.post('/emi', (req, res, next) => {
  try {
    const result = calculateEmi(req.body.principal, req.body.annualRate, req.body.tenureMonths);
    return res.json({ message: 'EMI calculated successfully.', ...result });
  } catch (error) {
    return next(error);
  }
});

router.post('/currency', async (req, res, next) => {
  try {
    const result = await convertCurrency(req.body.amount, req.body.fromCurrency, req.body.toCurrency);
    return res.json({ message: 'Currency converted successfully.', ...result });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
