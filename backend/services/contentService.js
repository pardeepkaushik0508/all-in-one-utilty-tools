const {
  readContentStore,
  writeContentStore,
  logActivity
} = require('./cmsService');

const { getPrisma } = require('../prisma/client');


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
  try {
    const prisma = getPrisma();
    const blog = await prisma.blog.findUnique({ where: { slug } });

    if (!blog) return null;

    // Keep existing response shape expected by frontend/admin UI
    return {
      slug: blog.slug,
      title: blog.title,
      excerpt: blog.excerpt || '',
      category: blog.category || 'Guides',
      categories: blog.category ? [blog.category] : ['Guides'],
      author: 'UtilityTools Team',
      readTime: '5 min',
      relatedToolSlug: '',
      content: blog.content || '',
      status: blog.status || 'draft',
      scheduledAt: null,
      date: blog.createdAt ? blog.createdAt.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      // SEO-like extras (legacy UI stores these in form)
      metaTitle: blog.title,
      metaDescription: blog.excerpt || '',
      keywords: Array.isArray(blog.tags) ? blog.tags : [],
      canonicalUrl: '',
      ogTitle: blog.title,
      ogDescription: blog.excerpt || '',
      featuredImage: blog.featuredImage || '',
      robotsIndex: true,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
      publishedAt: blog.status === 'published' ? blog.updatedAt : null,
      source: 'cms'
    };
  } catch (err) {
    console.error('getBlogContent db error:', err);
    throw err;
  }
}

async function saveBlogContent(slug, payload) {
  try {
    const prisma = getPrisma();

    const now = new Date().toISOString();

    const categories = Array.isArray(payload.categories) && payload.categories.length
      ? payload.categories
      : (payload.category ? [payload.category] : ['Guides']);

    // Only category name/reference is stored; categories array stays implicit
    const category = categories[0] || 'Guides';

    const tags = payload.tags !== undefined
      ? payload.tags
      : (payload.keywords !== undefined ? payload.keywords : []);

    const content = Array.isArray(payload.content)
      ? payload.content.join('')
      : (payload.contentHtml || payload.content || '');

    const updated = await prisma.blog.update({
      where: { slug },
      data: {
        title: payload.title?.trim() || undefined,
        content,
        excerpt: payload.excerpt || '',
        featuredImage: payload.featuredImage || null,
        category: category || null,
        tags: tags || [],
        status: payload.status || 'draft',
        updatedAt: now
      }
    });

    return getBlogContent(updated.slug);
  } catch (err) {
    console.error('saveBlogContent db error:', err);
    // If record doesn't exist, surface a meaningful 404 to admin UI
    if (String(err?.code || '').includes('P2025')) {
      throw Object.assign(new Error('Blog not found.'), { status: 404 });
    }
    throw err;
  }
}

async function listBlogs({ includeDrafts = true, page = 1, limit = 20 } = {}) {
  const prisma = getPrisma();
  const take = Math.max(1, Number(limit) || 20);
  const skip = Math.max(0, (Number(page) - 1) * take);

  const where = includeDrafts ? {} : { status: 'published' };

  const blogs = await prisma.blog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip,
    take
  });

  return blogs.map((blog) => ({
    slug: blog.slug,
    title: blog.title,
    excerpt: blog.excerpt || '',
    category: blog.category || 'Guides',
    categories: blog.category ? [blog.category] : ['Guides'],
    author: 'UtilityTools Team',
    readTime: '5 min',
    relatedToolSlug: '',
    content: blog.content || '',
    status: blog.status || 'draft',
    scheduledAt: null,
    date: blog.createdAt ? blog.createdAt.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    metaTitle: blog.title,
    metaDescription: blog.excerpt || '',
    keywords: Array.isArray(blog.tags) ? blog.tags : [],
    canonicalUrl: '',
    ogTitle: blog.title,
    ogDescription: blog.excerpt || '',
    featuredImage: blog.featuredImage || '',
    robotsIndex: true,
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
    publishedAt: blog.status === 'published' ? blog.updatedAt : null,
    source: 'cms'
  }));
}

async function createBlog(payload = {}) {
  const slug = normalizeSlug(payload.slug || payload.title);
  if (!slug) {
    throw Object.assign(new Error('A valid blog slug is required.'), { status: 400 });
  }
  if (!payload.title?.trim()) {
    throw Object.assign(new Error('Blog title is required.'), { status: 400 });
  }

  try {
    const prisma = getPrisma();

    const categories = Array.isArray(payload.categories) && payload.categories.length
      ? payload.categories
      : (payload.category ? [payload.category] : ['Guides']);
    const category = categories[0] || 'Guides';

    const tags = payload.tags !== undefined
      ? payload.tags
      : (payload.keywords !== undefined ? payload.keywords : []);

    const content = Array.isArray(payload.content)
      ? payload.content.join('')
      : (payload.contentHtml || payload.content || '');

    const now = new Date().toISOString();

    const created = await prisma.blog.create({
      data: {
        title: payload.title.trim(),
        slug,
        content,
        excerpt: payload.excerpt || '',
        featuredImage: payload.featuredImage || null,
        category: category || null,
        tags: tags || [],
        status: payload.status || 'draft',
        createdAt: now,
        updatedAt: now
      }
    });

    await logActivity('blog.create', { slug, status: created.status });

    return getBlogContent(created.slug);
  } catch (err) {
    console.error('createBlog db error:', err);
    if (String(err?.code || '').includes('P2002')) {
      throw Object.assign(new Error('A blog with this slug already exists.'), { status: 409 });
    }
    throw err;
  }
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
  try {
    const prisma = getPrisma();
    // Keep legacy behavior: only delete custom CMS records. Since DB now only stores CMS blogs,
    // treat existing row as deletable.
    const deleted = await prisma.blog.delete({ where: { slug } });
    await logActivity('blog.delete', { slug: deleted.slug });
    return { deleted: true, slug: deleted.slug };
  } catch (err) {
    if (String(err?.code || '').includes('P2025')) {
      throw Object.assign(new Error('Blog not found.'), { status: 404 });
    }
    throw err;
  }
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
