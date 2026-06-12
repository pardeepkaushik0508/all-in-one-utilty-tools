const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const {
  getToolContent,
  getBlogContent,
  listBlogs,
  isBlogPublished
} = require('../services/contentService');
const {
  listPages,
  getPageBySlug,
  listToolSettings,
  getToolSetting,
  getNavigation,
  listMedia,
  getCacheVersion,
  MEDIA_DIR
} = require('../services/cmsService');

const router = express.Router();

router.get('/site', async (_req, res, next) => {
  try {
    const [pages, navigation, toolSettings, cacheVersion] = await Promise.all([
      listPages({ includeDrafts: false }),
      getNavigation(),
      listToolSettings([]),
      getCacheVersion()
    ]);
    return res.json({ pages, navigation, toolSettings, cacheVersion });
  } catch (error) {
    return next(error);
  }
});

router.get('/pages/:slug', async (req, res, next) => {
  try {
    const page = await getPageBySlug(req.params.slug);
    if (!page || page.status === 'draft') {
      return res.status(404).json({ error: 'Page not found.' });
    }
    return res.json({ page });
  } catch (error) {
    return next(error);
  }
});

router.get('/tools/settings', async (_req, res, next) => {
  try {
    const toolSettings = await listToolSettings([]);
    return res.json({ toolSettings });
  } catch (error) {
    return next(error);
  }
});

router.get('/tools/settings/:slug', async (req, res, next) => {
  try {
    const setting = await getToolSetting(req.params.slug);
    return res.json({ slug: req.params.slug, setting });
  } catch (error) {
    return next(error);
  }
});

router.get('/navigation', async (_req, res, next) => {
  try {
    const navigation = await getNavigation();
    return res.json({ navigation });
  } catch (error) {
    return next(error);
  }
});

router.get('/cache-version', async (_req, res, next) => {
  try {
    const cacheVersion = await getCacheVersion();
    return res.json({ cacheVersion });
  } catch (error) {
    return next(error);
  }
});

router.get('/tools/:slug', async (req, res, next) => {
  try {
    const content = await getToolContent(req.params.slug);
    return res.json({ slug: req.params.slug, content });
  } catch (error) {
    return next(error);
  }
});

router.get('/blogs', async (req, res, next) => {
  try {
    const posts = await listBlogs({ includeDrafts: false });
    return res.json({ posts });
  } catch (error) {
    return next(error);
  }
});

router.get('/blogs/:slug', async (req, res, next) => {
  try {
    const content = await getBlogContent(req.params.slug);
    if (!content || !isBlogPublished(content)) {
      return res.json({ slug: req.params.slug, content: null });
    }
    return res.json({ slug: req.params.slug, content });
  } catch (error) {
    return next(error);
  }
});

router.get('/media', async (_req, res, next) => {
  try {
    const media = await listMedia();
    return res.json({ media });
  } catch (error) {
    return next(error);
  }
});

router.get('/media/file/:filename', async (req, res, next) => {
  try {
    const filePath = path.join(MEDIA_DIR, path.basename(req.params.filename));
    await fs.access(filePath);
    return res.sendFile(filePath);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
