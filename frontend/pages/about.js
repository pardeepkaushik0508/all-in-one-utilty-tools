import Layout from '../components/Layout';
import { CATEGORY_COUNT, getToolCountLabel } from '../utils/siteStats';
import { fetchRemotePage, getSectionContent } from '../utils/cms/siteConfig';

const DEFAULT_FEATURES = [
  { title: 'Lightning fast', description: 'Optimized pipelines for PDF, image, and media processing.' },
  { title: 'Privacy first', description: 'Files are processed securely and removed after download.' },
  { title: 'All-in-one', description: `${getToolCountLabel()} tools across ${CATEGORY_COUNT} categories in one refined dashboard.` },
  { title: 'Free to use', description: 'No account required. Open a tool and start instantly.' }
];

export default function AboutPage({ pageContent = null }) {
  const header = getSectionContent(pageContent, 'header', {
    badge: 'About',
    title: 'Built for everyday work',
    titleAccent: 'everyday work',
    subtitle: 'All-in-One Utility Tools groups essential daily utilities into one clean, premium interface. Powered by Next.js, Express, and industry-standard processing libraries.'
  });
  const featuresContent = getSectionContent(pageContent, 'features', { items: DEFAULT_FEATURES });
  const features = featuresContent.items?.length ? featuresContent.items : DEFAULT_FEATURES;
  const seo = pageContent?.seo || {};

  return (
    <Layout
      title={seo.metaTitle || 'About'}
      description={seo.metaDescription || `Learn about All-in-One Utility Tools — a free collection of ${getToolCountLabel()} online utilities for PDF, image, video, text, developer, and security tasks.`}
      canonical={seo.canonicalUrl || '/about'}
      noindex={seo.robotsIndex === false}
    >
      <header className="animate-fade-up mb-10">
        <span className="badge">{header.badge || 'About'}</span>
        <h1 className="section-title mt-4">
          {header.title?.includes(header.titleAccent) ? (
            <>
              {header.title.split(header.titleAccent)[0]}
              <span className="gradient-text">{header.titleAccent}</span>
              {header.title.split(header.titleAccent)[1]}
            </>
          ) : (
            <>
              Built for <span className="gradient-text">{header.titleAccent || 'everyday work'}</span>
            </>
          )}
        </h1>
        <p className="section-subtitle mt-4 max-w-2xl">{header.subtitle}</p>
      </header>

      <div className="stagger-children grid gap-4 sm:grid-cols-2 sm:gap-5">
        {features.map((feature) => (
          <article key={feature.title} className="card card-hover">
            <h2 className="font-display text-lg font-semibold text-heading">{feature.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{feature.description}</p>
          </article>
        ))}
      </div>
    </Layout>
  );
}

export async function getStaticProps() {
  const pageContent = await fetchRemotePage('about');
  return { props: { pageContent }, revalidate: 60 };
}
