import Link from 'next/link';
import { useMemo } from 'react';
import useRecentTools from '../../hooks/useRecentTools';
import { getPopularTools } from '../../hooks/useToolAnalytics';
import { tools } from '../../utils/tools';

const FEATURED_SLUGS = [
  'merge-pdf',
  'json-formatter',
  'password-generator',
  'compress-image',
  'api-request-tester',
  'qr-code-generator',
  'caption-generator',
  'ssl-certificate-checker'
];

const TRENDING_SLUGS = [
  'ai-content-generator',
  'jwt-decoder',
  'word-counter',
  'dns-lookup',
  'gst-calculator',
  'instagram-caption-generator',
  'video-to-mp3',
  'hash-generator'
];

function ToolPill({ slug }) {
  const tool = tools.find((t) => t.slug === slug);
  if (!tool) return null;
  return (
    <Link href={`/tool/${tool.slug}`} className="home-hero-quick-link">
      {tool.name}
    </Link>
  );
}

function ToolCardMini({ slug }) {
  const tool = tools.find((t) => t.slug === slug);
  if (!tool) return null;
  return (
    <Link href={`/tool/${tool.slug}`} className="home-highlight-card">
      <p className="home-highlight-name">{tool.name}</p>
      <p className="home-highlight-desc">{tool.description}</p>
    </Link>
  );
}

export function FeaturedToolsSection() {
  return (
    <section className="home-highlights animate-fade-up" aria-label="Featured tools">
      <div className="home-section-header">
        <div>
          <p className="home-section-eyebrow">Featured</p>
          <h2 className="home-section-title">Hand-picked <span className="gradient-text">essentials</span></h2>
        </div>
      </div>
      <div className="home-highlight-grid">
        {FEATURED_SLUGS.map((slug) => (
          <ToolCardMini key={slug} slug={slug} />
        ))}
      </div>
    </section>
  );
}

export function TrendingToolsSection() {
  const popular = useMemo(() => getPopularTools(6), []);
  const slugs = popular.length ? popular.map((p) => p.slug) : TRENDING_SLUGS;

  return (
    <section className="home-highlights animate-fade-up" aria-label="Trending tools">
      <div className="home-section-header">
        <div>
          <p className="home-section-eyebrow">Trending</p>
          <h2 className="home-section-title">Most used <span className="gradient-text">this week</span></h2>
        </div>
      </div>
      <div className="home-pill-row">
        {slugs.map((slug) => (
          <ToolPill key={slug} slug={slug} />
        ))}
      </div>
    </section>
  );
}

export function RecentToolsSection() {
  const recent = useRecentTools();
  if (!recent.length) return null;

  return (
    <section className="home-highlights animate-fade-up" aria-label="Recently used tools">
      <div className="home-section-header">
        <div>
          <p className="home-section-eyebrow">Recent</p>
          <h2 className="home-section-title">Pick up where you <span className="gradient-text">left off</span></h2>
        </div>
      </div>
      <div className="home-recent-row">
        {recent.map((tool) => (
          <Link key={tool.slug} href={`/tool/${tool.slug}`} className="home-recent-pill">
            <span className="home-recent-pill-icon" aria-hidden>
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
              </svg>
            </span>
            {tool.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
