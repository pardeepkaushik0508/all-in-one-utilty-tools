/* Client-side utility tool processors */

export function percentageCalc(value, percent, mode) {
  const v = Number(value);
  const p = Number(percent);
  if (mode === 'of') return ((v * p) / 100).toFixed(2);
  if (mode === 'increase') return (v + (v * p) / 100).toFixed(2);
  if (mode === 'decrease') return (v - (v * p) / 100).toFixed(2);
  return ((p / v) * 100).toFixed(2);
}

export function gstCalc(amount, rate, inclusive) {
  const a = Number(amount);
  const r = Number(rate) / 100;
  if (inclusive) {
    const base = a / (1 + r);
    return `Base: ${base.toFixed(2)}\nGST: ${(a - base).toFixed(2)}\nTotal: ${a.toFixed(2)}`;
  }
  const gst = a * r;
  return `Base: ${a.toFixed(2)}\nGST: ${gst.toFixed(2)}\nTotal: ${(a + gst).toFixed(2)}`;
}

export function sipCalc(monthly, rate, years) {
  const r = Number(rate) / 100 / 12;
  const n = Number(years) * 12;
  const m = Number(monthly);
  const fv = m * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  return `Invested: ${(m * n).toFixed(2)}\nEstimated value: ${fv.toFixed(2)}`;
}

export function timezoneConvert(dateTime, fromTz, toTz) {
  try {
    const date = new Date(dateTime);
    return new Intl.DateTimeFormat('en-US', { timeZone: toTz, dateStyle: 'full', timeStyle: 'long' }).format(date);
  } catch {
    return dateTime;
  }
}

export function randomNumber(min, max) {
  const lo = Number(min);
  const hi = Number(max);
  return String(Math.floor(Math.random() * (hi - lo + 1)) + lo);
}

export function numberToWords(num) {
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const n = Number(num);
  if (n === 0) return 'zero';
  if (n < 10) return ones[n];
  if (n < 20) return teens[n - 10];
  if (n < 100) return `${tens[Math.floor(n / 10)]}${ones[n % 10] ? ` ${ones[n % 10]}` : ''}`.trim();
  if (n < 1000) return `${ones[Math.floor(n / 100)]} hundred${n % 100 ? ` ${numberToWords(n % 100)}` : ''}`;
  return String(n);
}

export function binaryConvert(value, from) {
  if (from === 'bin') return parseInt(value, 2).toString(10);
  return Number(value).toString(2);
}

export function decimalConvert(value, from) {
  if (from === 'hex') return parseInt(value, 16).toString(10);
  return Number(value).toString(16).toUpperCase();
}

export function romanNumeral(n) {
  const num = Number(n);
  const map = [['M', 1000], ['CM', 900], ['D', 500], ['CD', 400], ['C', 100], ['XC', 90], ['L', 50], ['XL', 40], ['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1]];
  let result = '';
  let remaining = num;
  map.forEach(([letter, val]) => {
    while (remaining >= val) {
      result += letter;
      remaining -= val;
    }
  });
  return result;
}

export function loanCalc(principal, rate, years) {
  const p = Number(principal);
  const r = Number(rate) / 100 / 12;
  const n = Number(years) * 12;
  const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return `Monthly EMI: ${emi.toFixed(2)}\nTotal payment: ${(emi * n).toFixed(2)}`;
}

export function tipCalc(bill, tipPercent, people) {
  const tip = (Number(bill) * Number(tipPercent)) / 100;
  const total = Number(bill) + tip;
  const perPerson = total / Number(people || 1);
  return `Tip: ${tip.toFixed(2)}\nTotal: ${total.toFixed(2)}\nPer person: ${perPerson.toFixed(2)}`;
}

export function discountCalc(price, discount) {
  const p = Number(price);
  const d = Number(discount);
  const saved = (p * d) / 100;
  return `Discount: ${saved.toFixed(2)}\nFinal price: ${(p - saved).toFixed(2)}`;
}

export function generateBarcodeValue(text) {
  return `*${text}*`;
}

export function generateQrUrl(text) {
  if (!text?.trim()) throw new Error('Text or URL is required.');
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text.trim())}`;
}
