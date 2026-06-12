import Link from 'next/link';
import { useMemo } from 'react';
import { useSiteConfig } from '../context/SiteConfigContext';
import { getCategoryMeta } from '../utils/categoryMeta';
import { filterToolsForListing } from '../utils/cms/siteConfig';
import {
  getCategoryHref,
  getToolCountLabel,
  getToolsCountByCategory,
  getTopToolsByCategory,
  TOOL_COUNT
} from '../utils/siteStats';
import { toolCategories, tools } from '../utils/tools';

export default function NavMegaMenu({ onClose }) {
  const { toolSettingsMap } = useSiteConfig();
  const visibleTools = useMemo(
    () => filterToolsForListing(tools, toolSettingsMap),
    [toolSettingsMap]
  );
  const counts = getToolsCountByCategory(visibleTools);

  const popularTools = useMemo(() => {
    const featured = visibleTools.filter((tool) => toolSettingsMap[tool.slug]?.featured).slice(0, 4);
    if (featured.length) return featured;
    return [
      visibleTools.find((t) => t.slug === 'merge-pdf'),
      visibleTools.find((t) => t.slug === 'json-formatter'),
      visibleTools.find((t) => t.slug === 'compress-image'),
      visibleTools.find((t) => t.slug === 'password-generator')
    ].filter(Boolean);
  }, [visibleTools, toolSettingsMap]);

  return (
    <div className="nav-mega-panel animate-slide-down" role="menu" aria-label="Tool categories">
      <div className="nav-mega-categories">
        {toolCategories.map((category) => {
          const meta = getCategoryMeta(category);
          const topTools = getTopToolsByCategory(category, 3, visibleTools);
          const href = getCategoryHref(category);

          return (
            <div key={category} className="nav-mega-col">
              <Link href={href} className="nav-mega-col-head" onClick={onClose}>
                <span className={`nav-mega-icon ${meta.iconBg} ${meta.iconColor}`}>{meta.icon}</span>
                <span>
                  <span className="nav-mega-col-title">{category}</span>
                  <span className="nav-mega-col-count">{counts[category]} tools</span>
                </span>
              </Link>
              <ul className="nav-mega-tool-list">
                {topTools.map((tool) => (
                  <li key={tool.slug}>
                    <Link href={`/tool/${tool.slug}`} className="nav-mega-tool-link" onClick={onClose}>
                      {tool.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href={href} className="nav-mega-view-all" onClick={onClose}>
                View all
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          );
        })}
      </div>

      <div className="nav-mega-footer">
        <div className="nav-mega-footer-copy">
          <p className="nav-mega-footer-title">{TOOL_COUNT} free tools</p>
          <p className="nav-mega-footer-desc">PDF, image, video, AI, developer, security &amp; more — no sign-up.</p>
        </div>
        <div className="nav-mega-footer-actions">
          <div className="nav-mega-popular">
            {popularTools.map((tool) => (
              <Link key={tool.slug} href={`/tool/${tool.slug}`} className="nav-mega-popular-link" onClick={onClose}>
                {tool.name}
              </Link>
            ))}
          </div>
          <Link href="/#tools" className="btn-primary btn-nav-cta" onClick={onClose}>
            Browse all {getToolCountLabel()} tools
          </Link>
        </div>
      </div>
    </div>
  );
}
