import Link from 'next/link';

export default function BlogCard({ post }) {
  return (
    <article className="blog-card group">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="blog-category">{post.category}</span>
        <span className="text-xs text-muted">{post.readTime}</span>
      </div>
      <h2 className="blog-card-title group-hover:text-[var(--accent)]">
        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
      </h2>
      <p className="blog-card-excerpt">{post.excerpt}</p>
      <div className="mt-5 flex items-center justify-between border-t border-theme pt-4">
        <time className="text-xs text-muted" dateTime={post.date}>
          {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </time>
        <Link href={`/blog/${post.slug}`} className="tool-card-link group-hover:gap-3">
          Read article
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 transition-transform group-hover:translate-x-0.5">
            <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
