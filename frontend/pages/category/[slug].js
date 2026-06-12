import Link from 'next/link';
import { useMemo, useState } from 'react';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import Layout from '../../components/Layout';
import SearchBar from '../../components/SearchBar';
import ToolCard from '../../components/ToolCard';
import { SITE_URL } from '../../components/SEO';
import { getCategoryMeta } from '../../utils/categoryMeta';
import { buildBreadcrumbSchema, buildCategorySchema } from '../../utils/seo/schema';
import { getCategoryTools } from '../../utils/suiteToolsRegistry';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { filterToolsForListing } from '../../utils/cms/siteConfig';
import { tools } from '../../utils/tools';
import { searchTools } from '../../utils/smartSearch';

const CATEGORY_PAGES = {
  'pdf-tools': {
    title: 'PDF Tools',
    category: 'PDF Tools',
    description: 'Free online PDF utilities — merge, split, compress, create, edit, delete pages, and scan to PDF. Fast, private, browser-based document tools.',
    eyebrow: '7 PDF utilities'
  },
  'video-audio-tools': {
    title: 'Video & Audio Tools',
    category: 'Video/Audio Tools',
    description: 'Free video and audio utilities — convert video to MP3, compress video, trim audio, and download media. Simple uploads with quick downloads.',
    eyebrow: '4 video & audio utilities'
  },
  'text-tools': {
    title: 'Text Tools',
    category: 'Text Tools',
    description: 'Free online text utilities — counters, converters, formatters, encoders, generators, and more. Fast, private, browser-based tools for writers and developers.',
    eyebrow: '40+ text utilities'
  },
  'image-tools': {
    title: 'Image Tools',
    category: 'Image Tools',
    description: 'Free online image utilities — compress, resize, crop, convert, edit, and create social media graphics. Upload, preview, and download in seconds.',
    eyebrow: '40+ image utilities'
  },
  'developer-tools': {
    title: 'Developer Tools',
    category: 'Developer Tools',
    description: 'JSON, XML, JWT, regex, hash, encoding, formatting, and API testing tools for developers. Fast, browser-based utilities with optional server-side network checks.',
    eyebrow: '35+ developer utilities'
  },
  'security-tools': {
    title: 'Security Tools',
    category: 'Security Tools',
    description: 'Password generators, hash tools, JWT inspectors, SSL checks, DNS lookup, security headers, and safe network scanners for security professionals.',
    eyebrow: '25+ security utilities'
  },
  'utility-tools': {
    title: 'Utility Tools',
    category: 'Utility Tools',
    description: 'Calculators, converters, timers, QR codes, random generators, and everyday productivity utilities — free and instant.',
    eyebrow: '30+ utility tools'
  },
  'social-media-tools': {
    title: 'Social Media Tools',
    category: 'Social Media Tools',
    description: 'Caption generators, hashtag tools, bio writers, YouTube helpers, engagement calculators, and social share previews.',
    eyebrow: '20+ social utilities'
  }
};

export default function CategoryPage({ slug, page }) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 250);
  const { toolSettingsMap } = useSiteConfig();

  const categoryTools = useMemo(
    () => filterToolsForListing(getCategoryTools(page.category, tools), toolSettingsMap),
    [page.category, toolSettingsMap]
  );

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return categoryTools;
    const { results } = searchTools(categoryTools, debouncedSearch);
    return results;
  }, [categoryTools, debouncedSearch]);

  const meta = getCategoryMeta(page.category);
  const categoryUrl = `${SITE_URL}/category/${slug}`;
  const jsonLd = [
    buildBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Tools', url: `${SITE_URL}/#tools` },
      { name: page.title, url: categoryUrl }
    ]),
    buildCategorySchema(page, categoryTools, categoryUrl)
  ];

  return (
    <Layout
      title={`${page.title} — Free Online Utilities`}
      description={page.description}
      canonical={`/category/${slug}`}
      jsonLd={jsonLd}
    >
      <nav className="breadcrumb-modern animate-fade-up">
        <Link href="/">Home</Link>
        <span className="breadcrumb-sep">/</span>
        <Link href="/#tools">Tools</Link>
        <span className="breadcrumb-sep">/</span>
        <span className="text-heading">{page.title}</span>
      </nav>

      <header className="tool-hero animate-fade-up mb-8">
        <div className={`tool-hero-glow bg-gradient-to-br ${meta.gradient}`} />
        <div className="tool-hero-inner">
          <span className={`tool-hero-icon ${meta.iconBg} ${meta.iconColor}`}>{meta.icon}</span>
          <div>
            <span className="badge">{page.eyebrow}</span>
            <h1 className="tool-hero-title">{page.title}</h1>
            <p className="tool-hero-desc">{page.description}</p>
          </div>
        </div>
      </header>

      <section className="home-tools-panel mb-6">
        <SearchBar value={search} onChange={setSearch} placeholder={`Search ${page.title.toLowerCase()}...`} />
        <p className="text-sm text-muted">{filtered.length} tool(s) available</p>
      </section>

      <section className="home-tools-grid">
        {filtered.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </section>
    </Layout>
  );
}

export async function getStaticPaths() {
  return {
    paths: Object.keys(CATEGORY_PAGES).map((slug) => ({ params: { slug } })),
    fallback: false
  };
}

export async function getStaticProps({ params }) {
  const page = CATEGORY_PAGES[params.slug];
  if (!page) return { notFound: true };
  return { props: { slug: params.slug, page }, revalidate: 3600 };
}
