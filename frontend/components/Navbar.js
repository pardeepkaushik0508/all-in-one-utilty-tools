import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ThemeToggle from './ThemeToggle';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' }
];

export default function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [router.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 px-4 pt-3 sm:px-6 sm:pt-4">
      <div className="relative mx-auto max-w-7xl">
        <nav className="nav-bar">
          <Link href="/" className="group flex min-w-0 items-center gap-2.5" onClick={() => setMenuOpen(false)}>
            <span className="icon-box h-9 w-9 shrink-0 transition-transform duration-300 group-hover:scale-105">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="hidden truncate sm:block">
              <span className="font-display text-sm font-bold leading-none text-heading">
                Utility<span className="gradient-text">Tools</span>
              </span>
            </span>
          </Link>

          {/* Desktop */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const isActive = router.pathname === link.href;
              return (
                <Link key={link.href} href={link.href} className={`nav-pill ${isActive ? 'nav-pill-active' : ''}`}>
                  {link.label}
                </Link>
              );
            })}
            <ThemeToggle className="ml-1" />
            <Link href="/" className="btn-primary ml-2 !px-4 !py-2 !text-xs">
              Explore Tools
            </Link>
          </div>

          {/* Mobile actions */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="theme-toggle"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                {menuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
                )}
              </svg>
            </button>
          </div>
        </nav>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />
            <div
              className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 rounded-2xl border border-theme p-2 animate-slide-down md:hidden"
              style={{ background: 'var(--bg-elevated)', boxShadow: 'var(--shadow-nav)' }}
            >
              {navLinks.map((link) => {
                const isActive = router.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`mobile-nav-link ${isActive ? 'mobile-nav-link-active' : ''}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="px-2 pt-2">
                <Link href="/" className="btn-primary w-full" onClick={() => setMenuOpen(false)}>
                  Explore All Tools
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
