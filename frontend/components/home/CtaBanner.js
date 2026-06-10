import Link from 'next/link';

export default function CtaBanner() {
  return (
    <section className="home-cta animate-fade-up" aria-label="Get started">
      <div className="home-cta-glow" aria-hidden />
      <div className="home-cta-inner">
        <div className="home-cta-copy">
          <p className="home-section-eyebrow !text-[var(--accent)]">Start now</p>
          <h2 className="home-cta-title">
            Ready to get things done?
          </h2>
          <p className="home-cta-desc">
            Pick a tool, upload your file, and download the result — no account, no hassle.
          </p>
        </div>
        <div className="home-cta-actions">
          <Link href="#tools" className="btn-primary">
            Explore tools
          </Link>
          <Link href="/contact" className="btn-secondary">
            Contact us
          </Link>
        </div>
      </div>
    </section>
  );
}
