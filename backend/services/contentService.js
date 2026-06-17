const { logActivity } = require('./cmsService');
const { connectDb } = require('../db/connection');
const { Blog, BlogCategory, Tag, BlogTag, ToolSeoContent } = require('../db/models');
const { enrichBlog } = require('../db/blogHelpers');
const { slugify, wrapDbError, isDuplicateKeyError } = require('./dbHelpers');

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
  const date = createdAt ? new Date(createdAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);

  return {
    id: blog.id || blog._id,
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
    scheduledAt: blog.scheduledAt ? new Date(blog.scheduledAt).toISOString() : null,
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
    createdAt: createdAt instanceof Date ? createdAt.toISOString() : createdAt,
    updatedAt: updatedAt instanceof Date ? updatedAt.toISOString() : updatedAt,
    publishedAt: blog.publishedAt
      ? new Date(blog.publishedAt).toISOString()
      : (blog.status === 'published' ? (updatedAt instanceof Date ? updatedAt.toISOString() : updatedAt) : null),
    source: 'cms'
  };
}

async function resolveCategoryRecord(categoryName) {
  await connectDb();
  const name = String(categoryName || 'Guides').trim() || 'Guides';
  const catSlug = slugifyCategory(name);

  let category = await BlogCategory.findOne({ $or: [{ slug: catSlug }, { name }] }).lean();

  if (!category) {
    category = await BlogCategory.create({
      name,
      slug: catSlug,
      description: '',
      status: 'active',
      isBuiltin: false
    });
    category = category.toObject();
  }

  return category;
}

async function syncBlogTags(blogId, tagNames = []) {
  await connectDb();
  const names = [...new Set((tagNames || []).map((t) => String(t).trim()).filter(Boolean))];

  await BlogTag.deleteMany({ blogId });

  for (const name of names) {
    const tagSlug = slugify(name);
    let tag = await Tag.findOne({ slug: tagSlug }).lean();
    if (!tag) {
      const created = await Tag.create({ name, slug: tagSlug });
      tag = created.toObject();
    } else {
      await Tag.findByIdAndUpdate(tag._id, { name });
    }
    await BlogTag.create({ blogId, tagId: tag._id });
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

function parseOptionalDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function omitUndefined(obj = {}) {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));
}

function buildBlogData(payload = {}, { isCreate = false } = {}) {
  const categories = Array.isArray(payload.categories) && payload.categories.length
    ? payload.categories
    : (payload.category ? [payload.category] : ['Guides']);
  const categoryName = categories[0] || 'Guides';
  const tagNames = extractTagNames(payload);
  const status = payload.status || 'draft';
  const now = new Date();

  const data = omitUndefined({
    title: payload.title?.trim() || undefined,
    content: normalizeContent(payload),
    excerpt: payload.excerpt || '',
    featuredImage: payload.featuredImage || null,
    author: payload.author || 'UtilityTools Team',
    readTime: payload.readTime || '5 min',
    relatedToolSlug: payload.relatedToolSlug || null,
    category: categoryName,
    status,
    scheduledAt: parseOptionalDate(payload.scheduledAt),
    metaTitle: payload.metaTitle || payload.title?.trim() || undefined,
    metaDescription: payload.metaDescription || payload.excerpt || '',
    keywords: tagNames,
    canonicalUrl: payload.canonicalUrl || '',
    ogTitle: payload.ogTitle || payload.metaTitle || payload.title?.trim() || undefined,
    ogDescription: payload.ogDescription || payload.metaDescription || payload.excerpt || '',
    robotsIndex: payload.robotsIndex !== false
  });

  if (status === 'published') {
    data.publishedAt = parseOptionalDate(payload.publishedAt) || now;
  } else if (status === 'draft') {
    data.publishedAt = null;
  }

  if (isCreate) {
    data.createdAt = parseOptionalDate(payload.date) || now;
  }

  return { data, categoryName, tagNames };
}

async function getToolContent(slug) {
  try {
    await connectDb();
    const row = await ToolSeoContent.findById(slug).lean();
    return row?.data || null;
  } catch (error) {
    throw wrapDbError(error, 'Failed to load tool SEO content.');
  }
}

