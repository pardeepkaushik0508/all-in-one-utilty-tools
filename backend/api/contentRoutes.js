const express = require('express');
const { getToolContent, getBlogContent } = require('../services/contentService');

const router = express.Router();

router.get('/tools/:slug', async (req, res, next) => {
  try {
    const content = await getToolContent(req.params.slug);
    return res.json({ slug: req.params.slug, content });
  } catch (error) {
    return next(error);
  }
});

router.get('/blogs/:slug', async (req, res, next) => {
  try {
    const content = await getBlogContent(req.params.slug);
    return res.json({ slug: req.params.slug, content });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
