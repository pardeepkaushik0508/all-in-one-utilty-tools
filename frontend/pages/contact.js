import Layout from '../components/Layout';
import { fetchRemotePage, getSectionContent } from '../utils/cms/siteConfig';

export default function ContactPage({ pageContent = null }) {
  const header = getSectionContent(pageContent, 'header', {
    badge: 'Contact',
    title: 'Get in touch',
    titleAccent: 'touch',
    subtitle: 'Questions, feature requests, or bug reports — send us a message.'
  });
  const form = getSectionContent(pageContent, 'form', { submitLabel: 'Send Message' });
  const seo = pageContent?.seo || {};

  return (
    <Layout
      title={seo.metaTitle || 'Contact'}
      description={seo.metaDescription || 'Contact All-in-One Utility Tools for support, feature requests, or feedback. We are here to help.'}
      canonical={seo.canonicalUrl || '/contact'}
      noindex={seo.robotsIndex === false}
    >
      <header className="animate-fade-up mb-8">
        <span className="badge">{header.badge || 'Contact'}</span>
        <h1 className="section-title mt-4">
          Get in <span className="gradient-text">{header.titleAccent || 'touch'}</span>
        </h1>
        <p className="section-subtitle mt-4 max-w-xl">{header.subtitle}</p>
      </header>

      <div className="card animate-fade-up max-w-lg" style={{ animationDelay: '100ms' }}>
        <form className="grid gap-4" aria-label="Contact form">
          <label className="block">
            <span className="label-text">Name</span>
            <input className="input-field" placeholder="Your name" autoComplete="name" />
          </label>
          <label className="block">
            <span className="label-text">Email</span>
            <input type="email" className="input-field" placeholder="you@example.com" autoComplete="email" />
          </label>
          <label className="block">
            <span className="label-text">Message</span>
            <textarea className="input-field" placeholder="How can we help?" rows={4} />
          </label>
          <button type="button" className="btn-primary w-full sm:w-auto">{form.submitLabel || 'Send Message'}</button>
        </form>
      </div>
    </Layout>
  );
}

export async function getStaticProps() {
  const pageContent = await fetchRemotePage('contact');
  return { props: { pageContent }, revalidate: 60 };
}
