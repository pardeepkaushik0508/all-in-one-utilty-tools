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

const { getPrisma } = require('./client');
const { getDefaultPages, DEFAULT_NAVIGATION } = require('../services/cmsService');
const { ensureDefaultCategories } = require('../services/contentService');
const { setSiteMeta } = require('../services/dbHelpers');

const SEO_CONTENT_FILE = path.join(__dirname, '../data/seo-content.json');
const STATIC_BLOGS_FILE = path.join(__dirname, 'seed-data/static-blogs.json');

async function seedPages(prisma) {
  const defaults = getDefaultPages();
  const fileStore = loadJson(SEO_CONTENT_FILE, {});
  const filePages = fileStore.pages || {};

  for (const page of Object.values(defaults)) {
    const fromFile = filePages[page.id];
    const merged = fromFile ? { ...page, ...fromFile } : page;
    await prisma.cmsPage.upsert({
      where: { id: merged.id },
      create: {
        id: merged.id,
        slug: merged.slug,
        title: merged.title,
        content: merged.content || {},
        sections: merged.sections || [],
        seo: merged.seo || {},
        status: merged.status || 'published',
        scheduledAt: merged.scheduledAt ? new Date(merged.scheduledAt) : null,
        revisions: merged.revisions || [],
        updatedAt: merged.updatedAt ? new Date(merged.updatedAt) : new Date()
      },
      update: {
        title: merged.title,
        content: merged.content || {},
        sections: merged.sections || [],
        seo: merged.seo || {},
        status: merged.status || 'published',
        scheduledAt: merged.scheduledAt ? new Date(merged.scheduledAt) : null,
        revisions: merged.revisions || [],
        updatedAt: new Date()
      }
    });
  }

  // Import any custom pages from file not in defaults
  for (const [id, page] of Object.entries(filePages)) {
    if (defaults[id]) continue;
    await prisma.cmsPage.upsert({
      where: { id },
      create: {
        id: page.id || id,
        slug: page.slug,
        title: page.title || page.slug,
        content: page.content || {},
        sections: page.sections || [],
        seo: page.seo || {},
        status: page.status || 'published',
        scheduledAt: page.scheduledAt ? new Date(page.scheduledAt) : null,
        revisions: page.revisions || [],
        updatedAt: page.updatedAt ? new Date(page.updatedAt) : new Date()
      },
      update: {
        title: page.title || page.slug,
        content: page.content || {},
        sections: page.sections || [],
        seo: page.seo || {},
        status: page.status || 'published',
        revisions: page.revisions || [],
        updatedAt: new Date()
      }
    });
  }
}

async function seedNavigation(prisma) {
  const fileStore = loadJson(SEO_CONTENT_FILE, {});
  const navigation = { ...DEFAULT_NAVIGATION, ...(fileStore.navigation || {}) };

  await prisma.navigationConfig.upsert({
    where: { id: 'default' },
    create: { id: 'default', data: navigation, updatedAt: new Date() },
    update: { data: navigation, updatedAt: new Date() }
  });
}

async function seedToolSettings(prisma) {
  const fileStore = loadJson(SEO_CONTENT_FILE, {});
  const settings = fileStore.toolSettings || {};

  for (const [slug, setting] of Object.entries(settings)) {
    await prisma.toolSetting.upsert({
      where: { slug },
      create: {
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
        maintenanceMessage: setting.maintenanceMessage,
        updatedAt: setting.updatedAt ? new Date(setting.updatedAt) : new Date()
      },
      update: {
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
        maintenanceMessage: setting.maintenanceMessage,
        updatedAt: new Date()
      }
    });
  }
}

async function seedToolSeo(prisma) {
  const fileStore = loadJson(SEO_CONTENT_FILE, {});
  const tools = fileStore.tools || {};

  for (const [slug, data] of Object.entries(tools)) {
    await prisma.toolSeoContent.upsert({
      where: { slug },
      create: { slug, data, updatedAt: new Date() },
      update: { data, updatedAt: new Date() }
    });
  }
}

async function seedMedia(prisma) {
  const fileStore = loadJson(SEO_CONTENT_FILE, {});
  const media = fileStore.media || [];

  for (const item of media) {
    if (!item.id) continue;
    const exists = await prisma.mediaAsset.findUnique({ where: { id: item.id } });
    if (exists) continue;
    await prisma.mediaAsset.create({
      data: {
        id: item.id,
        filename: item.filename || 'file',
        storedName: item.storedName,
        mimeType: item.mimeType,
        size: item.size,
        url: item.url,
        storage: item.storage,
        localPath: item.localPath,
        createdAt: item.createdAt ? new Date(item.createdAt) : new Date()
      }
    });
  }
}

async function seedBlogs(prisma) {
  if (!fs.existsSync(STATIC_BLOGS_FILE)) {
    console.warn('No static-blogs.json found — skipping blog seed.');
    return;
  }

  const posts = JSON.parse(fs.readFileSync(STATIC_BLOGS_FILE, 'utf8'));
  await ensureDefaultCategories();

  for (const post of posts) {
    const category = await prisma.blogCategory.findFirst({
      where: { name: post.category }
    });

    const existing = await prisma.blog.findUnique({ where: { slug: post.slug } });
    if (existing) continue;

    const created = await prisma.blog.create({
      data: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || '',
        content: post.content || '',
        featuredImage: post.featuredImage || null,
        author: post.author || 'UtilityTools Team',
        readTime: post.readTime || '5 min',
        relatedToolSlug: post.relatedToolSlug || null,
        category: post.category || 'Guides',
        categoryId: category?.id || null,
        status: post.status || 'published',
        publishedAt: post.date ? new Date(post.date) : new Date(),
        createdAt: post.date ? new Date(post.date) : new Date(),
        metaTitle: post.title,
        metaDescription: post.excerpt || '',
        keywords: [],
        robotsIndex: true
      }
    });

    // Seed tags from category name
    if (post.category) {
      const tagSlug = post.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const tag = await prisma.tag.upsert({
        where: { slug: tagSlug },
        create: { name: post.category, slug: tagSlug },
        update: {}
      });
      await prisma.blogTag.upsert({
        where: { blogId_tagId: { blogId: created.id, tagId: tag.id } },
        create: { blogId: created.id, tagId: tag.id },
        update: {}
      });
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
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set — skipping seed.');
    return;
  }

  const prisma = getPrisma();
  console.log('Seeding database...');

  await seedPages(prisma);
  console.log('  ✓ Pages');

  await seedNavigation(prisma);
  console.log('  ✓ Navigation');

  await seedToolSettings(prisma);
  console.log('  ✓ Tool settings');

  await seedToolSeo(prisma);
  console.log('  ✓ Tool SEO content');

  await seedMedia(prisma);
  console.log('  ✓ Media');

  await seedBlogs(prisma);
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
    const prisma = getPrisma();
    if (prisma?.$disconnect) await prisma.$disconnect();
  });
