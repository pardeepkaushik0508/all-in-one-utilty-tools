import Link from 'next/link';
import { useState } from 'react';
import Layout from '../../components/Layout';
import BlogSidebar from '../../components/blog/BlogSidebar';
import BlogTableOfContents from '../../components/blog/BlogTableOfContents';
import RelatedArticles from '../../components/blog/RelatedArticles';
import SocialShare from '../../components/blog/SocialShare';
import FaqAccordion from '../../components/seo/FaqAccordion';
import { SITE_URL } from '../../components/SEO';
import { enhanceBlogPost } from '../../utils/seo/blogEnhancer';
import { buildBlogPostingSchema, buildBreadcrumbSchema, buildFaqSchema } from '../../utils/seo/schema';
import { blogPosts } from '../../utils/blogPosts';
import { fetchRemoteBlogPost, fetchRemoteBlogSlugs, getRelatedPostsFromList, fetchRemoteBlogPosts } from '../../utils/cms/blogPosts';
import { tools } from '../../utils/tools';

function AuthorAvatar({ name }) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return <span className="blog-author-avatar" aria-hidden>{initials}</span>;
}

export default function BlogDetailPage({ post, enhanced, allPosts = [] }) {
  const [search, setSearch] = useState('');

  if (!post || !enhanced) {
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
  const faqSection = enhanced.sections.find((section) => section.id === 'faq');

  const jsonLd = [
    buildBlogPostingSchema(post, {
      featuredImage: `${SITE_URL}/og-default.svg`,
      wordCount: enhanced.wordCount
    }),
    buildBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Blog', url: `${SITE_URL}/blog` },
      { name: post.title, url: `${SITE_URL}/blog/${post.slug}` }
    ]),
    faqSection?.faqs ? buildFaqSchema(faqSection.faqs) : null
  ].filter(Boolean);

  return (
    <Layout
      title={post.title}
      description={post.excerpt}
      keywords={[post.category, post.title, 'utility tools guide', 'free online tools']}
      canonical={`/blog/${post.slug}`}
      ogType="article"
      ogImage={`${SITE_URL}/og-default.svg`}
      jsonLd={jsonLd}
    >
      <nav aria-label="Breadcrumb" className="breadcrumb-modern animate-fade-up mb-6">
        <Link href="/">Home</Link>
        <span className="breadcrumb-sep" aria-hidden>/</span>
        <Link href="/blog">Blog</Link>
        <span className="breadcrumb-sep" aria-hidden>/</span>
        <span className="text-heading line-clamp-1">{post.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        <article className="lg:col-span-2">
          <header className="blog-hero animate-fade-up mb-6">
            <div className={`blog-hero-gradient bg-gradient-to-br ${enhanced.featuredImageGradient}`}>
              <div className={`blog-hero-glow bg-gradient-to-br ${enhanced.featuredImageGradient}`} />
              <div className="blog-hero-content">
                <div className="blog-hero-meta">
                  <span className="blog-category">{post.category}</span>
                  <span className="blog-hero-chip">{post.readTime}</span>
                  <span className="blog-hero-chip">{enhanced.wordCount} words</span>
                </div>
                <h1 className="blog-hero-title">{post.title}</h1>
                <p className="blog-hero-excerpt">{post.excerpt}</p>
              </div>
            </div>
            <div className="blog-hero-author-bar">
              <div className="blog-hero-author">
                <AuthorAvatar name={post.author} />
                <div>
                  <p className="blog-card-author-name">{post.author}</p>
                  <time className="blog-card-date" dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </time>
                </div>
              </div>
            </div>
          </header>

          <div className="mb-6 lg:hidden">
            <BlogTableOfContents items={enhanced.tableOfContents} />
          </div>

          <div className="space-y-6">
            {enhanced.sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                className="blog-section-card blog-article scroll-mt-28 animate-fade-up"
                style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
              >
                <h2 className="blog-section-heading">{section.heading}</h2>
                <div className="prose-blog mt-5 space-y-4">
                  {/* Rich-text HTML from TipTap editor */}
                  {section.htmlContent ? (
                    <div
                      className="prose-blog-html"
                      dangerouslySetInnerHTML={{ __html: section.htmlContent }}
                    />
                  ) : (
                    section.paragraphs.map((paragraph) => (
                      <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                    ))
                  )}
                  {section.faqs && <div className="mt-6"><FaqAccordion faqs={section.faqs} /></div>}
                </div>
              </section>
            ))}
          </div>

          <div className="blog-cta-banner mt-6 animate-fade-up">
            <div className="blog-cta-banner-glow" />
            <div className="blog-cta-banner-inner">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">Ready to try it?</p>
                <h2 className="mt-2 font-display text-xl font-bold text-heading sm:text-2xl">{enhanced.cta.title}</h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{enhanced.cta.description}</p>
              </div>
              <Link href={enhanced.cta.href} className="btn-primary shrink-0">
                Open tool
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>

          {relatedTool && (
            <div className="seo-section mt-6 animate-fade-up">
              <div className="seo-section-header">
                <div className="seo-section-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                    <path d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <h2 className="seo-section-title">Try {relatedTool.name}</h2>
                  <p className="seo-section-subtitle">{relatedTool.description}</p>
                </div>
              </div>
              <Link href={`/tool/${relatedTool.slug}`} className="btn-primary mt-2 inline-flex">
                Open {relatedTool.name}
              </Link>
            </div>
          )}

          <div className="mt-6">
            <RelatedArticles posts={enhanced.relatedPosts} />
          </div>
        </article>

        <div className="space-y-5">
          <div className="hidden lg:block">
            <BlogTableOfContents items={enhanced.tableOfContents} />
          </div>
          <SocialShare title={post.title} path={`/blog/${post.slug}`} />
          <BlogSidebar
            posts={allPosts}
            search={search}
            onSearchChange={setSearch}
            currentSlug={post.slug}
            currentCategory={post.category}
            showSearch
          />
        </div>
      </div>
    </Layout>
  );
}

export async function getStaticPaths() {
  const remoteSlugs = await fetchRemoteBlogSlugs();
  const slugs = [...new Set([...blogPosts.map((post) => post.slug), ...remoteSlugs])];
  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: 'blocking'
  };
}

export async function getStaticProps({ params }) {
  const post = await fetchRemoteBlogPost(params.slug);
  if (!post) return { notFound: true, revalidate: 60 };

  const allPosts = await fetchRemoteBlogPosts();
  const relatedPosts = getRelatedPostsFromList(allPosts, post.slug, 4);
  const enhanced = enhanceBlogPost(post, relatedPosts);

  return { props: { post, enhanced, allPosts }, revalidate: 60 };
}