async function saveToolContent(slug, payload) {
  try {
    await connectDb();
    const existing = await ToolSeoContent.findById(slug).lean();
    const next = {
      ...(existing?.data || {}),
      ...payload,
      updatedAt: new Date().toISOString()
    };

    await ToolSeoContent.findOneAndUpdate(
      { slug },
      { $set: { _id: slug, slug, data: next } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await logActivity('seo.tool.save', { slug });
    return next;
  } catch (error) {
    throw wrapDbError(error, 'Failed to save tool SEO content.');
  }
}

async function getBlogContent(slug) {
  try {
    await connectDb();
    const blog = await Blog.findOne({ slug }).lean();
    const enriched = await enrichBlog(blog);
    return formatBlogRecord(enriched);
  } catch (error) {
    throw wrapDbError(error, 'Failed to load blog.');
  }
}

async function saveBlogContent(slug, payload) {
  try {
    await connectDb();
    const { data, categoryName, tagNames } = buildBlogData(payload);
    const category = await resolveCategoryRecord(categoryName);

    const updated = await Blog.findOneAndUpdate(
      { slug },
      { $set: { ...data, categoryId: category._id } },
      { new: true }
    ).lean();

    if (!updated) {
      throw Object.assign(new Error('Blog not found.'), { status: 404 });
    }

    await syncBlogTags(updated._id, tagNames);
    const refreshed = await enrichBlog(await Blog.findOne({ slug }).lean());
    await logActivity('blog.update', { slug });
    return formatBlogRecord(refreshed);
  } catch (error) {
    if (error?.status === 404) throw error;
    throw wrapDbError(error, 'Failed to save blog.');
  }
}

async function listBlogs({ includeDrafts = true, page = 1, limit = 20 } = {}) {
  try {
    await connectDb();
    const take = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = Math.max(0, (Number(page) - 1) * take);

    const filter = includeDrafts ? {} : { status: 'published' };

    const [blogs, total] = await Promise.all([
      Blog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(take).lean(),
      Blog.countDocuments(filter)
    ]);

    const enriched = await Promise.all(blogs.map((blog) => enrichBlog(blog)));

    return {
      posts: enriched.map(formatBlogRecord),
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
    await connectDb();
    const { data, categoryName, tagNames } = buildBlogData(payload, { isCreate: true });
    const category = await resolveCategoryRecord(categoryName);

    const created = await Blog.create({
      ...data,
      slug,
      title: payload.title.trim(),
      categoryId: category._id
    });

    await syncBlogTags(created._id, tagNames);
    await logActivity('blog.create', { slug, status: created.status });

    const refreshed = await enrichBlog(await Blog.findOne({ slug }).lean());
    return formatBlogRecord(refreshed);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw Object.assign(new Error('A blog with this slug already exists.'), { status: 409 });
    }
    throw wrapDbError(error, 'Failed to create blog.');
  }
}

async function deleteBlog(slug) {
  try {
    await connectDb();
    const deleted = await Blog.findOneAndDelete({ slug }).lean();
    if (!deleted) {
      throw Object.assign(new Error('Blog not found.'), { status: 404 });
    }
    await BlogTag.deleteMany({ blogId: deleted._id });
    await logActivity('blog.delete', { slug: deleted.slug });
    return { deleted: true, slug: deleted.slug };
  } catch (error) {
    if (error?.status === 404) throw error;
    throw wrapDbError(error, 'Failed to delete blog.');
  }
}

async function ensureDefaultCategories() {
  await connectDb();
  for (const cat of DEFAULT_CATEGORIES) {
    await BlogCategory.findOneAndUpdate(
      { slug: cat.slug },
      {
        $set: {
          name: cat.name,
          description: cat.description,
          status: cat.status,
          isBuiltin: cat.isBuiltin
        },
        $setOnInsert: { slug: cat.slug }
      },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }
}

async function getBlogCategories() {
  await ensureDefaultCategories();
  await connectDb();
  const categories = await BlogCategory.find().sort({ name: 1 }).lean();
  return categories.map((cat) => ({
    id: cat._id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    status: cat.status,
    isBuiltin: cat.isBuiltin,
    createdAt: cat.createdAt?.toISOString?.(),
    updatedAt: cat.updatedAt?.toISOString?.()
  }));
}

async function addBlogCategory(data = {}) {
  const name = String(data.name || data || '').trim();
  if (!name) throw Object.assign(new Error('Category name is required.'), { status: 400 });

  const slug = data.slug ? String(data.slug).trim() : slugifyCategory(name);
  if (!slug) throw Object.assign(new Error('Invalid category slug.'), { status: 400 });

  await connectDb();
  const existing = await BlogCategory.findOne({ $or: [{ slug }, { name }] }).lean();
  if (existing) {
    throw Object.assign(new Error('Category already exists.'), { status: 409 });
  }

  const record = await BlogCategory.create({
    name,
    slug,
    description: String(data.description || '').trim(),
    status: data.status === 'inactive' ? 'inactive' : 'active',
    isBuiltin: false
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
  await connectDb();
  const existing = await BlogCategory.findOne({ slug: trimmedSlug }).lean();
  if (!existing) throw Object.assign(new Error('Category not found.'), { status: 404 });
  if (existing.isBuiltin && (data.name || data.slug)) {
    throw Object.assign(new Error('Built-in categories cannot be renamed.'), { status: 400 });
  }

  const updated = await BlogCategory.findOneAndUpdate(
    { slug: trimmedSlug },
    {
      $set: omitUndefined({
        name: data.name ? String(data.name).trim() : undefined,
        description: data.description !== undefined ? String(data.description).trim() : undefined,
        status: data.status === 'inactive' ? 'inactive' : data.status === 'active' ? 'active' : undefined
      })
    },
    { new: true }
  ).lean();

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
  await connectDb();
  const existing = await BlogCategory.findOne({ slug: trimmed }).lean();
  if (!existing) throw Object.assign(new Error('Category not found.'), { status: 404 });
  if (existing.isBuiltin) {
    throw Object.assign(new Error('Built-in categories cannot be deleted.'), { status: 400 });
  }

  await BlogCategory.findOneAndDelete({ slug: trimmed });
  await logActivity('blog.category.delete', { slug: trimmed });
  return { deleted: true, slug: trimmed };
}

async function listContentSummary() {
  await connectDb();
  const [toolSeo, blogCount] = await Promise.all([
    ToolSeoContent.find().select('slug').lean(),
    Blog.find().select('slug').lean()
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
