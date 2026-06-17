import Link from 'next/link';
import { useMemo } from 'react';
import SearchBar from '../SearchBar';
import { getToolCountLabel } from '../../utils/siteStats';
import { tools } from '../../utils/tools';

function searchInPosts(posts, query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return posts;
  return posts.filter((post) => {
    const contentText = Array.isArray(post.content)
      ? post.content.join(' ')
      : (typeof post.content === 'string' ? post.content : '');
    return `${post.title} ${post.excerpt} ${post.category} ${contentText}`.toLowerCase().includes(q);
  });
}

export default function BlogSidebar({
  posts = [],
  search = '',
  debouncedSearch = '',
  onSearchChange,
  isSearching = false,
  currentSlug,
  currentCategory,
  showSearch = true
}) {
  const activeQuery = debouncedSearch || search;
  const filteredPosts = useMemo(() => searchInPosts(posts, activeQuery), [posts, activeQuery]);

  const recentPosts = useMemo(() => {
    const list = activeQuery.trim() ? filteredPosts : posts;
    return list.filter((p) => p.slug !== currentSlug).slice(0, 6);
  }, [activeQuery, filteredPosts, posts, currentSlug]);

  // Derive categories from actual posts so they always match what's rendered
  const categories = useMemo(() => {
    const seen = new Set();
    const result = [];
    posts.forEach((post) => {
      // Support both multi-category array and single category string
      const cats = Array.isArray(post.categories) && post.categories.length
        ? post.categories
        : [post.category].filter(Boolean);
      cats.forEach((cat) => {
        if (cat && !seen.has(cat)) {
          seen.add(cat);
          result.push(cat);
        }
      });
    });
    return result.sort();
  }, [posts]);

  const currentPost = currentSlug ? posts.find((p) => p.slug === currentSlug) : null;
  const relatedTool = currentPost?.relatedToolSlug
    ? tools.find((t) => t.slug === currentPost.relatedToolSlug)
    : null;

  return (
    <aside className="blog-sidebar space-y-5" aria-label="Blog sidebar">
      {showSearch && (
        <div className="card p-5">
          <h3 className="sidebar-heading">Search articles</h3>
          <SearchBar
            value={search}
            onChange={onSearchChange}
            isLoading={isSearching}
            placeholder="Search blog posts..."
          />
          {activeQuery.trim() && !isSearching && (
            <p className="mt-2 text-xs text-muted">{filteredPosts.length} result(s)</p>
          )}
        </div>
      )}

      <div className="card p-5">
        <h3 className="sidebar-heading">Categories</h3>
        <ul className="space-y-1">
          <li>
            <Link
              href="/blog"
              className={`sidebar-link ${!currentCategory ? 'sidebar-link-active' : ''}`}
            >
              All posts
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat}>
              <Link
                href={`/blog?category=${encodeURIComponent(cat)}`}
                className={`sidebar-link ${currentCategory === cat ? 'sidebar-link-active' : ''}`}
              >
                {cat}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {relatedTool && (
        <div className="card p-5">
          <h3 className="sidebar-heading">Try this tool</h3>
          <p className="text-sm font-semibold text-heading">{relatedTool.name}</p>
          <p className="mt-1 text-xs text-muted">{relatedTool.description}</p>
          <Link href={`/tool/${relatedTool.slug}`} className="btn-primary mt-4 w-full !py-2.5 !text-xs">
            Open {relatedTool.name}
          </Link>
        </div>
      )}

      <div className="card p-5">
        <h3 className="sidebar-heading">{activeQuery.trim() ? 'Search results' : 'Recent articles'}</h3>
        <ul className="space-y-3">
          {recentPosts.length === 0 ? (
            <li className="text-sm text-muted">No articles found.</li>
          ) : (
            recentPosts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className={`block rounded-xl px-3 py-2 text-sm transition-colors hover:bg-[var(--bg-hover)] ${
                    post.slug === currentSlug ? 'bg-[var(--accent-subtle)] font-medium text-heading' : 'text-body'
                  }`}
                >
                  {post.title}
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="card p-5">
        <h3 className="sidebar-heading">Explore tools</h3>
        <p className="text-sm text-muted">{getToolCountLabel()} free utilities — PDF, image, video, AI, and more.</p>
        <Link href="/#tools" className="btn-secondary mt-4 w-full !justify-center">
          Browse all tools
        </Link>
      </div>
    </aside>
  );
}
