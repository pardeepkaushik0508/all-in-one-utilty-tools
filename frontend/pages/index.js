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
import { trackSearchQuery } from '../hooks/useToolAnalytics';
import { getAllBlogPosts } from '../utils/blogPosts';
import { tools } from '../utils/tools';
import { searchTools } from '../utils/smartSearch';

const featuredPosts = getAllBlogPosts().slice(0, 3);

const HOME_DESCRIPTION =
  'Free all-in-one online utility tools — merge PDF, compress images, convert video to MP3, grammar checker, JSON formatter, password generator, and more. Fast, private, no sign-up.';

export default function HomePage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 250);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const query = typeof router.query.search === 'string' ? router.query.search : '';
    if (query) setSearch(query);
  }, [router.query.search]);

  useEffect(() => {
    if (debouncedSearch) trackSearchQuery(debouncedSearch);
  }, [debouncedSearch]);

  const searchMeta = useMemo(() => searchTools(tools, debouncedSearch), [debouncedSearch]);

  const filteredTools = useMemo(() => {
    const pool = debouncedSearch.trim() ? searchMeta.results : tools;
    return pool.filter((tool) => selectedCategory === 'All' || tool.category === selectedCategory);
  }, [debouncedSearch, selectedCategory, searchMeta.results]);

  return (
    <Layout
      title="Free Online Utility Tools"
      description={HOME_DESCRIPTION}
      canonical="/"
    >
      <HeroSection search={search} onSearchChange={setSearch} />

      <CategoryShowcase
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <FeaturedToolsSection />

      <TrendingToolsSection />

      <RecentToolsSection />

      <FeaturesStrip />

      <ToolsSection
        search={search}
        onSearchChange={setSearch}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        filteredTools={filteredTools}
        searchSuggestions={searchMeta.suggestions}
        didYouMean={searchMeta.didYouMean}
      />

      <BlogSection posts={featuredPosts} />

      <CtaBanner />
    </Layout>
  );
}
