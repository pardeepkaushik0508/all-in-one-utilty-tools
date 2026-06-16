import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import useDebouncedValue from '../hooks/useDebouncedValue';
import Layout from '../components/Layout';
import HeroSection from '../components/home/HeroSection';
import CategoryShowcase from '../components/home/CategoryShowcase';
import FeaturesStrip from '../components/home/FeaturesStrip';
import ToolsSection from '../components/home/ToolsSection';
import BlogSection from '../components/home/BlogSection';
import CtaBanner from '../components/home/CtaBanner';
import { FeaturedToolsSection, RecentToolsSection, TrendingToolsSection } from '../components/home/ToolHighlights';
import { useSiteConfig } from '../context/SiteConfigContext';
import { trackSearchQuery } from '../hooks/useToolAnalytics';
import { fetchRemoteBlogPosts } from '../utils/cms/blogPosts';
import { fetchRemotePage, filterToolsForListing, isSectionEnabled } from '../utils/cms/siteConfig';
import { tools } from '../utils/tools';
import { searchTools } from '../utils/smartSearch';

const HOME_DESCRIPTION =
  'Free all-in-one online utility tools — merge PDF, compress images, convert video to MP3, grammar checker, JSON formatter, password generator, and more. Fast, private, no sign-up.';

export default function HomePage({ pageContent = null, featuredPosts = [] }) {
  const router = useRouter();
  const { toolSettingsMap } = useSiteConfig();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 250);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const visibleTools = useMemo(
    () => filterToolsForListing(tools, toolSettingsMap, { homepage: true }),
    [toolSettingsMap]
  );

  const searchableTools = useMemo(
    () => filterToolsForListing(tools, toolSettingsMap, { search: true }),
    [toolSettingsMap]
  );

  useEffect(() => {
    const query = typeof router.query.search === 'string' ? router.query.search : '';
    if (query) setSearch(query);
  }, [router.query.search]);

  useEffect(() => {
    if (debouncedSearch) trackSearchQuery(debouncedSearch);
  }, [debouncedSearch]);

  const searchMeta = useMemo(
    () => searchTools(searchableTools, debouncedSearch),
    [debouncedSearch, searchableTools]
  );

  const filteredTools = useMemo(() => {
    const pool = debouncedSearch.trim() ? searchMeta.results : visibleTools;
    return pool.filter((tool) => selectedCategory === 'All' || tool.category === selectedCategory);
  }, [debouncedSearch, selectedCategory, searchMeta.results, visibleTools]);

  const seo = pageContent?.seo || {};
  const pageTitle = seo.metaTitle || 'Free Online Utility Tools';
  const pageDescription = seo.metaDescription || HOME_DESCRIPTION;

  return (
    <Layout
      title={pageTitle}
      description={pageDescription}
      canonical={seo.canonicalUrl || '/'}
      noindex={seo.robotsIndex === false}
    >
      {isSectionEnabled(pageContent, 'hero') && (
        <HeroSection search={search} onSearchChange={setSearch} pageContent={pageContent} />
      )}

      {isSectionEnabled(pageContent, 'categoryShowcase') && (
        <CategoryShowcase
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      )}

      {isSectionEnabled(pageContent, 'featuredTools') && <FeaturedToolsSection />}

      {isSectionEnabled(pageContent, 'trendingTools') && <TrendingToolsSection />}

      {isSectionEnabled(pageContent, 'recentTools') && <RecentToolsSection />}

      {isSectionEnabled(pageContent, 'featuresStrip') && <FeaturesStrip pageContent={pageContent} />}

      {isSectionEnabled(pageContent, 'toolsSection') && (
        <ToolsSection
          search={search}
          onSearchChange={setSearch}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          filteredTools={filteredTools}
          searchSuggestions={searchMeta.suggestions}
          didYouMean={searchMeta.didYouMean}
          pageContent={pageContent}
          totalTools={visibleTools.length}
        />
      )}

      {isSectionEnabled(pageContent, 'blogSection') && <BlogSection posts={featuredPosts} pageContent={pageContent} />}

      {isSectionEnabled(pageContent, 'ctaBanner') && <CtaBanner pageContent={pageContent} />}
    </Layout>
  );
}

export async function getStaticProps() {
  const [pageContent, blogResult] = await Promise.all([
    fetchRemotePage('home'),
    fetchRemoteBlogPosts()
  ]);
  return {
    props: {
      pageContent,
      featuredPosts: (blogResult.posts || []).slice(0, 3)
    },
    revalidate: 60
  };
}
