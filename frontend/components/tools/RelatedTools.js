import Link from 'next/link';
import { useMemo } from 'react';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { filterToolsForListing } from '../../utils/cms/siteConfig';
import { tools } from '../../utils/tools';

export default function RelatedTools({ tool, limit = 4 }) {
  const { toolSettingsMap } = useSiteConfig();
  if (!tool) return null;

  const related = filterToolsForListing(tools, toolSettingsMap)
    .filter((t) => t.category === tool.category && t.slug !== tool.slug)
    .slice(0, limit);

  if (!related.length) return null;

  return (
    <section className="related-tools animate-fade-up mt-12" aria-label="Related tools">
      <h2 className="home-section-title mb-4 text-xl">Related tools</h2>
      <div className="home-highlight-grid">
        {related.map((item) => (
          <Link key={item.slug} href={`/tool/${item.slug}`} className="home-highlight-card">
            <p className="home-highlight-name">{item.name}</p>
            <p className="home-highlight-desc">{item.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
