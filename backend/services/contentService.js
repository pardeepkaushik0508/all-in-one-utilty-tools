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

  // Normalise categories — keep both `category` (primary) and `categories` (array)
  let categories = existing.categories || (existing.category ? [existing.category] : ['Guides']);
  if (Array.isArray(payload.categories) && payload.categories.length) {
    categories = payload.categories;
  } else if (payload.category) {
    categories = [payload.category];
  }

  store.blogs[slug] = {
    ...existing,
    ...payload,
    slug,
    category: categories[0],
    categories,
    // Extra SEO fields — preserve existing if not in payload
    canonicalUrl: payload.canonicalUrl !== undefined ? payload.canonicalUrl : (existing.canonicalUrl || ''),
    ogTitle: payload.ogTitle !== undefined ? payload.ogTitle : (existing.ogTitle || ''),
    ogDescription: payload.ogDescription !== undefined ? payload.ogDescription : (existing.ogDescription || ''),
    featuredImage: payload.featuredImage !== undefined ? payload.featuredImage : (existing.featuredImage || ''),
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
    // Support both single string and array of categories
    category: Array.isArray(payload.categories) && payload.categories.length
      ? payload.categories[0]
      : (payload.category || 'Guides'),
    categories: Array.isArray(payload.categories) && payload.categories.length
      ? payload.categories
      : [payload.category || 'Guides'],
    author: payload.author || 'UtilityTools Team',
    readTime: payload.readTime || '5 min',
    relatedToolSlug: payload.relatedToolSlug || '',
    content: Array.isArray(payload.content) ? payload.content : (payload.content || ''),
    status: payload.status || 'draft',
    scheduledAt: payload.scheduledAt || null,
    date: payload.date || now.slice(0, 10),
    // SEO
    metaTitle: payload.metaTitle || payload.title.trim(),
    metaDescription: payload.metaDescription || payload.excerpt || '',
    keywords: payload.keywords || [],
    canonicalUrl: payload.canonicalUrl || '',
    ogTitle: payload.ogTitle || payload.metaTitle || payload.title.trim(),
    ogDescription: payload.ogDescription || payload.metaDescription || payload.excerpt || '',
    featuredImage: payload.featuredImage || '',
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

const DEFAULT_CATEGORIES = [
  { name: 'PDF Tools',     slug: 'pdf-tools',     description: 'Guides for PDF merge, split, compress, and more.', status: 'active' },
  { name: 'Image Tools',   slug: 'image-tools',   description: 'Guides for image compression, resizing, and conversion.', status: 'active' },
  { name: 'Video & Audio', slug: 'video-audio',   description: 'Guides for video/audio extraction, trimming, and downloading.', status: 'active' },
  { name: 'Text & AI',     slug: 'text-ai',       description: 'Guides for AI content generation, grammar, and paraphrasing.', status: 'active' },
  { name: 'Developer',     slug: 'developer',     description: 'Guides for JSON formatting, code minification, and developer tools.', status: 'active' },
  { name: 'Security',      slug: 'security',      description: 'Guides for password generation, hashing, and security tools.', status: 'active' },
  { name: 'Guides',        slug: 'guides',        description: 'General how-to guides for all utility tools.', status: 'active' }
];

const DEFAULT_SLUGS = DEFAULT_CATEGORIES.map((c) => c.slug);
const DEFAULT_NAMES = DEFAULT_CATEGORIES.map((c) => c.name);

function slugifyCategory(name = '') {
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function getBlogCategories() {
  const store = await readContentStore();
  const custom = Array.isArray(store.blogCategories) ? store.blogCategories : [];

  // Normalise legacy string entries to objects
  const normalised = custom.map((c) => {
    if (typeof c === 'string') {
      return { name: c, slug: slugifyCategory(c), description: '', status: 'active' };
    }
    return { description: '', status: 'active', ...c };
  });

  // Merge: defaults first, then custom (no duplicates by slug)
  const all = [...DEFAULT_CATEGORIES];
  normalised.forEach((cat) => {
    if (!all.find((d) => d.slug === cat.slug || d.name === cat.name)) all.push(cat);
  });
  return all;
}

async function addBlogCategory(data = {}) {
  const name = String(data.name || data || '').trim();
  if (!name) throw Object.assign(new Error('Category name is required.'), { status: 400 });

  const slug = data.slug ? String(data.slug).trim() : slugifyCategory(name);
  if (!slug) throw Object.assign(new Error('Invalid category slug.'), { status: 400 });

  const store = await readContentStore();
  store.blogCategories = (store.blogCategories || []).map((c) =>
    typeof c === 'string' ? { name: c, slug: slugifyCategory(c), description: '', status: 'active' } : c
  );

  if (DEFAULT_NAMES.includes(name) || DEFAULT_SLUGS.includes(slug)) {
    throw Object.assign(new Error('Category already exists as a default.'), { status: 409 });
  }
  if (store.blogCategories.find((c) => c.slug === slug || c.name === name)) {
    throw Object.assign(new Error('Category already exists.'), { status: 409 });
  }

  const record = {
    name,
    slug,
    description: String(data.description || '').trim(),
    status: data.status === 'inactive' ? 'inactive' : 'active',
    createdAt: new Date().toISOString()
  };

  store.blogCategories.push(record);
  await writeContentStore(store, { bumpCache: false });
  await logActivity('blog.category.add', { name, slug });
  return record;
}

async function updateBlogCategory(slug, data = {}) {
  const trimmedSlug = String(slug || '').trim();
  if (DEFAULT_SLUGS.includes(trimmedSlug)) {
    throw Object.assign(new Error('Built-in categories cannot be edited.'), { status: 400 });
  }
  const store = await readContentStore();
  store.blogCategories = (store.blogCategories || []).map((c) =>
    typeof c === 'string' ? { name: c, slug: slugifyCategory(c), description: '', status: 'active' } : c
  );
  const idx = store.blogCategories.findIndex((c) => c.slug === trimmedSlug);
  if (idx === -1) throw Object.assign(new Error('Category not found.'), { status: 404 });

  store.blogCategories[idx] = {
    ...store.blogCategories[idx],
    name: data.name ? String(data.name).trim() : store.blogCategories[idx].name,
    description: data.description !== undefined ? String(data.description).trim() : store.blogCategories[idx].description,
    status: data.status === 'inactive' ? 'inactive' : 'active',
    updatedAt: new Date().toISOString()
  };

  await writeContentStore(store, { bumpCache: false });
  await logActivity('blog.category.update', { slug: trimmedSlug });
  return store.blogCategories[idx];
}

async function deleteBlogCategory(slug) {
  const trimmed = String(slug || '').trim();
  if (DEFAULT_SLUGS.includes(trimmed)) {
    throw Object.assign(new Error('Built-in categories cannot be deleted.'), { status: 400 });
  }
  const store = await readContentStore();
  store.blogCategories = (store.blogCategories || []).map((c) =>
    typeof c === 'string' ? { name: c, slug: slugifyCategory(c), description: '', status: 'active' } : c
  );
  const existing = store.blogCategories.find((c) => c.slug === trimmed);
  if (!existing) throw Object.assign(new Error('Category not found.'), { status: 404 });

  store.blogCategories = store.blogCategories.filter((c) => c.slug !== trimmed);
  await writeContentStore(store, { bumpCache: false });
  await logActivity('blog.category.delete', { slug: trimmed });
  return { deleted: true, slug: trimmed };
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
  updateBlogCategory,
  deleteBlogCategory
};
