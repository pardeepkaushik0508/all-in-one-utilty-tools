import Link from 'next/link';
import { useMemo } from 'react';
import SearchBar from '../SearchBar';
import { blogCategories, getAllBlogPosts, searchBlogPosts } from '../../utils/blogPosts';
import { getToolCountLabel } from '../../utils/siteStats';
import { tools } from '../../utils/tools';

export default function BlogSidebar({
  search = '',
  onSearchChange,
  currentSlug,
  currentCategory,
  showSearch = true
}) {
  const filteredPosts = useMemo(() => searchBlogPosts(search), [search]);

  const recentPosts = useMemo(() => {
    const list = search ? filteredPosts : getAllBlogPosts();
    return list.filter((p) => p.slug !== currentSlug).slice(0, 6);
  }, [search, filteredPosts, currentSlug]);

  const currentPost = currentSlug
    ? getAllBlogPosts().find((p) => p.slug === currentSlug)
    : null;

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
            placeholder="Search blog posts..."
          />
          {search && (
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
          {blogCategories.map((cat) => (
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
        <h3 className="sidebar-heading">{search ? 'Search results' : 'Recent articles'}</h3>
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
