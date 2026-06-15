const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const {
  getToolContent,
  saveToolContent,
  getBlogContent,
  saveBlogContent,
  listBlogs,
  createBlog,
  deleteBlog,
  listContentSummary,
  readContentStore,
  getBlogCategories,
  addBlogCategory,
  updateBlogCategory,
  deleteBlogCategory
} = require('../services/contentService');
const {
  listPages,
  getPageById,
  createPage,
  updatePage,
  deletePage,
  restorePageRevision,
  listToolSettings,
  saveToolSetting,
  toggleTools,
  reorderTools,
  getNavigation,
  saveNavigation,
  listMedia,
  addMediaRecord,
  deleteMedia,
  getActivityLog,
  getCacheVersion,
  getDashboardStats,
  MEDIA_DIR
} = require('../services/cmsService');
const { mediaUpload } = require('../utils/upload');

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

router.post('/login', (req, res) => {
  const email = String(req.body?.email || req.body?.username || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const expectedEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const expectedPassword = process.env.ADMIN_PASSWORD || '';
  const adminToken = process.env.ADMIN_TOKEN;

  if (!expectedEmail || !expectedPassword || !adminToken) {
    return res.status(503).json({ error: 'Admin login is not configured on the server.' });
  }
  if (email !== expectedEmail || password !== expectedPassword) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  return res.json({ ok: true, token: adminToken });
});

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

router.get('/blogs', requireAdmin, async (req, res, next) => {
  try {
    const blogs = await listBlogs({ includeDrafts: true });
    return res.json({ blogs });
  } catch (error) {
    return next(error);
  }
});

router.post('/blogs', requireAdmin, async (req, res, next) => {
  try {
    const blog = await createBlog(req.body || {});
    return res.status(201).json({ blog });
  } catch (error) {
    return next(error);
  }
});

router.delete('/blogs/:slug', requireAdmin, async (req, res, next) => {
  try {
    const result = await deleteBlog(req.params.slug);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
});

// ── Blog categories ───────────────────────────────────────────────────────────
router.get('/blog-categories', requireAdmin, async (_req, res, next) => {
  try {
    const categories = await getBlogCategories();
    return res.json({ categories });
  } catch (error) {
    return next(error);
  }
});

router.post('/blog-categories', requireAdmin, async (req, res, next) => {
  try {
    const record = await addBlogCategory(req.body || {});
    return res.status(201).json({ category: record });
  } catch (error) {
    return next(error);
  }
});

router.put('/blog-categories/:slug', requireAdmin, async (req, res, next) => {
  try {
    const record = await updateBlogCategory(decodeURIComponent(req.params.slug), req.body || {});
    return res.json({ category: record });
  } catch (error) {
    return next(error);
  }
});

router.delete('/blog-categories/:slug', requireAdmin, async (req, res, next) => {
  try {
    const result = await deleteBlogCategory(decodeURIComponent(req.params.slug));
    return res.json(result);
  } catch (error) {
    return next(error);
  }
});

router.get('/pages', requireAdmin, async (req, res, next) => {
  try {
    const pages = await listPages({ includeDrafts: true });
    return res.json({ pages });
  } catch (error) {
    return next(error);
  }
});

router.get('/pages/:id', requireAdmin, async (req, res, next) => {
  try {
    const page = await getPageById(req.params.id);
    if (!page) return res.status(404).json({ error: 'Page not found.' });
    return res.json({ page });
  } catch (error) {
    return next(error);
  }
});

router.post('/pages', requireAdmin, async (req, res, next) => {
  try {
    const page = await createPage(req.body || {});
    return res.status(201).json({ page });
  } catch (error) {
    return next(error);
  }
});

router.put('/pages/:id', requireAdmin, async (req, res, next) => {
  try {
    const page = await updatePage(req.params.id, req.body || {});
    return res.json({ page });
  } catch (error) {
    return next(error);
  }
});

router.delete('/pages/:id', requireAdmin, async (req, res, next) => {
  try {
    const result = await deletePage(req.params.id);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
});

router.post('/pages/:id/restore/:revisionId', requireAdmin, async (req, res, next) => {
  try {
    const page = await restorePageRevision(req.params.id, req.params.revisionId);
    return res.json({ page });
  } catch (error) {
    return next(error);
  }
});

router.get('/tools', requireAdmin, async (req, res, next) => {
  try {
    const catalog = Array.isArray(req.body?.catalog) ? req.body.catalog : [];
    const tools = await listToolSettings(catalog.length ? catalog : parseCatalogQuery(req.query.catalog));
    return res.json({ tools });
  } catch (error) {
    return next(error);
  }
});

router.put('/tools/:id', requireAdmin, async (req, res, next) => {
  try {
    const slug = req.params.id;
    const saved = await saveToolSetting(slug, req.body || {});
    return res.json({ tool: saved });
  } catch (error) {
    return next(error);
  }
});

router.post('/tools/toggle', requireAdmin, async (req, res, next) => {
  try {
    const slugs = req.body?.slugs || [];
    const enabled = req.body?.enabled !== false;
    const tools = await toggleTools(slugs, enabled);
    return res.json({ tools });
  } catch (error) {
    return next(error);
  }
});

router.post('/tools/reorder', requireAdmin, async (req, res, next) => {
  try {
    const slugs = req.body?.slugs || [];
    const tools = await reorderTools(slugs);
    return res.json({ tools });
  } catch (error) {
    return next(error);
  }
});

router.get('/navigation', requireAdmin, async (req, res, next) => {
  try {
    const navigation = await getNavigation();
    return res.json({ navigation });
  } catch (error) {
    return next(error);
  }
});

router.put('/navigation', requireAdmin, async (req, res, next) => {
  try {
    const navigation = await saveNavigation(req.body || {});
    return res.json({ navigation });
  } catch (error) {
    return next(error);
  }
});

router.get('/media', requireAdmin, async (req, res, next) => {
  try {
    const media = await listMedia();
    return res.json({ media });
  } catch (error) {
    return next(error);
  }
});

router.post('/media/upload', requireAdmin, mediaUpload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    const dest = path.join(MEDIA_DIR, req.file.filename);
    await fs.rename(req.file.path, dest).catch(async () => {
      await fs.copyFile(req.file.path, dest);
      await fs.unlink(req.file.path).catch(() => {});
    });

    const url = `/api/content/media/file/${req.file.filename}`;

    const item = await addMediaRecord({
      filename: req.file.originalname,
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url,
      storage: 'local',
      localPath: dest
    });

    return res.status(201).json({ media: item });
  } catch (error) {
    return next(error);
  }
});

router.delete('/media/:id', requireAdmin, async (req, res, next) => {
  try {
    const result = await deleteMedia(req.params.id);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
});

router.get('/activity', requireAdmin, async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const activity = await getActivityLog(limit);
    return res.json({ activity });
  } catch (error) {
    return next(error);
  }
});

router.get('/dashboard', requireAdmin, async (req, res, next) => {
  try {
    const catalogToolCount = Number(req.query.catalogTools) || 0;
    const stats = await getDashboardStats(catalogToolCount);
    return res.json(stats);
  } catch (error) {
    return next(error);
  }
});

router.post('/revalidate', requireAdmin, async (req, res) => {
  const secret = process.env.REVALIDATE_SECRET || process.env.ADMIN_TOKEN;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const paths = req.body?.paths || ['/', '/about', '/contact'];
  const cacheVersion = await getCacheVersion();

  try {
    const response = await fetch(`${frontendUrl}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, paths, cacheVersion })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error || 'Revalidation failed.', cacheVersion });
    }
    return res.json({ ok: true, cacheVersion, ...data });
  } catch (error) {
    return res.json({
      ok: false,
      warning: 'Could not reach frontend revalidation endpoint.',
      cacheVersion,
      message: error.message
    });
  }
});

function parseCatalogQuery(raw) {
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

module.exports = router;
