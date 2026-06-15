const {
  readContentStore,
  writeContentStore,
  logActivity
} = require('./cmsService');

function normalizeSlug(slug = '') {
  return String(slug)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function isBlogPublished(record = {}) {
  if (record.status === 'draft') return false;
  if (record.status === 'scheduled' && record.scheduledAt) {
    return new Date(record.scheduledAt).getTime() <= Date.now();
  }
  return record.status !== 'draft';
}

async function getToolContent(slug) {
  const store = await readContentStore();
  return store.tools?.[slug] || null;
}

async function saveToolContent(slug, payload) {
  const store = await readContentStore();
  store.tools = store.tools || {};
  store.tools[slug] = {
    ...store.tools[slug],
    ...payload,
    updatedAt: new Date().toISOString()
  };
  await writeContentStore(store);
  await logActivity('seo.tool.save', { slug });
  return store.tools[slug];
}

async function getBlogContent(slug) {
  const store = await readContentStore();
  return store.blogs?.[slug] || null;
}

async function saveBlogContent(slug, payload) {
  const store = await readContentStore();
  store.blogs = store.blogs || {};
  const existing = store.blogs[slug] || {};
  const now = new Date().toISOString();
  store.blogs[slug] = {
    ...existing,
    ...payload,
    slug,
    updatedAt: now,
    createdAt: existing.createdAt || now
  };
  if (payload.status === 'published' && !store.blogs[slug].publishedAt) {
    store.blogs[slug].publishedAt = now;
  }
  await writeContentStore(store);
  await logActivity('seo.blog.save', { slug, status: store.blogs[slug].status });
  return store.blogs[slug];
}

async function listBlogs({ includeDrafts = true } = {}) {
  const store = await readContentStore();
  const blogs = Object.entries(store.blogs || {}).map(([slug, record]) => ({
    slug,
    ...record
  }));
  if (includeDrafts) return blogs;
  return blogs.filter(isBlogPublished);
}

async function createBlog(payload = {}) {
  const slug = normalizeSlug(payload.slug || payload.title);
  if (!slug) {
    throw Object.assign(new Error('A valid blog slug is required.'), { status: 400 });
  }
  if (!payload.title?.trim()) {
    throw Object.assign(new Error('Blog title is required.'), { status: 400 });
  }

  const store = await readContentStore();
  store.blogs = store.blogs || {};
  if (store.blogs[slug]) {
    throw Object.assign(new Error('A blog with this slug already exists.'), { status: 409 });
  }

  const now = new Date().toISOString();
  const record = {
    slug,
    source: 'cms',
    title: payload.title.trim(),
    excerpt: payload.excerpt || '',
    category: payload.category || 'Guides',
    author: payload.author || 'UtilityTools Team',
    readTime: payload.readTime || '5 min',
    relatedToolSlug: payload.relatedToolSlug || '',
    content: Array.isArray(payload.content) ? payload.content : [],
    status: payload.status || 'draft',
    scheduledAt: payload.scheduledAt || null,
    date: payload.date || now.slice(0, 10),
    metaTitle: payload.metaTitle || payload.title.trim(),
    metaDescription: payload.metaDescription || payload.excerpt || '',
    keywords: payload.keywords || [],
    robotsIndex: payload.robotsIndex !== false,
    createdAt: now,
    updatedAt: now,
    publishedAt: payload.status === 'published' ? now : null
  };

  store.blogs[slug] = record;
  await writeContentStore(store);
  await logActivity('blog.create', { slug, status: record.status });
  return record;
}

// ── Blog categories ──────────────────────────────────────────────────────────

const DEFAULT_CATEGORIES = ['PDF Tools', 'Image Tools', 'Video & Audio', 'Text & AI', 'Developer', 'Security', 'Guides'];

async function getBlogCategories() {
  const store = await readContentStore();
  const custom = Array.isArray(store.blogCategories) ? store.blogCategories : [];
  // Merge defaults + custom, deduplicate
  const all = [...DEFAULT_CATEGORIES];
  custom.forEach((cat) => { if (!all.includes(cat)) all.push(cat); });
  return all;
}

async function addBlogCategory(name) {
  const trimmed = String(name || '').trim();
  if (!trimmed) throw Object.assign(new Error('Category name is required.'), { status: 400 });
  const store = await readContentStore();
  store.blogCategories = store.blogCategories || [];
  if (DEFAULT_CATEGORIES.includes(trimmed) || store.blogCategories.includes(trimmed)) {
    throw Object.assign(new Error('Category already exists.'), { status: 409 });
  }
  store.blogCategories.push(trimmed);
  await writeContentStore(store, { bumpCache: false });
  await logActivity('blog.category.add', { name: trimmed });
  return trimmed;
}

async function deleteBlogCategory(name) {
  const trimmed = String(name || '').trim();
  if (DEFAULT_CATEGORIES.includes(trimmed)) {
    throw Object.assign(new Error('Built-in categories cannot be deleted.'), { status: 400 });
  }
  const store = await readContentStore();
  store.blogCategories = (store.blogCategories || []).filter((c) => c !== trimmed);
  await writeContentStore(store, { bumpCache: false });
  await logActivity('blog.category.delete', { name: trimmed });
  return { deleted: true, name: trimmed };
}

async function deleteBlog(slug) {
  const store = await readContentStore();
  const existing = store.blogs?.[slug];
  if (!existing) throw Object.assign(new Error('Blog not found.'), { status: 404 });
  if (existing.source !== 'cms') {
    throw Object.assign(new Error('Only custom CMS blogs can be deleted.'), { status: 400 });
  }
  delete store.blogs[slug];
  await writeContentStore(store);
  await logActivity('blog.delete', { slug });
  return { deleted: true, slug };
}

async function listContentSummary() {
  const store = await readContentStore();
  return {
    tools: Object.keys(store.tools || {}),
    blogs: Object.keys(store.blogs || {})
  };
}

module.exports = {
  readContentStore,
  getToolContent,
  saveToolContent,
  getBlogContent,
  saveBlogContent,
  listBlogs,
  createBlog,
  deleteBlog,
  isBlogPublished,
  normalizeSlug,
  listContentSummary,
  getBlogCategories,
  addBlogCategory,
  deleteBlogCategory
};
