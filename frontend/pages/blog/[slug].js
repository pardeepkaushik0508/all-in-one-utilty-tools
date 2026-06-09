import Link from 'next/link';
import { useState } from 'react';
import Layout from '../../components/Layout';
import BlogSidebar from '../../components/blog/BlogSidebar';
import { SITE_URL } from '../../components/SEO';
import { findBlogBySlug, blogPosts } from '../../utils/blogPosts';
import { tools } from '../../utils/tools';

export default function BlogDetailPage({ post }) {
  const [search, setSearch] = useState('');

  if (!post) {
    return (
      <Layout title="Article Not Found" noindex canonical="/blog/not-found">
        <div className="card py-16 text-center">
          <h1 className="font-display text-2xl font-bold text-heading">Article not found</h1>
          <Link href="/blog" className="btn-primary mt-6 inline-flex">Back to blog</Link>
        </div>
      </Layout>
    );
  }

  const relatedTool = tools.find((t) => t.slug === post.relatedToolSlug);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { '@type': 'Organization', name: post.author },
    url: `${SITE_URL}/blog/${post.slug}`
  };

  return (
    <Layout
      title={post.title}
      description={post.excerpt}
      canonical={`/blog/${post.slug}`}
      ogType="article"
      jsonLd={articleJsonLd}
    >
      <nav aria-label="Breadcrumb" className="animate-fade-up mb-6">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-muted">
          <li><Link href="/" className="hover:text-heading">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/blog" className="hover:text-heading">Blog</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-heading line-clamp-1">{post.title}</li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        <article className="lg:col-span-2">
          <header className="card animate-fade-up mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="blog-category">{post.category}</span>
              <span className="text-xs text-muted">{post.readTime}</span>
            </div>
            <h1 className="font-display text-2xl font-bold leading-tight text-heading sm:text-3xl lg:text-4xl">
              {post.title}
            </h1>
            <p className="mt-4 text-lg text-muted">{post.excerpt}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-theme pt-4 text-sm text-muted">
              <span>{post.author}</span>
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </time>
            </div>
          </header>

          <div className="card blog-article animate-fade-up prose-blog" style={{ animationDelay: '80ms' }}>
            {post.content.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {relatedTool && (
            <div className="card mt-6 animate-fade-up bg-[var(--accent-subtle)]" style={{ animationDelay: '120ms' }}>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">Try it now</p>
              <h2 className="mt-2 font-display text-xl font-bold text-heading">{relatedTool.name}</h2>
              <p className="mt-2 text-sm text-muted">{relatedTool.description}</p>
              <Link href={`/tool/${relatedTool.slug}`} className="btn-primary mt-4 inline-flex">
                Open {relatedTool.name}
              </Link>
            </div>
          )}
        </article>

        <BlogSidebar
          search={search}
          onSearchChange={setSearch}
          currentSlug={post.slug}
          currentCategory={post.category}
          showSearch
        />
      </div>
    </Layout>
  );
}

export async function getStaticPaths() {
  return {
    paths: blogPosts.map((post) => ({ params: { slug: post.slug } })),
    fallback: false
  };
}

export async function getStaticProps({ params }) {
  const post = findBlogBySlug(params.slug);
  return { props: { post } };
}
