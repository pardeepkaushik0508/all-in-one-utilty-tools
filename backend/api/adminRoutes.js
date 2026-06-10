const express = require('express');
const {
  getToolContent,
  saveToolContent,
  getBlogContent,
  saveBlogContent,
  listContentSummary,
  readContentStore
} = require('../services/contentService');

const router = express.Router();

function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'] || req.body?.token;
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) {
    return res.status(503).json({ error: 'Admin token is not configured on the server.' });
  }
  if (token !== expected) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return next();
}

router.post('/auth', (req, res) => {
  const token = String(req.body?.token || '');
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return res.status(503).json({ error: 'ADMIN_TOKEN not configured.' });
  if (token !== expected) return res.status(401).json({ error: 'Invalid token' });
  return res.json({ ok: true });
});

router.get('/content', requireAdmin, async (req, res, next) => {
  try {
    const store = await readContentStore();
    return res.json(store);
  } catch (error) {
    return next(error);
  }
});

router.get('/content/summary', requireAdmin, async (req, res, next) => {
  try {
    const summary = await listContentSummary();
    return res.json(summary);
  } catch (error) {
    return next(error);
  }
});

router.get('/content/tools/:slug', requireAdmin, async (req, res, next) => {
  try {
    const content = await getToolContent(req.params.slug);
    return res.json({ slug: req.params.slug, content });
  } catch (error) {
    return next(error);
  }
});

router.put('/content/tools/:slug', requireAdmin, async (req, res, next) => {
  try {
    const saved = await saveToolContent(req.params.slug, req.body || {});
    return res.json({ message: 'Tool SEO content saved.', content: saved });
  } catch (error) {
    return next(error);
  }
});

router.get('/content/blogs/:slug', requireAdmin, async (req, res, next) => {
  try {
    const content = await getBlogContent(req.params.slug);
    return res.json({ slug: req.params.slug, content });
  } catch (error) {
    return next(error);
  }
});

router.put('/content/blogs/:slug', requireAdmin, async (req, res, next) => {
  try {
    const saved = await saveBlogContent(req.params.slug, req.body || {});
    return res.json({ message: 'Blog content saved.', content: saved });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
