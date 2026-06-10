import Link from 'next/link';
import SearchBar from '../SearchBar';

const HERO_STATS = [
  { label: 'Free tools', value: '34', icon: 'M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z' },
  { label: 'Categories', value: '8', icon: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z' },
  { label: 'Max upload', value: '100MB', icon: 'M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5' },
  { label: 'Price', value: '$0', icon: 'M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z' }
];

const QUICK_LINKS = [
  { label: 'Merge PDF', href: '/tool/merge-pdf' },
  { label: 'Compress Image', href: '/tool/compress-image' },
  { label: 'AI Images', href: '/tool/ai-image-generator' },
  { label: 'Video to MP3', href: '/tool/video-to-mp3' }
];

function StatIcon({ path }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5" aria-hidden>
      <path d={path} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function HeroSection({ search, onSearchChange }) {
  return (
    <section className="home-hero animate-fade-up">
      <div className="home-hero-bg" aria-hidden>
        <div className="home-hero-orb home-hero-orb--1" />
        <div className="home-hero-orb home-hero-orb--2" />
        <div className="home-hero-orb home-hero-orb--3" />
        <div className="home-hero-grid" />
      </div>

      <div className="home-hero-content">
        <div className="home-hero-copy">
          <div className="badge mb-6">
            <span className="badge-dot" />
            34 tools · Free forever · No sign-up
          </div>

          <h1 className="home-hero-title">
            Every tool you need.
            <br />
            <span className="gradient-text">One beautiful workspace.</span>
          </h1>

          <p className="home-hero-subtitle">
            PDF, image, video, AI, developer, and security utilities — fast, private,
            and built for everyday productivity.
          </p>

          <div className="home-hero-search">
            <SearchBar
              value={search}
              onChange={onSearchChange}
              placeholder="Search 34 tools — merge PDF, compress image, AI writer..."
            />
            <div className="home-hero-quick">
              <span className="home-hero-quick-label">Popular:</span>
              {QUICK_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="home-hero-quick-link">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="home-hero-actions">
            <Link href="#tools" className="btn-primary">
              Browse all tools
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            <Link href="/blog" className="btn-secondary">
              Read guides
            </Link>
          </div>
        </div>

        <div className="home-hero-stats">
          {HERO_STATS.map((stat) => (
            <div key={stat.label} className="home-stat-card">
              <span className="home-stat-icon">
                <StatIcon path={stat.icon} />
              </span>
              <div>
                <p className="home-stat-value">{stat.value}</p>
                <p className="home-stat-label">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
