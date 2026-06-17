/**
 * Idempotent database seed — imports static blogs, CMS pages, navigation,
 * tool settings, tool SEO, and media from legacy file storage.
 *
 * Run: npm run seed --workspace backend
 * Or automatically on deploy via start-backend.sh when DATABASE_URL is set.
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { connectDb, disconnectDb, getMongoUri } = require('./connection');
const { CmsPage, NavigationConfig, ToolSetting, ToolSeoContent, MediaAsset, Blog, BlogCategory, Tag, BlogTag } = require('./models');
const { getDefaultPages, DEFAULT_NAVIGATION } = require('../services/cmsService');
const { ensureDefaultCategories } = require('../services/contentService');
const { setSiteMeta } = require('../services/dbHelpers');

const SEO_CONTENT_FILE = path.join(__dirname, '../data/seo-content.json');
const STATIC_BLOGS_FILE = path.join(__dirname, 'seed-data/static-blogs.json');

async function seedPages() {
  const defaults = getDefaultPages();
  const fileStore = loadJson(SEO_CONTENT_FILE, {});
  const filePages = fileStore.pages || {};

  for (const page of Object.values(defaults)) {
    const fromFile = filePages[page.id];
    const merged = fromFile ? { ...page, ...fromFile } : page;
    await CmsPage.findOneAndUpdate(
      { _id: merged.id },
      {
        $set: {
          slug: merged.slug,
          title: merged.title,
          content: merged.content || {},
          sections: merged.sections || [],
          seo: merged.seo || {},
          status: merged.status || 'published',
          scheduledAt: merged.scheduledAt ? new Date(merged.scheduledAt) : null,
          revisions: merged.revisions || []
        },
        $setOnInsert: {
          _id: merged.id
        }
      },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }

  for (const [id, page] of Object.entries(filePages)) {
    if (defaults[id]) continue;
    await CmsPage.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          slug: page.slug,
          title: page.title || page.slug,
          content: page.content || {},
          sections: page.sections || [],
          seo: page.seo || {},
          status: page.status || 'published',
          scheduledAt: page.scheduledAt ? new Date(page.scheduledAt) : null,
          revisions: page.revisions || []
        },
        $setOnInsert: {
          _id: page.id || id
        }
      },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }
}

async function seedNavigation() {
  const fileStore = loadJson(SEO_CONTENT_FILE, {});
  const navigation = { ...DEFAULT_NAVIGATION, ...(fileStore.navigation || {}) };

  await NavigationConfig.findOneAndUpdate(
    { _id: 'default' },
    { $set: { data: navigation }, $setOnInsert: { _id: 'default' } },
    { upsert: true, setDefaultsOnInsert: true }
  );
}

async function seedToolSettings() {
  const fileStore = loadJson(SEO_CONTENT_FILE, {});
  const settings = fileStore.toolSettings || {};

  for (const [slug, setting] of Object.entries(settings)) {
    await ToolSetting.findOneAndUpdate(
      { slug },
      {
        $set: {
          _id: slug,
          slug,
          toolName: setting.toolName || slug,
          enabled: setting.enabled !== false,
          featured: setting.featured === true,
          maintenanceMode: setting.maintenanceMode === true,
          hiddenFromSearch: setting.hiddenFromSearch === true,
          hiddenFromHomepage: setting.hiddenFromHomepage === true,
          hiddenFromNavigation: setting.hiddenFromNavigation === true,
          order: setting.order ?? 0,
          scheduledEnableAt: setting.scheduledEnableAt ? new Date(setting.scheduledEnableAt) : null,
          scheduledDisableAt: setting.scheduledDisableAt ? new Date(setting.scheduledDisableAt) : null,
          maintenanceMessage: setting.maintenanceMessage
        }
      },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }
}

async function seedToolSeo() {
  const fileStore = loadJson(SEO_CONTENT_FILE, {});
  const tools = fileStore.tools || {};

  for (const [slug, data] of Object.entries(tools)) {
    await ToolSeoContent.findOneAndUpdate(
      { slug },
      { $set: { _id: slug, slug, data } },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }
}

async function seedMedia() {
  const fileStore = loadJson(SEO_CONTENT_FILE, {});
  const media = fileStore.media || [];

  for (const item of media) {
    if (!item.id) continue;
    const exists = await MediaAsset.findById(item.id).lean();
    if (exists) continue;
    await MediaAsset.create({
      _id: item.id,
      filename: item.filename || 'file',
      storedName: item.storedName,
      mimeType: item.mimeType,
      size: item.size,
      url: item.url,
      storage: item.storage,
      localPath: item.localPath,
      createdAt: item.createdAt ? new Date(item.createdAt) : new Date()
    });
  }
}

async function seedBlogs() {
  if (!fs.existsSync(STATIC_BLOGS_FILE)) {
    console.warn('No static-blogs.json found — skipping blog seed.');
    return;
  }

  const posts = JSON.parse(fs.readFileSync(STATIC_BLOGS_FILE, 'utf8'));
  await ensureDefaultCategories();

  for (const post of posts) {
    const category = await BlogCategory.findOne({ name: post.category }).lean();
    const existing = await Blog.findOne({ slug: post.slug }).lean();
    if (existing) continue;

    const created = await Blog.create({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content || '',
      featuredImage: post.featuredImage || null,
      author: post.author || 'UtilityTools Team',
      readTime: post.readTime || '5 min',
      relatedToolSlug: post.relatedToolSlug || null,
      category: post.category || 'Guides',
      categoryId: category?._id || null,
      status: post.status || 'published',
      publishedAt: post.date ? new Date(post.date) : new Date(),
      createdAt: post.date ? new Date(post.date) : new Date(),
      metaTitle: post.title,
      metaDescription: post.excerpt || '',
      keywords: [],
      robotsIndex: true
    });

    if (post.category) {
      const tagSlug = post.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      let tag = await Tag.findOne({ slug: tagSlug }).lean();
      if (!tag) {
        const createdTag = await Tag.create({ name: post.category, slug: tagSlug });
        tag = createdTag.toObject();
      }
      await BlogTag.findOneAndUpdate(
        { blogId: created._id, tagId: tag._id },
        { $set: { blogId: created._id, tagId: tag._id } },
        { upsert: true }
      );
    }
  }
}

function loadJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

async function main() {
  if (!getMongoUri()) {
    console.warn('DATABASE_URL not set — skipping seed.');
    return;
  }

  await connectDb();
  console.log('Seeding database...');

  await seedPages();
  console.log('  ✓ Pages');

  await seedNavigation();
  console.log('  ✓ Navigation');

  await seedToolSettings();
  console.log('  ✓ Tool settings');

  await seedToolSeo();
  console.log('  ✓ Tool SEO content');

  await seedMedia();
  console.log('  ✓ Media');

  await seedBlogs();
  console.log('  ✓ Blogs');

  const fileStore = loadJson(SEO_CONTENT_FILE, {});
  await setSiteMeta('cacheVersion', fileStore.cacheVersion || 1);
  console.log('  ✓ Site meta');

  console.log('Database seed complete.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await disconnectDb();
  });
