import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from './Navbar';
import SEO, { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from './SEO';
import { useTheme } from '../context/ThemeContext';

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  description: DEFAULT_DESCRIPTION,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/?search={search_term_string}`,
    'query-input': 'required name=search_term_string'
  }
};

export default function Layout({
  children,
  title,
  description,
  canonical,
  ogType = 'website',
  noindex = false,
  jsonLd
}) {
  const { theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? '#000000' : '#ffffff');
    }
  }, [theme]);

  const structuredData = jsonLd
    ? Array.isArray(jsonLd)
      ? [websiteJsonLd, ...jsonLd]
      : [websiteJsonLd, jsonLd]
    : websiteJsonLd;

  return (
    <>
      <SEO
        title={title}
        description={description}
        canonical={canonical}
        ogType={ogType}
        noindex={noindex}
        jsonLd={structuredData}
      />

      <div className="page-shell">
        <div className="page-bg" aria-hidden="true" />
        <div className="orb left-[10%] top-[5%] h-64 w-64 opacity-80" style={{ background: 'var(--orb-1)' }} aria-hidden="true" />
        <div className="orb right-[10%] top-[30%] h-48 w-48 opacity-80" style={{ background: 'var(--orb-2)' }} aria-hidden="true" />

        <Navbar />

        <main
          key={router.pathname}
          className="page-content relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:py-14"
        >
          {children}
        </main>

        <footer className="relative border-t border-theme">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-4 py-10 sm:flex-row sm:px-6">
            <div>
              <p className="font-display text-sm font-semibold text-heading">UtilityTools</p>
              <p className="mt-1 text-xs text-muted">
                &copy; {new Date().getFullYear()} {SITE_NAME}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted">
              <span className="flex items-center gap-2 rounded-full border border-theme px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                29 tools online
              </span>
              <span>Free forever</span>
              <span>No sign-up</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
