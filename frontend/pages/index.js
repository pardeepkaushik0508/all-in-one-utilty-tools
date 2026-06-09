import { useMemo, useState } from 'react';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import ToolCard from '../components/ToolCard';
import { tools, toolCategories } from '../utils/tools';

const stats = [
  { label: 'Tools', value: '29' },
  { label: 'Categories', value: '8' },
  { label: 'Max upload', value: '50MB' },
  { label: 'Price', value: 'Free' }
];

const HOME_DESCRIPTION =
  'Free all-in-one online utility tools — merge PDF, compress images, convert video to MP3, grammar checker, JSON formatter, password generator, and 23 more. Fast, private, no sign-up.';

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
      <section className="mb-10 animate-fade-up lg:mb-14">
        <div className="badge mb-5">
          <span className="badge-dot" />
          29 tools · Free · No sign-up
        </div>

        <h1 className="section-title max-w-3xl">
          Professional tools.
          <br />
          <span className="gradient-text">Zero complexity.</span>
        </h1>

        <p className="section-subtitle mt-4 max-w-2xl">
          PDF, image, video, text, developer, and security utilities in one refined workspace.
          Built for speed, privacy, and everyday productivity.
        </p>

        <dl className="stagger-children mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{stat.label}</dt>
              <dd className="mt-1 font-display text-2xl font-bold text-heading sm:text-3xl">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="card animate-fade-up mb-8" style={{ animationDelay: '120ms' }} aria-label="Search and filter tools">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-base font-semibold text-heading">Browse tools</h2>
          <p className="text-xs text-muted">{filteredTools.length} of {tools.length}</p>
        </div>
        <div className="space-y-4">
          <SearchBar value={search} onChange={setSearch} />
          <CategoryFilter categories={toolCategories} selected={selectedCategory} onChange={setSelectedCategory} />
        </div>
      </section>

      {filteredTools.length === 0 ? (
        <div className="card py-16 text-center">
          <p className="font-display text-lg font-semibold text-heading">No tools found</p>
          <p className="mt-1 text-sm text-muted">Try a different search or category.</p>
        </div>
      ) : (
        <section aria-label="Tool list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {filteredTools.map((tool, index) => (
            <div
              key={tool.slug}
              className="animate-fade-up"
              style={{ animationDelay: `${Math.min(index, 11) * 50}ms` }}
            >
              <ToolCard tool={tool} />
            </div>
          ))}
        </section>
      )}
    </Layout>
  );
}
