import { useMemo, useState } from 'react';
import Layout from '../components/Layout';
import HeroSection from '../components/home/HeroSection';
import CategoryShowcase from '../components/home/CategoryShowcase';
import FeaturesStrip from '../components/home/FeaturesStrip';
import ToolsSection from '../components/home/ToolsSection';
import BlogSection from '../components/home/BlogSection';
import CtaBanner from '../components/home/CtaBanner';
import { getAllBlogPosts } from '../utils/blogPosts';
import { tools } from '../utils/tools';

const featuredPosts = getAllBlogPosts().slice(0, 3);

const HOME_DESCRIPTION =
  'Free all-in-one online utility tools — merge PDF, compress images, convert video to MP3, grammar checker, JSON formatter, password generator, and more. Fast, private, no sign-up.';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
      const matchesSearch = `${tool.name} ${tool.description}`.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory]);

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
