import Link from 'next/link';

const CATEGORY_GRADIENTS = {
  'PDF Tools': 'from-rose-500/30 to-orange-500/10',
  'Image Tools': 'from-violet-500/30 to-fuchsia-500/10',
  'Video & Audio': 'from-cyan-500/30 to-blue-500/10',
  'Text & AI': 'from-emerald-500/30 to-teal-500/10',
  Developer: 'from-slate-500/30 to-zinc-500/10',
  Security: 'from-amber-500/30 to-yellow-500/10',
  Guides: 'from-indigo-500/30 to-purple-500/10'
};

export default function RelatedArticles({ posts = [] }) {
  if (!posts.length) return null;

  return (
    <section className="related-articles">
      <div className="related-articles-header">
        <h2 className="font-display text-xl font-bold text-heading sm:text-2xl">Related articles</h2>
        <p className="mt-1 text-sm text-muted">Continue reading with these hand-picked guides</p>
      </div>
      <div className="related-articles-grid">
        {posts.map((post) => {
          const gradient = CATEGORY_GRADIENTS[post.category] || 'from-violet-500/30 to-indigo-500/10';
          return (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="related-article-card group">
              <div className={`related-article-accent bg-gradient-to-r ${gradient}`} />
              <div className="related-article-body">
                <span className="blog-category">{post.category}</span>
                <p className="related-article-title">{post.title}</p>
                <p className="related-article-excerpt">{post.excerpt}</p>
                <span className="related-article-meta">
                  {post.readTime}
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 transition-transform group-hover:translate-x-1">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
