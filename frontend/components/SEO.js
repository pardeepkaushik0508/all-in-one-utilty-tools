import Head from 'next/head';

const SITE_NAME = 'All-in-One Utility Tools';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://utilitytools.app';
const DEFAULT_DESCRIPTION =
  'Free online utility tools for PDF, image, video, text, developer, security, and converters. Fast, private, and easy to use.';

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  ogType = 'website',
  noindex = false,
  jsonLd
}) {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Free Online Tools`;
  const url = canonical ? `${SITE_URL}${canonical}` : SITE_URL;

  return (
    <Head>
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="robots" content={noindex ? 'noindex,nofollow' : 'index,follow'} />
      <meta name="author" content={SITE_NAME} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:locale" content="en_US" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />

      <meta name="application-name" content={SITE_NAME} />
      <meta name="apple-mobile-web-app-title" content="UtilityTools" />

      {jsonLd &&
        (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).map((item, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
          />
        ))}
    </Head>
  );
}

export { SITE_NAME, SITE_URL, DEFAULT_DESCRIPTION };
