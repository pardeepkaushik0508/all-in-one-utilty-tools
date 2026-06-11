import Link from 'next/link';
import { getCategoryMeta } from '../utils/categoryMeta';
import { highlightSearchText } from '../utils/smartSearch';

function HighlightedText({ text, query }) {
  const parts = highlightSearchText(text, query);
  return parts.map((part, index) =>
    part.match ? (
      <mark key={index} className="search-highlight">{part.text}</mark>
    ) : (
      <span key={index}>{part.text}</span>
    )
  );
}

export default function ToolCard({ tool, searchQuery = '' }) {
  const meta = getCategoryMeta(tool.category);
  const shortCategory = tool.category.replace(' Tools', '').replace('/Audio', '');

  return (
    <article className="tool-card-modern group">
      <div className={`tool-card-modern-accent bg-gradient-to-r ${meta.gradient}`} />
      <div className="tool-card-modern-body">
        <div className="tool-card-modern-top">
          <span className={`tool-card-modern-icon ${meta.iconBg} ${meta.iconColor}`}>
            {meta.icon}
          </span>
          <span className="tool-card-modern-badge">{shortCategory}</span>
        </div>

        <h2 className="tool-card-modern-title">
          <Link href={`/tool/${tool.slug}`}>
            {searchQuery.trim() ? <HighlightedText text={tool.name} query={searchQuery} /> : tool.name}
          </Link>
        </h2>
        <p className="tool-card-modern-desc">{tool.description}</p>

        <div className="tool-card-modern-footer">
          <Link href={`/tool/${tool.slug}`} className="tool-card-modern-link">
            Open tool
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 transition-transform group-hover:translate-x-1">
              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
            </svg>
          </Link>
          <span className="tool-card-modern-free">Free</span>
        </div>
      </div>
    </article>
  );
}
