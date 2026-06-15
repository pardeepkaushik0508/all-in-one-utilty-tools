import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import Layout from '../../components/Layout';
import BlogCard from '../../components/blog/BlogCard';
import BlogSidebar from '../../components/blog/BlogSidebar';
import { fetchRemoteBlogPosts } from '../../utils/cms/blogPosts';
import { blogPosts as staticBlogPosts } from '../../utils/blogPosts';

// Returns true if the post belongs to the given category
function postMatchesCategory(post, category) {
  if (!category) return true;
  // Check categories array first, fall back to category string
  if (Array.isArray(post.categories) && post.categories.length) {
    return post.categories.includes(category);
  }
  return post.category === category;
}

function filterPosts(posts, search, category) {
  let list = [...posts];
  const q = String(search || '').trim().toLowerCase();

  if (q) {
    list = list.filter((post) => {
      const contentText = Array.isArray(post.content)
        ? post.content.join(' ')
        : (typeof post.content === 'string' ? post.content : '');
      return `${post.title} ${post.excerpt} ${post.category} ${contentText}`
        .toLowerCase()
        .includes(q);
    });
  }

  if (category) {
    list = list.filter((post) => postMatchesCategory(post, category));
  }

  return list;
}

export default function BlogIndexPage({ posts = [] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 250);
  const category = typeof router.query.category === 'string' ? router.query.category : '';

  const visiblePosts = useMemo(
    () => filterPosts(posts, debouncedSearch, category),
    [posts, debouncedSearch, category]
  );

  return (
    <Layout
      title="Blog — Tips & Guides for Online Tools"
      description="Guides, tips, and tutorials for PDF, image, video, AI, developer, and security tools. Learn how to use UtilityTools for free."
      canonical="/blog"
    >
      <header className="seo-divider animate-fade-up mb-10 text-left sm:text-center">
        <div className="seo-divider-glow" />
        <div className="seo-divider-inner !max-w-3xl sm:!text-center">
          <span className="badge">
            <span className="badge-dot" />
            Blog
          </span>
          <h1 className="seo-divider-title mt-4">
            Guides & <span className="gradient-text">insights</span>
          </h1>
          <p className="seo-divider-text">
            Practical articles about every tool on UtilityTools — written to help you work faster.
          </p>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2" aria-label="Blog articles">
          {category && (
            <p className="mb-4 text-sm text-muted">
              Showing <strong className="text-heading">{category}</strong> · {visiblePosts.length} article(s)
              {' · '}
              <button type="button" onClick={() => router.push('/blog')} className="text-[var(--accent)] underline">
                Clear filter
              </button>
            </p>
          )}

          {visiblePosts.length === 0 ? (
            <div className="card py-16 text-center">
              <p className="font-display text-lg font-semibold text-heading">No articles found</p>
              <p className="mt-1 text-sm text-muted">Try a different search or category.</p>
            </div>
          ) : (
            <div className="grid gap-5">
              {visiblePosts.map((post, index) => (
                <div key={post.slug} className="animate-fade-up" style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}>
                  <BlogCard post={post} />
                </div>
              ))}
            </div>
          )}
        </section>

        <BlogSidebar
          posts={posts}
          search={search}
          onSearchChange={setSearch}
          currentCategory={category}
          showSearch
        />
      </div>
    </Layout>
  );
}

export async function getStaticProps() {
  let posts = [];
  try {
    posts = await fetchRemoteBlogPosts();
  } catch {
    // Guaranteed fallback — never ship an empty page
  }
  // If remote fetch returned nothing, use static posts directly
  if (!posts || posts.length === 0) {
    posts = staticBlogPosts.map((p) => ({
      ...p,
      categories: [p.category],
      source: 'static'
    }));
  }
  return { props: { posts }, revalidate: 60 };
}
