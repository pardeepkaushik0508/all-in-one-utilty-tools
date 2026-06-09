const express = require('express');
const crypto = require('crypto');

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
    sha256: crypto.createHash('sha256').update(text).digest('hex')
  });
});

module.exports = router;
