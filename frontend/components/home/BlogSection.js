import Link from 'next/link';
import BlogCard from '../blog/BlogCard';

export default function BlogSection({ posts }) {
  return (
    <section className="home-blog animate-fade-up" aria-label="Latest blog articles">
      <div className="home-blog-header">
        <div>
          <p className="home-section-eyebrow">Blog</p>
          <h2 className="home-section-title">
            Tips & <span className="gradient-text">guides</span>
          </h2>
          <p className="home-section-desc">
            Practical articles to help you master every tool on the platform.
          </p>
        </div>
        <Link href="/blog" className="btn-secondary home-blog-cta">
          View all articles
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>

      <div className="home-blog-grid">
        {posts.map((post, index) => (
          <div key={post.slug} className="animate-fade-up" style={{ animationDelay: `${index * 60}ms` }}>
            <BlogCard post={post} />
          </div>
        ))}
      </div>
    </section>
  );
}
