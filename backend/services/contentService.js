const { logActivity } = require('./cmsService');
const { getPrisma } = require('../prisma/client');
const { slugify, wrapDbError } = require('./dbHelpers');

const BLOG_INCLUDE = {
  blogCategory: true,
  tags: { include: { tag: true } }
};

const DEFAULT_CATEGORIES = [
  { name: 'PDF Tools', slug: 'pdf-tools', description: 'Guides for PDF merge, split, compress, and more.', status: 'active', isBuiltin: true },
  { name: 'Image Tools', slug: 'image-tools', description: 'Guides for image compression, resizing, and conversion.', status: 'active', isBuiltin: true },
  { name: 'Video & Audio', slug: 'video-audio', description: 'Guides for video/audio extraction, trimming, and downloading.', status: 'active', isBuiltin: true },
  { name: 'Text & AI', slug: 'text-ai', description: 'Guides for AI content generation, grammar, and paraphrasing.', status: 'active', isBuiltin: true },
  { name: 'Developer', slug: 'developer', description: 'Guides for JSON formatting, code minification, and developer tools.', status: 'active', isBuiltin: true },
  { name: 'Security', slug: 'security', description: 'Guides for password generation, hashing, and security tools.', status: 'active', isBuiltin: true },
  { name: 'Guides', slug: 'guides', description: 'General how-to guides for all utility tools.', status: 'active', isBuiltin: true }
];

function normalizeSlug(slug = '') {
  return String(slug)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function slugifyCategory(name = '') {
  return slugify(name);
}

function isBlogPublished(record = {}) {
  if (record.status === 'draft') return false;
  if (record.status === 'scheduled' && record.scheduledAt) {
    return new Date(record.scheduledAt).getTime() <= Date.now();
  }
  return record.status !== 'draft';
}

function formatBlogRecord(blog) {
  if (!blog) return null;

  const categoryName = blog.blogCategory?.name || blog.category || 'Guides';
  const tagNames = (blog.tags || []).map((bt) => bt.tag?.name).filter(Boolean);
  const keywords = Array.isArray(blog.keywords) ? blog.keywords : tagNames;
  const createdAt = blog.createdAt;
  const updatedAt = blog.updatedAt;
  const date = createdAt ? createdAt.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);

  return {
    id: blog.id,
    slug: blog.slug,
    title: blog.title,
    excerpt: blog.excerpt || '',
    category: categoryName,
    categories: [categoryName],
    author: blog.author || 'UtilityTools Team',
    readTime: blog.readTime || '5 min',
    relatedToolSlug: blog.relatedToolSlug || '',
    content: blog.content || '',
    status: blog.status || 'draft',
    scheduledAt: blog.scheduledAt ? blog.scheduledAt.toISOString() : null,
    date,
    metaTitle: blog.metaTitle || blog.title,
    metaDescription: blog.metaDescription || blog.excerpt || '',
    keywords,
    tags: tagNames,
    canonicalUrl: blog.canonicalUrl || '',
    ogTitle: blog.ogTitle || blog.metaTitle || blog.title,
    ogDescription: blog.ogDescription || blog.metaDescription || blog.excerpt || '',
    featuredImage: blog.featuredImage || '',
    robotsIndex: blog.robotsIndex !== false,
    createdAt: createdAt?.toISOString?.() || createdAt,
    updatedAt: updatedAt?.toISOString?.() || updatedAt,
    publishedAt: blog.publishedAt
      ? blog.publishedAt.toISOString()
      : (blog.status === 'published' ? updatedAt?.toISOString?.() : null),
    source: 'cms'
  };
}

async function resolveCategoryRecord(categoryName) {
  const prisma = getPrisma();
  const name = String(categoryName || 'Guides').trim() || 'Guides';
  const catSlug = slugifyCategory(name);

  let category = await prisma.blogCategory.findFirst({
    where: { OR: [{ slug: catSlug }, { name }] }
  });

  if (!category) {
    category = await prisma.blogCategory.create({
      data: {
        name,
        slug: catSlug,
        description: '',
        status: 'active',
        isBuiltin: false
      }
    });
  }

  return category;
}

async function syncBlogTags(blogId, tagNames = []) {
  const prisma = getPrisma();
  const names = [...new Set((tagNames || []).map((t) => String(t).trim()).filter(Boolean))];

  await prisma.blogTag.deleteMany({ where: { blogId } });

  for (const name of names) {
    const tagSlug = slugify(name);
    const tag = await prisma.tag.upsert({
      where: { slug: tagSlug },
      create: { name, slug: tagSlug },
      update: { name }
    });
    await prisma.blogTag.create({ data: { blogId, tagId: tag.id } });
  }
}

function extractTagNames(payload = {}) {
  if (Array.isArray(payload.tags) && payload.tags.length) return payload.tags;
  if (Array.isArray(payload.keywords) && payload.keywords.length) return payload.keywords;
  return [];
}

