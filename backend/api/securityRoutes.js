const express = require('express');
const crypto = require('crypto');
const {
  dnsLookup,
  securityHeadersCheck,
  sslCertificateCheck,
  robotsTxtCheck,
  safePortScan,
  ipLookup
} = require('../services/securityNetworkService');

const router = express.Router();

router.post('/password-generator', (req, res) => {
  const length = Math.min(64, Math.max(6, Number(req.body.length) || 12));
  const useSymbols = req.body.useSymbols !== false;

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const symbolSet = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const chars = useSymbols ? alphabet + symbolSet : alphabet;

  const randomBytes = crypto.randomBytes(length);
  let password = '';

  for (let i = 0; i < length; i += 1) {
    password += chars[randomBytes[i] % chars.length];
  }

  res.json({ password, length, useSymbols });
});

router.post('/password-strength', (req, res) => {
  const password = req.body.password || '';
  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const capped = Math.min(score, labels.length - 1);

  res.json({ score: capped, label: labels[capped] });
});

router.post('/hash', (req, res) => {
  const text = String(req.body.text || '');
  if (!text) return res.status(400).json({ error: 'Text is required.' });

  res.json({
    md5: crypto.createHash('md5').update(text).digest('hex'),
    sha1: crypto.createHash('sha1').update(text).digest('hex'),
    sha256: crypto.createHash('sha256').update(text).digest('hex'),
    sha512: crypto.createHash('sha512').update(text).digest('hex')
  });
});

router.post('/hash-verify', (req, res) => {
  const { text, hash, algorithm = 'sha256' } = req.body;
  if (!text || !hash) return res.status(400).json({ error: 'Text and hash are required.' });
  const computed = crypto.createHash(algorithm).update(text).digest('hex');
  res.json({ match: computed.toLowerCase() === String(hash).toLowerCase(), computed });
});

router.post('/dns-lookup', async (req, res, next) => {
  try {
    const result = await dnsLookup(req.body.domain);
    res.json({ result });
  } catch (e) { next(e); }
});

router.post('/ssl-check', async (req, res, next) => {
  try {
    const result = await sslCertificateCheck(req.body.domain);
    res.json({ result });
  } catch (e) { next(e); }
});

router.post('/security-headers', async (req, res, next) => {
  try {
    const result = await securityHeadersCheck(req.body.url);
    res.json({ result });
  } catch (e) { next(e); }
});

router.post('/robots-txt', async (req, res, next) => {
  try {
    const result = await robotsTxtCheck(req.body.url);
    res.json({ result });
  } catch (e) { next(e); }
});

router.post('/port-scan', async (req, res, next) => {
  try {
    const result = await safePortScan(req.body.domain);
    res.json({ result, disclaimer: 'Safe scan limited to ports 80 and 443 only.' });
  } catch (e) { next(e); }
});

router.post('/ip-lookup', async (req, res, next) => {
  try {
    const result = await ipLookup(req.body.domain);
    res.json({ result });
  } catch (e) { next(e); }
});

router.post('/url-safety', (req, res) => {
  const url = String(req.body.url || '');
  const suspicious = /(login|verify|free|win|click|bit\.ly)/i.test(url);
  res.json({ url, risk: suspicious ? 'medium' : 'low', message: suspicious ? 'URL contains suspicious patterns. Proceed with caution.' : 'No obvious suspicious patterns detected.' });
});

module.exports = router;
