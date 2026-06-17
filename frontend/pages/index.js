import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import useDebouncedSearch from '../hooks/useDebouncedSearch';
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

function scrollToToolsSection() {
  if (typeof window === 'undefined') return;
  const toolsSection = document.getElementById('tools');
  if (!toolsSection) return;
  toolsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function HomePage({ pageContent = null, featuredPosts = [] }) {
  const router = useRouter();
  const { toolSettingsMap } = useSiteConfig();
  const { value: search, debouncedValue: debouncedSearch, setValue: setSearch, isSearching } = useDebouncedSearch();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const userInitiatedSearchRef = useRef(false);
  const lastScrolledQueryRef = useRef('');

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
    if (query) {
      setSearch(query);
      requestAnimationFrame(() => scrollToToolsSection());
    }
  }, [router.query.search, setSearch]);

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

  const handleSearchChange = useCallback(
    (nextValue) => {
      userInitiatedSearchRef.current = true;
      setSearch(nextValue);
    },
    [setSearch]
  );

  useEffect(() => {
    const trimmed = debouncedSearch.trim();
    if (!trimmed) {
      lastScrolledQueryRef.current = '';
      return;
    }
    if (!userInitiatedSearchRef.current) return;
    if (lastScrolledQueryRef.current === trimmed) return;

    lastScrolledQueryRef.current = trimmed;
    scrollToToolsSection();
  }, [debouncedSearch]);

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
        <HeroSection
          search={search}
          onSearchChange={handleSearchChange}
          isSearching={isSearching}
          pageContent={pageContent}
        />
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
          debouncedSearch={debouncedSearch}
          onSearchChange={handleSearchChange}
          isSearching={isSearching}
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