function normalizeContent(payload = {}) {
  if (Array.isArray(payload.content)) return payload.content.join('');
  return payload.contentHtml || payload.content || '';
}

function buildBlogData(payload = {}, { isCreate = false } = {}) {
  const categories = Array.isArray(payload.categories) && payload.categories.length
    ? payload.categories
    : (payload.category ? [payload.category] : ['Guides']);
  const categoryName = categories[0] || 'Guides';
  const tagNames = extractTagNames(payload);
  const status = payload.status || 'draft';
  const now = new Date();

  const data = {
    title: payload.title?.trim(),
    content: normalizeContent(payload),
    excerpt: payload.excerpt || '',
    featuredImage: payload.featuredImage || null,
    author: payload.author || 'UtilityTools Team',
    readTime: payload.readTime || '5 min',
    relatedToolSlug: payload.relatedToolSlug || null,
    category: categoryName,
    status,
    scheduledAt: payload.scheduledAt ? new Date(payload.scheduledAt) : null,
    metaTitle: payload.metaTitle || payload.title?.trim() || undefined,
    metaDescription: payload.metaDescription || payload.excerpt || '',
    keywords: tagNames,
    canonicalUrl: payload.canonicalUrl || '',
    ogTitle: payload.ogTitle || payload.metaTitle || payload.title?.trim() || undefined,
    ogDescription: payload.ogDescription || payload.metaDescription || payload.excerpt || '',
    robotsIndex: payload.robotsIndex !== false,
    updatedAt: now
  };

  if (status === 'published') {
    data.publishedAt = payload.publishedAt ? new Date(payload.publishedAt) : now;
  } else if (status === 'draft') {
    data.publishedAt = null;
  }

  if (isCreate) {
    data.createdAt = payload.date ? new Date(payload.date) : now;
  }

  return { data, categoryName, tagNames };
}

async function getToolContent(slug) {
  try {
    const prisma = getPrisma();
    const row = await prisma.toolSeoContent.findUnique({ where: { slug } });
    return row?.data || null;
  } catch (error) {
    throw wrapDbError(error, 'Failed to load tool SEO content.');
  }
}

async function saveToolContent(slug, payload) {
  try {
    const prisma = getPrisma();
    const existing = await prisma.toolSeoContent.findUnique({ where: { slug } });
    const next = {
      ...(existing?.data || {}),
      ...payload,
      updatedAt: new Date().toISOString()
    };

    await prisma.toolSeoContent.upsert({
      where: { slug },
      create: { slug, data: next, updatedAt: new Date() },
      update: { data: next, updatedAt: new Date() }
    });

    await logActivity('seo.tool.save', { slug });
    return next;
  } catch (error) {
    throw wrapDbError(error, 'Failed to save tool SEO content.');
  }
}

async function getBlogContent(slug) {
  try {
    const prisma = getPrisma();
    const blog = await prisma.blog.findUnique({
      where: { slug },
      include: BLOG_INCLUDE
    });
    return formatBlogRecord(blog);
  } catch (error) {
    throw wrapDbError(error, 'Failed to load blog.');
  }
}

async function saveBlogContent(slug, payload) {
  try {
    const prisma = getPrisma();
    const { data, categoryName, tagNames } = buildBlogData(payload);
    const category = await resolveCategoryRecord(categoryName);

    const updated = await prisma.blog.update({
      where: { slug },
      data: {
        ...data,
        categoryId: category.id
      },
      include: BLOG_INCLUDE
    });

    await syncBlogTags(updated.id, tagNames);
    const refreshed = await prisma.blog.findUnique({ where: { slug }, include: BLOG_INCLUDE });
    await logActivity('blog.update', { slug });
    return formatBlogRecord(refreshed);
  } catch (error) {
    if (String(error?.code || '').includes('P2025')) {
      throw Object.assign(new Error('Blog not found.'), { status: 404 });
    }
    throw wrapDbError(error, 'Failed to save blog.');
  }
}

async function listBlogs({ includeDrafts = true, page = 1, limit = 20 } = {}) {
  try {
    const prisma = getPrisma();
    const take = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = Math.max(0, (Number(page) - 1) * take);

    const where = includeDrafts ? {} : { status: 'published' };

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: BLOG_INCLUDE
      }),
      prisma.blog.count({ where })
    ]);

    return {
      posts: blogs.map(formatBlogRecord),
      pagination: {
        page: Number(page) || 1,
        limit: take,
        total,
        totalPages: Math.ceil(total / take) || 1
      }
    };
  } catch (error) {
    throw wrapDbError(error, 'Failed to list blogs.');
  }
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
    const { data, categoryName, tagNames } = buildBlogData(payload, { isCreate: true });
    const category = await resolveCategoryRecord(categoryName);

    const created = await prisma.blog.create({
      data: {
        ...data,
        slug,
        title: payload.title.trim(),
        categoryId: category.id
      },
      include: BLOG_INCLUDE
    });

    await syncBlogTags(created.id, tagNames);
    await logActivity('blog.create', { slug, status: created.status });

    const refreshed = await prisma.blog.findUnique({ where: { slug }, include: BLOG_INCLUDE });
    return formatBlogRecord(refreshed);
  } catch (error) {
    if (String(error?.code || '').includes('P2002')) {
      throw Object.assign(new Error('A blog with this slug already exists.'), { status: 409 });
    }
    throw wrapDbError(error, 'Failed to create blog.');
  }
}

