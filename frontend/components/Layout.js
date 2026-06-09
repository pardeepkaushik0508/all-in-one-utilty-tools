import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from './Navbar';
import Footer from './Footer';
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
          id="main-content"
          key={router.pathname}
          className="page-content relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:py-14"
        >
          {children}
        </main>

        <Footer />
      </div>
    </>
  );
}
