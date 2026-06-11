import SearchBar from '../SearchBar';
import CategoryFilter from '../CategoryFilter';
import ToolCard from '../ToolCard';
import { toolCategories, tools } from '../../utils/tools';

export default function ToolsSection({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  filteredTools,
  searchSuggestions = [],
  didYouMean = null
}) {
  return (
    <section id="tools" className="home-tools scroll-mt-28" aria-label="Browse tools">
      <div className="home-tools-header animate-fade-up">
        <div>
          <p className="home-section-eyebrow">All tools</p>
          <h2 className="home-section-title">
            Find the right <span className="gradient-text">utility</span>
          </h2>
        </div>
        <div className="home-tools-count">
          <span className="home-tools-count-num">{filteredTools.length}</span>
          <span className="home-tools-count-label">of {tools.length} tools</span>
        </div>
      </div>

      <div className="home-tools-panel animate-fade-up">
        <SearchBar
          value={search}
          onChange={onSearchChange}
          placeholder="Search tools by name or description..."
        />
        <CategoryFilter
          categories={toolCategories}
          selected={selectedCategory}
          onChange={onCategoryChange}
        />
      </div>

      <div
        className="home-tools-results"
        style={{ '--tool-rows': Math.max(1, Math.ceil(filteredTools.length / 3)) }}
      >
        {filteredTools.length === 0 ? (
          <div className="home-empty-state">
            <div className="home-empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8">
                <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="home-empty-title">No tools found</p>
            <p className="home-empty-desc">
              {didYouMean ? (
                <>
                  Did you mean <strong className="text-heading">{didYouMean}</strong>?
                </>
              ) : searchSuggestions.length > 0 ? (
                <>Try: {searchSuggestions.join(', ')}</>
              ) : (
                'Try a different search term or category filter.'
              )}
            </p>
          </div>
        ) : (
          <div className="home-tools-grid">
            {filteredTools.map((tool) => (
              <div key={tool.slug}>
                <ToolCard tool={tool} searchQuery={search} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
