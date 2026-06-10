const express = require('express');
const { minifyCode, htmlToPlainText, beautifyCss } = require('../services/developerService');
const { apiRequestTest, httpHeaderCheck } = require('../services/developerNetworkService');

const router = express.Router();

router.post('/minify', async (req, res, next) => {
  try {
    const code = String(req.body.code || '');
    const type = String(req.body.type || 'js');
    if (!code.trim()) return res.status(400).json({ error: 'Code is required.' });

    const { output } = await minifyCode({ code, type });
    return res.json({ message: 'Code minified successfully.', output });
  } catch (error) {
    return next(error);
  }
});

router.post('/html-to-text', (req, res) => {
  const html = String(req.body.html || '');
  if (!html.trim()) return res.status(400).json({ error: 'HTML is required.' });

  const { output } = htmlToPlainText(html);
  return res.json({ message: 'Converted successfully.', output });
});

router.post('/css-beautify', (req, res) => {
  const css = String(req.body.css || '');
  if (!css.trim()) return res.status(400).json({ error: 'CSS is required.' });

  const { output } = beautifyCss(css);
  return res.json({ message: 'CSS beautified successfully.', output });
});

router.post('/api-test', async (req, res, next) => {
  try {
    const result = await apiRequestTest(req.body.url, req.body.method, req.body.body);
    res.json({ result });
  } catch (e) { next(e); }
});

router.post('/http-headers', async (req, res, next) => {
  try {
    const result = await httpHeaderCheck(req.body.url);
    res.json({ result });
  } catch (e) { next(e); }
});

module.exports = router;