async function deleteBlog(slug) {
  try {
    const prisma = getPrisma();
    const deleted = await prisma.blog.delete({ where: { slug } });
    await logActivity('blog.delete', { slug: deleted.slug });
    return { deleted: true, slug: deleted.slug };
  } catch (error) {
    if (String(error?.code || '').includes('P2025')) {
      throw Object.assign(new Error('Blog not found.'), { status: 404 });
    }
    throw wrapDbError(error, 'Failed to delete blog.');
  }
}

async function ensureDefaultCategories() {
  const prisma = getPrisma();
  for (const cat of DEFAULT_CATEGORIES) {
    await prisma.blogCategory.upsert({
      where: { slug: cat.slug },
      create: cat,
      update: { description: cat.description, status: cat.status, isBuiltin: cat.isBuiltin }
    });
  }
}

async function getBlogCategories() {
  await ensureDefaultCategories();
  const prisma = getPrisma();
  const categories = await prisma.blogCategory.findMany({ orderBy: { name: 'asc' } });
  return categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    status: cat.status,
    isBuiltin: cat.isBuiltin,
    createdAt: cat.createdAt?.toISOString(),
    updatedAt: cat.updatedAt?.toISOString()
  }));
}

async function addBlogCategory(data = {}) {
  const name = String(data.name || data || '').trim();
  if (!name) throw Object.assign(new Error('Category name is required.'), { status: 400 });

  const slug = data.slug ? String(data.slug).trim() : slugifyCategory(name);
  if (!slug) throw Object.assign(new Error('Invalid category slug.'), { status: 400 });

  const prisma = getPrisma();
  const existing = await prisma.blogCategory.findFirst({
    where: { OR: [{ slug }, { name }] }
  });
  if (existing) {
    throw Object.assign(new Error('Category already exists.'), { status: 409 });
  }

  const record = await prisma.blogCategory.create({
    data: {
      name,
      slug,
      description: String(data.description || '').trim(),
      status: data.status === 'inactive' ? 'inactive' : 'active',
      isBuiltin: false
    }
  });

  await logActivity('blog.category.add', { name, slug });
  return {
    name: record.name,
    slug: record.slug,
    description: record.description,
    status: record.status,
    createdAt: record.createdAt.toISOString()
  };
}

async function updateBlogCategory(slug, data = {}) {
  const trimmedSlug = String(slug || '').trim();
  const prisma = getPrisma();
  const existing = await prisma.blogCategory.findUnique({ where: { slug: trimmedSlug } });
  if (!existing) throw Object.assign(new Error('Category not found.'), { status: 404 });
  if (existing.isBuiltin && (data.name || data.slug)) {
    throw Object.assign(new Error('Built-in categories cannot be renamed.'), { status: 400 });
  }

  const updated = await prisma.blogCategory.update({
    where: { slug: trimmedSlug },
    data: {
      name: data.name ? String(data.name).trim() : undefined,
      description: data.description !== undefined ? String(data.description).trim() : undefined,
      status: data.status === 'inactive' ? 'inactive' : data.status === 'active' ? 'active' : undefined
    }
  });

  await logActivity('blog.category.update', { slug: trimmedSlug });
  return {
    name: updated.name,
    slug: updated.slug,
    description: updated.description,
    status: updated.status,
    updatedAt: updated.updatedAt.toISOString()
  };
}

async function deleteBlogCategory(slug) {
  const trimmed = String(slug || '').trim();
  const prisma = getPrisma();
  const existing = await prisma.blogCategory.findUnique({ where: { slug: trimmed } });
  if (!existing) throw Object.assign(new Error('Category not found.'), { status: 404 });
  if (existing.isBuiltin) {
    throw Object.assign(new Error('Built-in categories cannot be deleted.'), { status: 400 });
  }

  await prisma.blogCategory.delete({ where: { slug: trimmed } });
  await logActivity('blog.category.delete', { slug: trimmed });
  return { deleted: true, slug: trimmed };
}

async function listContentSummary() {
  const prisma = getPrisma();
  const [toolSeo, blogCount] = await Promise.all([
    prisma.toolSeoContent.findMany({ select: { slug: true } }),
    prisma.blog.findMany({ select: { slug: true } })
  ]);
  return {
    tools: toolSeo.map((t) => t.slug),
    blogs: blogCount.map((b) => b.slug)
  };
}

module.exports = {
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
  deleteBlogCategory,
  formatBlogRecord,
  ensureDefaultCategories
};
