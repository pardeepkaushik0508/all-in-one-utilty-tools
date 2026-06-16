/**
 * Blog data is loaded from the database via /api/content/blogs.
 * This module provides backward-compatible helpers for components that
 * previously imported static blog data.
 */
import { fetchRemoteBlogPosts, fetchRemoteBlogPost } from './cms/blogPosts';

export const blogCategories = [
  'PDF Tools',
  'Image Tools',
  'Video & Audio',
  'Text & AI',
  'Developer',
  'Security',
  'Guides'
];

/** @deprecated Static posts removed — use fetchRemoteBlogPosts() */
export const blogPosts = [];

export async function getAllBlogPosts() {
  const { posts } = await fetchRemoteBlogPosts();
  return posts;
}

export async function findBlogBySlug(slug) {
  return fetchRemoteBlogPost(slug);
}

export async function getRelatedPosts(currentSlug, limit = 4) {
  const { posts } = await fetchRemoteBlogPosts();
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

export async function searchBlogPosts(query) {
  const { posts } = await fetchRemoteBlogPosts();
  const q = String(query || '').trim().toLowerCase();
  if (!q) return posts;

  return posts.filter((post) => {
    const contentText = typeof post.content === 'string' ? post.content : '';
    return `${post.title} ${post.excerpt} ${post.category} ${contentText}`.toLowerCase().includes(q);
  });
}
