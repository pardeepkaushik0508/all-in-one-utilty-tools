const axios = require('axios');
const { create, all } = require('mathjs');

const math = create(all);

const UNIT_FACTORS = {
  m: 1,
  km: 1000,
  cm: 0.01,
  mm: 0.001,
  mi: 1609.344,
  ft: 0.3048,
  in: 0.0254,
  kg: 1,
  g: 0.001,
  lb: 0.453592,
  oz: 0.0283495
};

function convertUnit(value, fromUnit, toUnit, category) {
  const amount = Number(value);
  if (Number.isNaN(amount)) throw new Error('Value must be a number.');

  if (category === 'temperature') {
    let celsius;
    if (fromUnit === 'c') celsius = amount;
    else if (fromUnit === 'f') celsius = ((amount - 32) * 5) / 9;
    else if (fromUnit === 'k') celsius = amount - 273.15;
    else throw new Error('Unsupported temperature unit.');

    if (toUnit === 'c') return { result: celsius };
    if (toUnit === 'f') return { result: (celsius * 9) / 5 + 32 };
    if (toUnit === 'k') return { result: celsius + 273.15 };
    throw new Error('Unsupported temperature unit.');
  }

  const fromFactor = UNIT_FACTORS[fromUnit];
  const toFactor = UNIT_FACTORS[toUnit];
  if (!fromFactor || !toFactor) {
    throw new Error('Unsupported unit conversion pair.');
  }

  const baseValue = amount * fromFactor;
  return { result: baseValue / toFactor };
}

function calculateAge(birthDate) {
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) {
    throw new Error('Invalid birth date.');
  }

  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  let days = today.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    const previousMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += previousMonth.getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const totalDays = Math.floor((today - birth) / (1000 * 60 * 60 * 24));
  return { years, months, days, totalDays };
}

function calculateEmi(principal, annualRate, tenureMonths) {
  const p = Number(principal);
  const rate = Number(annualRate) / 12 / 100;
  const n = Number(tenureMonths);

  if ([p, rate, n].some((value) => Number.isNaN(value) || value <= 0)) {
    throw new Error('Principal, rate, and tenure must be positive numbers.');
  }

  const emi = rate === 0 ? p / n : (p * rate * (1 + rate) ** n) / ((1 + rate) ** n - 1);
  const totalPayment = emi * n;
  const totalInterest = totalPayment - p;

  return {
    emi: math.round(emi, 2),
    totalPayment: math.round(totalPayment, 2),
    totalInterest: math.round(totalInterest, 2)
  };
}

async function convertCurrency(amount, fromCurrency, toCurrency) {
  const value = Number(amount);
  if (Number.isNaN(value) || value < 0) {
    throw new Error('Amount must be a valid positive number.');
  }

  const from = String(fromCurrency || 'USD').toUpperCase();
  const to = String(toCurrency || 'EUR').toUpperCase();

  const response = await axios.get('https://api.frankfurter.app/latest', {
    params: { from, to },
    timeout: 15000
  });

  const rate = response.data?.rates?.[to];
  if (!rate) {
    throw new Error('Currency conversion rate unavailable.');
  }

  return {
    result: math.round(value * rate, 4),
    rate,
    date: response.data.date
  };
}

module.exports = {
  convertUnit,
  calculateAge,
  calculateEmi,
  convertCurrency
};
