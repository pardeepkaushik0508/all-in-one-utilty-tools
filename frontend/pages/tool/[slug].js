import Link from 'next/link';
import Layout from '../../components/Layout';
import { rendererBySlug } from '../../components/tools';
import { findToolBySlug, tools } from '../../utils/tools';
import { getCategoryMeta } from '../../utils/categoryMeta';
import { SITE_URL } from '../../components/SEO';

function PlaceholderTool() {
  return (
    <div className="card">
      <p className="text-muted">This tool is not available yet.</p>
    </div>
  );
}

export default function ToolPage({ tool }) {
  if (!tool) {
    return (
      <Layout title="Tool Not Found" noindex canonical="/tool/not-found">
        <div className="card space-y-4 py-16 text-center">
          <h1 className="font-display text-2xl font-bold text-heading">Tool not found</h1>
          <p className="text-muted">The tool you are looking for does not exist.</p>
          <Link href="/" className="btn-primary inline-flex">Return home</Link>
        </div>
      </Layout>
    );
  }

  const ToolRenderer = rendererBySlug[tool.slug] || PlaceholderTool;
  const meta = getCategoryMeta(tool.category);

  const toolJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.description,
    applicationCategory: tool.category,
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    url: `${SITE_URL}/tool/${tool.slug}`
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: tool.name, item: `${SITE_URL}/tool/${tool.slug}` }
    ]
  };

  return (
    <Layout
      title={tool.name}
      description={`${tool.description} Use our free online ${tool.name} tool — fast, secure, and easy.`}
      canonical={`/tool/${tool.slug}`}
      ogType="website"
      jsonLd={[toolJsonLd, breadcrumbJsonLd]}
    >
      <nav aria-label="Breadcrumb" className="animate-fade-up">
        <Link href="/" className="back-link mb-8">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08l-4.158 3.96H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
          All tools
        </Link>
      </nav>

      <header className="card animate-fade-up mb-8" style={{ animationDelay: '80ms' }}>
        <div className="flex items-start gap-4">
          <span className={`icon-box h-14 w-14 ${meta.iconColor}`}>{meta.icon}</span>
          <div className="min-w-0 flex-1">
            <span className="badge">{tool.category}</span>
            <h1 className="mt-3 font-display text-2xl font-bold text-heading sm:text-3xl">{tool.name}</h1>
            <p className="mt-2 max-w-2xl text-body">{tool.description}</p>
          </div>
        </div>
      </header>

      <section aria-label={`${tool.name} tool`}>
        <ToolRenderer />
      </section>
    </Layout>
  );
}

export async function getStaticPaths() {
  return {
    paths: tools.map((tool) => ({ params: { slug: tool.slug } })),
    fallback: 'blocking'
  };
}

export async function getStaticProps({ params }) {
  const tool = findToolBySlug(params.slug) || null;
  return { props: { tool }, revalidate: 60 };
}
