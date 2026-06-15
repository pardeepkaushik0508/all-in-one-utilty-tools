import { blogPosts } from '../blogPosts';
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

function normalizeCmsBlog(slug, record = {}) {
  const cats = Array.isArray(record.categories) && record.categories.length
    ? record.categories
    : [record.category || 'Guides'];

  return {
    slug,
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
    source: record.source || 'cms',
    metaTitle: record.metaTitle,
    metaDescription: record.metaDescription,
    canonicalUrl: record.canonicalUrl || '',
    ogTitle: record.ogTitle || '',
    ogDescription: record.ogDescription || '',
    featuredImage: record.featuredImage || '',
    keywords: record.keywords || [],
    robotsIndex: record.robotsIndex !== false
  };
}

export function mergeBlogPost(staticPost, cmsRecord = null) {
  if (!staticPost && !cmsRecord) return null;
  if (!staticPost) return normalizeCmsBlog(cmsRecord.slug, cmsRecord);
  if (!cmsRecord) return { ...staticPost, source: 'static' };

  return normalizeCmsBlog(staticPost.slug, {
    ...staticPost,
    ...cmsRecord,
    content: cmsRecord.content?.length ? cmsRecord.content : staticPost.content,
    date: cmsRecord.date || staticPost.date,
    source: cmsRecord.source === 'cms' ? 'cms' : 'static'
  });
}

export function mergeBlogCatalog(staticList = blogPosts, cmsPosts = [], { includeDrafts = false } = {}) {
  const map = new Map(staticList.map((post) => [post.slug, { ...post, source: 'static' }]));

  cmsPosts.forEach((record) => {
    const slug = record.slug;
    if (!slug) return;

    if (record.source === 'cms') {
      if (includeDrafts || isPublishedRecord(record)) {
        map.set(slug, normalizeCmsBlog(slug, record));
      }
      return;
    }

    if (map.has(slug)) {
      if (!includeDrafts && !isPublishedRecord(record)) {
        map.delete(slug);
        return;
      }
      map.set(slug, mergeBlogPost(map.get(slug), record));
    }
  });

  return [...map.values()].sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function fetchRemoteBlogPosts({ includeDrafts = false } = {}) {
  try {
    const response = await fetch(resolveApiUrl('/api/content/blogs'), {
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) return mergeBlogCatalog(blogPosts, [], { includeDrafts });
    const data = await response.json();
    return mergeBlogCatalog(blogPosts, data.posts || [], { includeDrafts });
  } catch {
    // Always fall back to static posts so the page never shows empty
    return mergeBlogCatalog(blogPosts, [], { includeDrafts });
  }
}

export async function fetchRemoteBlogPost(slug) {
  try {
    const response = await fetch(resolveApiUrl(`/api/content/blogs/${slug}`), {
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) return null;
    const data = await response.json();
    const staticPost = blogPosts.find((post) => post.slug === slug) || null;
    if (!data.content) return staticPost;
    return mergeBlogPost(staticPost, { slug, ...data.content });
  } catch {
    return blogPosts.find((post) => post.slug === slug) || null;
  }
}

export async function fetchRemoteBlogSlugs() {
  try {
    const response = await fetch(resolveApiUrl('/api/content/blogs'), {
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) return [];
    const data = await response.json();
    return (data.posts || []).map((post) => post.slug).filter(Boolean);
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
