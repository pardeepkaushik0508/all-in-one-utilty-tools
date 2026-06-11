import Link from 'next/link';
import { getCategoryMeta } from '../../utils/categoryMeta';
import { CATEGORY_SLUGS } from '../../utils/suiteToolsRegistry';
import { tools, toolCategories } from '../../utils/tools';

const SHORT_LABELS = {
  'PDF Tools': 'PDF',
  'Image Tools': 'Image',
  'Video/Audio Tools': 'Video',
  'Text Tools': 'Text & AI',
  'Developer Tools': 'Developer',
  'Social Media Tools': 'Social',
  'Security Tools': 'Security',
  'Utility Tools': 'Utility'
};

export default function CategoryShowcase({ selectedCategory, onSelectCategory }) {
  const scrollToTools = () => {
    document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSelect = (category) => {
    onSelectCategory(category);
    scrollToTools();
  };

  return (
    <section className="home-categories animate-fade-up" aria-label="Tool categories">
      <div className="home-section-header">
        <div>
          <p className="home-section-eyebrow">Categories</p>
          <h2 className="home-section-title">
            Pick your <span className="gradient-text">workflow</span>
          </h2>
          <p className="home-section-desc">8 categories covering every file, text, and code task.</p>
        </div>
        <div className="home-pill-row">
          <button
            type="button"
            onClick={() => handleSelect('All')}
            className={`home-view-all ${selectedCategory === 'All' ? 'home-view-all--active' : ''}`}
          >
            View all
          </button>
          {Object.entries(CATEGORY_SLUGS).slice(0, 4).map(([name, slug]) => (
            <Link key={slug} href={`/category/${slug}`} className="home-view-all">{name.replace(' Tools', '')}</Link>
          ))}
        </div>
      </div>

      <div className="home-category-grid">
        {toolCategories.map((category) => {
          const meta = getCategoryMeta(category);
          const count = tools.filter((t) => t.category === category).length;
          const isActive = selectedCategory === category;

          const categorySlug = CATEGORY_SLUGS[category];
          const cardClass = `home-category-card group ${isActive ? 'home-category-card--active' : ''}`;
          const cardBody = (
            <>
              <div className={`home-category-glow bg-gradient-to-br ${meta.gradient}`} />
              <div className="home-category-body">
                <span className={`home-category-icon ${meta.iconBg} ${meta.iconColor}`}>
                  {meta.icon}
                </span>
                <div className="home-category-text">
                  <p className="home-category-name">{SHORT_LABELS[category] || category}</p>
                  <p className="home-category-count">{count} tools</p>
                </div>
                <svg viewBox="0 0 20 20" fill="currentColor" className="home-category-arrow" aria-hidden>
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </svg>
              </div>
            </>
          );

          if (categorySlug) {
            return (
              <Link
                key={category}
                href={`/category/${categorySlug}`}
                className={cardClass}
                onClick={() => onSelectCategory(category)}
              >
                {cardBody}
              </Link>
            );
          }

          return (
            <button
              key={category}
              type="button"
              onClick={() => handleSelect(category)}
              className={cardClass}
            >
              {cardBody}
            </button>
          );
        })}
      </div>
    </section>
  );
}
