import Link from 'next/link';

const CATEGORY_GRADIENTS = {
  'PDF Tools': 'from-rose-500/40 via-orange-500/20 to-transparent',
  'Image Tools': 'from-violet-500/40 via-fuchsia-500/20 to-transparent',
  'Video & Audio': 'from-cyan-500/40 via-blue-500/20 to-transparent',
  'Text & AI': 'from-emerald-500/40 via-teal-500/20 to-transparent',
  Developer: 'from-slate-500/40 via-zinc-500/20 to-transparent',
  Security: 'from-amber-500/40 via-yellow-500/20 to-transparent',
  Guides: 'from-indigo-500/40 via-purple-500/20 to-transparent'
};

function AuthorAvatar({ name }) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return <span className="blog-author-avatar" aria-hidden>{initials}</span>;
}

export default function BlogCard({ post }) {
  const gradient = CATEGORY_GRADIENTS[post.category] || 'from-violet-500/40 via-indigo-500/20 to-transparent';

  return (
    <article className="blog-card-modern group">
      <div className="blog-card-modern-hero">
        <div className={`blog-card-modern-glow bg-gradient-to-br ${gradient}`} />
        <div className="blog-card-modern-hero-content">
          <div className="flex flex-wrap items-center gap-2">
            <span className="blog-category">{post.category}</span>
            <span className="blog-card-pill">{post.readTime}</span>
          </div>
          <h2 className="blog-card-modern-title">
            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
          </h2>
        </div>
      </div>

      <div className="blog-card-modern-body">
        <p className="blog-card-excerpt">{post.excerpt}</p>
        <div className="blog-card-modern-footer">
          <div className="blog-card-author">
            <AuthorAvatar name={post.author} />
            <div>
              <p className="blog-card-author-name">{post.author}</p>
              <time className="blog-card-date" dateTime={post.date}>
                {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </time>
            </div>
          </div>
          <Link href={`/blog/${post.slug}`} className="blog-card-read-link">
            Read
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
