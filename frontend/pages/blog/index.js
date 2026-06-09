import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import BlogCard from '../../components/blog/BlogCard';
import BlogSidebar from '../../components/blog/BlogSidebar';
import { getAllBlogPosts, searchBlogPosts } from '../../utils/blogPosts';

export default function BlogIndexPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const category = typeof router.query.category === 'string' ? router.query.category : '';

  const posts = useMemo(() => {
    let list = search ? searchBlogPosts(search) : getAllBlogPosts();
    if (category) list = list.filter((p) => p.category === category);
    return list;
  }, [search, category]);

  return (
    <Layout
      title="Blog — Tips & Guides for Online Tools"
      description="Guides, tips, and tutorials for PDF, image, video, AI, developer, and security tools. Learn how to use UtilityTools for free."
      canonical="/blog"
    >
      <header className="animate-fade-up mb-10">
        <span className="badge">Blog</span>
        <h1 className="section-title mt-4">
          Guides & <span className="gradient-text">insights</span>
        </h1>
        <p className="section-subtitle mt-4 max-w-2xl">
          Practical articles about every tool on UtilityTools — written to help you work faster.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2" aria-label="Blog articles">
          {category && (
            <p className="mb-4 text-sm text-muted">
              Showing <strong className="text-heading">{category}</strong> · {posts.length} article(s)
              {' · '}
              <button type="button" onClick={() => router.push('/blog')} className="text-[var(--accent)] underline">
                Clear filter
              </button>
            </p>
          )}

          {posts.length === 0 ? (
            <div className="card py-16 text-center">
              <p className="font-display text-lg font-semibold text-heading">No articles found</p>
              <p className="mt-1 text-sm text-muted">Try a different search or category.</p>
            </div>
          ) : (
            <div className="grid gap-5">
              {posts.map((post, index) => (
                <div key={post.slug} className="animate-fade-up" style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}>
                  <BlogCard post={post} />
                </div>
              ))}
            </div>
          )}
        </section>

        <BlogSidebar
          search={search}
          onSearchChange={setSearch}
          currentCategory={category}
          showSearch
        />
      </div>
    </Layout>
  );
}
