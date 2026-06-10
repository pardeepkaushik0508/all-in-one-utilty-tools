import Layout from '../components/Layout';
import { CATEGORY_COUNT, getToolCountLabel } from '../utils/siteStats';

const features = [
  { title: 'Lightning fast', description: 'Optimized pipelines for PDF, image, and media processing.' },
  { title: 'Privacy first', description: 'Files are processed securely and removed after download.' },
  { title: 'All-in-one', description: `${getToolCountLabel()} tools across ${CATEGORY_COUNT} categories in one refined dashboard.` },
  { title: 'Free to use', description: 'No account required. Open a tool and start instantly.' }
];

export default function AboutPage() {
  return (
    <Layout
      title="About"
      description={`Learn about All-in-One Utility Tools — a free collection of ${getToolCountLabel()} online utilities for PDF, image, video, text, developer, and security tasks.`}
      canonical="/about"
    >
      <header className="animate-fade-up mb-10">
        <span className="badge">About</span>
        <h1 className="section-title mt-4">
          Built for <span className="gradient-text">everyday work</span>
        </h1>
        <p className="section-subtitle mt-4 max-w-2xl">
          All-in-One Utility Tools groups essential daily utilities into one clean, premium interface.
          Powered by Next.js, Express, and industry-standard processing libraries.
        </p>
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
