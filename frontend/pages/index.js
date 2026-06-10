import { useMemo, useState } from 'react';
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

const featuredPosts = getAllBlogPosts().slice(0, 3);

const HOME_DESCRIPTION =
  'Free all-in-one online utility tools — merge PDF, compress images, convert video to MP3, grammar checker, JSON formatter, password generator, and more. Fast, private, no sign-up.';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 250);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredTools = useMemo(() => {
    const query = debouncedSearch.toLowerCase();
    if (query) trackSearchQuery(query);
    return tools.filter((tool) => {
      const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
      const matchesSearch = !query || `${tool.name} ${tool.description}`.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [debouncedSearch, selectedCategory]);

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
      />

      <BlogSection posts={featuredPosts} />

      <CtaBanner />
    </Layout>
  );
}
