import Link from 'next/link';
import { getSectionContent } from '../../utils/cms/siteConfig';

export default function CtaBanner({ pageContent = null }) {
  const cta = getSectionContent(pageContent, 'ctaBanner', {
    eyebrow: 'Start now',
    title: 'Ready to get things done?',
    description: 'Pick a tool, upload your file, and download the result — no account, no hassle.',
    primaryButton: { label: 'Explore tools', href: '#tools' },
    secondaryButton: { label: 'Contact us', href: '/contact' }
  });

  return (
    <section className="home-cta animate-fade-up" aria-label="Get started">
      <div className="home-cta-glow" aria-hidden />
      <div className="home-cta-inner">
        <div className="home-cta-copy">
          <p className="home-section-eyebrow !text-[var(--accent)]">{cta.eyebrow || 'Start now'}</p>
          <h2 className="home-cta-title">{cta.title || 'Ready to get things done?'}</h2>
          <p className="home-cta-desc">{cta.description}</p>
        </div>
        <div className="home-cta-actions">
          <Link href={cta.primaryButton?.href || '#tools'} className="btn-primary">
            {cta.primaryButton?.label || 'Explore tools'}
          </Link>
          <Link href={cta.secondaryButton?.href || '/contact'} className="btn-secondary">
            {cta.secondaryButton?.label || 'Contact us'}
          </Link>
        </div>
      </div>
    </section>
  );
}
