import { resolveApiUrl } from '../apiBase';

export function slugifyBlogTitle(title = '') {
  return String(title)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function isPublishedRecord(record = {}) {
  if (record.status === 'draft') return false;
  if (record.status === 'scheduled' && record.scheduledAt) {
    return new Date(record.scheduledAt).getTime() <= Date.now();
  }
  return true;
}

function normalizeCmsBlog(record = {}) {
  const cats = Array.isArray(record.categories) && record.categories.length
    ? record.categories
    : [record.category || 'Guides'];

  return {
    slug: record.slug,
    title: record.title || 'Untitled post',
    excerpt: record.excerpt || '',
    category: cats[0],
    categories: cats,
    date: record.date || record.publishedAt?.slice(0, 10) || record.createdAt?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    readTime: record.readTime || '5 min',
    relatedToolSlug: record.relatedToolSlug || '',
    author: record.author || 'UtilityTools Team',
    content: record.content || '',
    status: record.status || 'published',
    source: 'cms',
    metaTitle: record.metaTitle,
    metaDescription: record.metaDescription,
    canonicalUrl: record.canonicalUrl || '',
    ogTitle: record.ogTitle || '',
    ogDescription: record.ogDescription || '',
    featuredImage: record.featuredImage || '',
    keywords: record.keywords || record.tags || [],
    tags: record.tags || record.keywords || [],
    robotsIndex: record.robotsIndex !== false
  };
}

export function normalizeBlogList(posts = [], { includeDrafts = false } = {}) {
  return (posts || [])
    .filter((record) => includeDrafts || isPublishedRecord(record))
    .map((record) => normalizeCmsBlog(record))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function fetchRemoteBlogPosts({ includeDrafts = false, page = 1, limit = 100 } = {}) {
  try {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    const response = await fetch(resolveApiUrl(`/api/content/blogs?${params}`), {
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) return { posts: [], pagination: null, error: true };
    const data = await response.json();
    return {
      posts: normalizeBlogList(data.posts || [], { includeDrafts }),
      pagination: data.pagination || null,
      error: false
    };
  } catch {
    return { posts: [], pagination: null, error: true };
  }
}

export async function fetchRemoteBlogPost(slug) {
  try {
    const response = await fetch(resolveApiUrl(`/api/content/blogs/${slug}`), {
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.content) return null;
    return normalizeCmsBlog({ slug, ...data.content });
  } catch {
    return null;
  }
}

export async function fetchRemoteBlogSlugs() {
  try {
    const { posts } = await fetchRemoteBlogPosts({ limit: 500 });
    return posts.map((post) => post.slug).filter(Boolean);
  } catch {
    return [];
  }
}

export async function fetchBlogCategories() {
  try {
    const response = await fetch(resolveApiUrl('/api/content/blog-categories'), {
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.categories || [];
  } catch {
    return [];
  }
}

export function getRelatedPostsFromList(posts, currentSlug, limit = 4) {
  const current = posts.find((post) => post.slug === currentSlug);
  if (!current) return posts.slice(0, limit);

  return posts
    .filter((post) => post.slug !== currentSlug)
    .sort((a, b) => {
      const aScore = a.category === current.category ? 2 : 0;
      const bScore = b.category === current.category ? 2 : 0;
      return bScore - aScore;
    })
    .slice(0, limit);
}
