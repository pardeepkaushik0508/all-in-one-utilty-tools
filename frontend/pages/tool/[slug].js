import { useEffect } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import ShareButton from '../../components/ShareButton';
import ToolSeoContent from '../../components/seo/ToolSeoContent';
import RelatedTools from '../../components/tools/RelatedTools';
import { rendererBySlug } from '../../components/tools';
import { addRecentTool } from '../../hooks/useRecentTools';
import { trackToolUsage } from '../../hooks/useToolAnalytics';
import { SITE_URL } from '../../components/SEO';
import { fetchRemoteToolSeoOverride, getToolSeoContent } from '../../utils/seo/getToolSeo';
import { fetchRemoteToolSetting } from '../../utils/cms/siteConfig';
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildHowToSchema,
  buildSoftwareApplicationSchema
} from '../../utils/seo/schema';
import { findToolBySlug, tools } from '../../utils/tools';
import { getCategoryMeta } from '../../utils/categoryMeta';
import { getCategoryHref } from '../../utils/siteStats';

function PlaceholderTool() {
  return (
    <div className="card">
      <p className="text-muted">This tool is not available yet.</p>
    </div>
  );
}

export default function ToolPage({ tool, seo, toolSetting = null }) {
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

  const isDisabled = toolSetting?.enabled === false;
  const isMaintenance = toolSetting?.maintenanceMode === true;

  if (isDisabled) {
    return (
      <Layout title={`${tool.name} — Unavailable`} noindex canonical={`/tool/${tool.slug}`}>
        <div className="card space-y-4 py-16 text-center">
          <h1 className="font-display text-2xl font-bold text-heading">{tool.name}</h1>
          <p className="text-muted">This tool is currently unavailable.</p>
          <Link href="/#tools" className="btn-primary inline-flex">Browse other tools</Link>
        </div>
      </Layout>
    );
  }

  const ToolRenderer = rendererBySlug[tool.slug] || PlaceholderTool;
  const meta = getCategoryMeta(tool.category);

  useEffect(() => {
    trackToolUsage(tool.slug);
    addRecentTool(tool);
  }, [tool]);

  const categoryHref = getCategoryHref(tool.category);
  const categoryUrl = categoryHref.startsWith('/') ? `${SITE_URL}${categoryHref}` : categoryHref;

  const breadcrumbJsonLd = buildBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: tool.category, url: categoryUrl },
    { name: tool.name, url: `${SITE_URL}/tool/${tool.slug}` }
  ]);

  const jsonLd = [
    buildSoftwareApplicationSchema(tool, seo),
    breadcrumbJsonLd,
    buildFaqSchema(seo.faqs),
    buildHowToSchema(tool, seo.howItWorks)
  ].filter(Boolean);

  return (
    <Layout
      title={seo.metaTitle || tool.name}
      description={seo.metaDescription}
      keywords={seo.keywords}
      canonical={`/tool/${tool.slug}`}
      ogType="website"
      ogImage={`${SITE_URL}/og-default.svg`}
      jsonLd={jsonLd}
    >
      <nav aria-label="Breadcrumb" className="breadcrumb-modern animate-fade-up">
        <Link href="/">Home</Link>
        <span className="breadcrumb-sep" aria-hidden>/</span>
        <Link href={categoryHref}>{tool.category}</Link>
        <span className="breadcrumb-sep" aria-hidden>/</span>
        <span className="text-heading">{tool.name}</span>
      </nav>

      <header className="tool-hero animate-fade-up mb-8" style={{ animationDelay: '80ms' }}>
        <div className={`tool-hero-glow bg-gradient-to-br ${meta.gradient}`} />
        <div className="tool-hero-inner">
          <span className={`tool-hero-icon ${meta.iconBg} ${meta.iconColor}`}>{meta.icon}</span>
          <div className="min-w-0 flex-1">
            <span className="badge">{tool.category}</span>
            <h1 className="tool-hero-title">{tool.name}</h1>
            <p className="tool-hero-desc">{tool.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <ShareButton title={tool.name} />
            </div>
          </div>
        </div>
      </header>

      <section aria-label={`${tool.name} tool`}>
        {isMaintenance ? (
          <div className="card space-y-3 py-10 text-center">
            <h2 className="font-display text-xl font-semibold text-heading">Under maintenance</h2>
            <p className="text-muted">
              {toolSetting?.maintenanceMessage || 'This tool is temporarily unavailable for maintenance.'}
            </p>
          </div>
        ) : (
          <ToolRenderer />
        )}
      </section>

      <RelatedTools tool={tool} />

      <ToolSeoContent tool={tool} seo={seo} />
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
  if (!tool) return { props: { tool: null, seo: null }, revalidate: 60 };

  const remoteOverride = await fetchRemoteToolSeoOverride(tool.slug);
  const seo = getToolSeoContent(tool, remoteOverride);
  const toolSetting = await fetchRemoteToolSetting(tool.slug);

  return { props: { tool, seo, toolSetting }, revalidate: 60 };
}
