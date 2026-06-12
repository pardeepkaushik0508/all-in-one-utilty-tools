import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSiteConfig } from '../context/SiteConfigContext';
import NavMegaMenu from './NavMegaMenu';
import ThemeToggle from './ThemeToggle';

const DEFAULT_NAV_LINKS = [
  { href: '/', label: 'Home', match: (path) => path === '/' },
  { href: '/blog', label: 'Blog', match: (path) => path.startsWith('/blog') },
  { href: '/about', label: 'About', match: (path) => path === '/about' },
  { href: '/contact', label: 'Contact', match: (path) => path === '/contact' }
];

const toolsMatch = (path) => path.startsWith('/tool') || path.startsWith('/category');

function isActive(link, pathname) {
  return link.match(pathname);
}

function mapNavigationLinks(navigation) {
  if (!navigation?.header?.length) return DEFAULT_NAV_LINKS;
  return navigation.header
    .filter((item) => item.enabled !== false && item.label?.toLowerCase() !== 'tools')
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((item) => ({
      href: item.href,
      label: item.label,
      external: item.external,
      openInNewTab: item.openInNewTab,
      match: (path) => (item.href === '/' ? path === '/' : path.startsWith(item.href))
    }));
}

export default function Navbar() {
  const router = useRouter();
  const { navigation } = useSiteConfig();
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const megaRef = useRef(null);
  const closeTimer = useRef(null);

  const navLinks = useMemo(() => mapNavigationLinks(navigation), [navigation]);
  const cta = navigation?.cta || { label: 'Explore Tools', href: '/#tools' };

  useEffect(() => {
    setMenuOpen(false);
    setMegaOpen(false);
  }, [router.pathname]);

  useEffect(() => {
    const handleClick = (e) => {
      if (megaRef.current && !megaRef.current.contains(e.target)) setMegaOpen(false);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const openMega = () => {
    clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };

  const scheduleCloseMega = () => {
    closeTimer.current = setTimeout(() => setMegaOpen(false), 120);
  };

  const toolsActive = toolsMatch(router.pathname);

  const renderNavLink = (link, className) => {
    if (link.external) {
      return (
        <a
          key={link.href + link.label}
          href={link.href}
          className={className}
          target={link.openInNewTab ? '_blank' : undefined}
          rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
        >
          {link.label}
        </a>
      );
    }
    return (
      <Link key={link.href + link.label} href={link.href} className={className}>
        {link.label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 px-4 pt-3 sm:px-6 sm:pt-4">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <div
        className="relative mx-auto max-w-7xl"
        ref={megaRef}
        onMouseLeave={scheduleCloseMega}
      >
        <nav className="nav-bar" aria-label="Main navigation">
          <Link href="/" className="group flex min-w-0 items-center gap-2.5" onClick={() => setMenuOpen(false)}>
            <span className="icon-box h-9 w-9 shrink-0 transition-transform duration-300 group-hover:scale-105">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="hidden truncate sm:block">
              <span className="font-display text-sm font-bold leading-none text-heading">
                Utility<span className="gradient-text">Tools</span>
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-0.5 md:flex">
            {navLinks.slice(0, 1).map((link) =>
              renderNavLink(link, `nav-pill ${isActive(link, router.pathname) ? 'nav-pill-active' : ''}`)
            )}

            <div className="relative" onMouseEnter={openMega}>
              <button
                type="button"
                className={`nav-pill inline-flex items-center gap-1 ${megaOpen || toolsActive ? 'nav-pill-active' : ''}`}
                onClick={() => setMegaOpen((open) => !open)}
                aria-expanded={megaOpen}
                aria-haspopup="true"
              >
                Tools
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`h-4 w-4 transition-transform duration-200 ${megaOpen ? 'rotate-180' : ''}`}
                  aria-hidden
                >
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {navLinks.slice(1).map((link) =>
              renderNavLink(link, `nav-pill ${isActive(link, router.pathname) ? 'nav-pill-active' : ''}`)
            )}

            <ThemeToggle className="ml-1" />
            <Link href={cta.href || '/#tools'} className="btn-primary btn-nav-cta ml-2">
              {cta.label || 'Explore Tools'}
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="theme-toggle"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
                {menuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
                )}
              </svg>
            </button>
          </div>
        </nav>

        {megaOpen && (
          <div className="nav-mega-anchor hidden md:block" onMouseEnter={openMega}>
            <NavMegaMenu onClose={() => setMegaOpen(false)} />
          </div>
        )}

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />
            <div
              className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-[80vh] overflow-y-auto rounded-2xl border border-theme p-2 animate-slide-down md:hidden"
              style={{ background: 'var(--bg-elevated)', boxShadow: 'var(--shadow-nav)' }}
            >
              {navLinks.map((link) => {
                const className = `mobile-nav-link ${isActive(link, router.pathname) ? 'mobile-nav-link-active' : ''}`;
                if (link.external) {
                  return (
                    <a
                      key={link.href + link.label}
                      href={link.href}
                      className={className}
                      target={link.openInNewTab ? '_blank' : undefined}
                      rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </a>
                  );
                }
                return (
                  <Link
                    key={link.href + link.label}
                    href={link.href}
                    className={className}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/#tools"
                className={`mobile-nav-link ${toolsActive ? 'mobile-nav-link-active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                All Tools
              </Link>
              <div className="grid grid-cols-2 gap-2 px-2 pt-2">
                <Link href="/blog" className="btn-secondary w-full !justify-center !text-xs" onClick={() => setMenuOpen(false)}>
                  Blog
                </Link>
                <Link href={cta.href || '/#tools'} className="btn-primary w-full !text-xs" onClick={() => setMenuOpen(false)}>
                  {cta.label || 'Explore Tools'}
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
