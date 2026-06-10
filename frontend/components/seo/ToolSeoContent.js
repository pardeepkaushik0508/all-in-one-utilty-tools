import Link from 'next/link';
import { getCategoryMeta } from '../../utils/categoryMeta';
import FaqAccordion from './FaqAccordion';

const SECTION_NAV = [
  { id: 'overview', label: 'Overview', icon: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25' },
  { id: 'features', label: 'Features', icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z' },
  { id: 'how-it-works', label: 'How it works', icon: 'M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z' },
  { id: 'use-cases', label: 'Use cases', icon: 'M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0' },
  { id: 'benefits', label: 'Benefits', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'faq', label: 'FAQ', icon: 'M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z' },
  { id: 'related-tools', label: 'Related', icon: 'M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244' }
];

function SectionIcon({ path }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5" aria-hidden>
      <path d={path} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SectionHeader({ id, title, subtitle, icon, accent }) {
  return (
    <div className="seo-section-header">
      <div className={`seo-section-icon ${accent}`}>
        <SectionIcon path={icon} />
      </div>
      <div>
        <h2 id={id} className="seo-section-title">{title}</h2>
        {subtitle && <p className="seo-section-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function ToolSeoContent({ tool, seo }) {
  if (!tool || !seo) return null;

  const categoryMeta = getCategoryMeta(tool.category);

  return (
    <div className="seo-content-wrap">
      <div className="seo-divider">
        <div className="seo-divider-glow" />
        <div className="seo-divider-inner">
          <span className="badge">
            <span className="badge-dot" />
            Guide & resources
          </span>
          <h2 className="seo-divider-title">
            Everything about <span className="gradient-text">{tool.name}</span>
          </h2>
          <p className="seo-divider-text">
            Learn how this free online tool works, who it is for, and how to get the best results.
          </p>
        </div>
      </div>

      <nav aria-label="On-page sections" className="seo-nav">
        <p className="seo-nav-label">Jump to section</p>
        <ul className="seo-nav-list">
          {SECTION_NAV.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`} className="seo-nav-pill">
                <SectionIcon path={item.icon} />
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section id="overview" className="seo-section scroll-mt-28">
        <SectionHeader
          id="overview-heading"
          title={`${tool.name} Overview`}
          subtitle="A complete guide to using this tool effectively"
          icon={SECTION_NAV[0].icon}
          accent={categoryMeta.iconBg}
        />
        <div className="seo-prose">
          {seo.overview.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>
        <div className="seo-meta-strip">
          <span className="seo-meta-chip">{seo.overviewWordCount || 0}+ words</span>
          <span className="seo-meta-chip">{tool.category}</span>
          <span className="seo-meta-chip">Free to use</span>
        </div>
      </section>

      <section id="features" className="seo-section scroll-mt-28">
        <SectionHeader
          id="features-heading"
          title={`${tool.name} Features`}
          subtitle="Capabilities that make this tool stand out"
          icon={SECTION_NAV[1].icon}
          accent={categoryMeta.iconBg}
        />
        <div className="seo-feature-grid">
          {seo.features.map((feature, index) => (
            <article key={feature} className="seo-feature-card">
              <span className="seo-feature-index">{String(index + 1).padStart(2, '0')}</span>
              <p>{feature}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="seo-section scroll-mt-28">
        <SectionHeader
          id="how-heading"
          title={`How ${tool.name} Works`}
          subtitle="Follow these simple steps to get started"
          icon={SECTION_NAV[2].icon}
          accent={categoryMeta.iconBg}
        />
        <ol className="seo-steps">
          {seo.howItWorks.map((step, index) => (
            <li key={step.title} className="seo-step">
              <div className="seo-step-marker">
                <span>{index + 1}</span>
                {index < seo.howItWorks.length - 1 && <span className="seo-step-line" aria-hidden />}
              </div>
              <div className="seo-step-body">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="use-cases" className="seo-section scroll-mt-28">
        <SectionHeader
          id="use-cases-heading"
          title={`${tool.name} Use Cases`}
          subtitle="Real-world scenarios where this tool shines"
          icon={SECTION_NAV[3].icon}
          accent={categoryMeta.iconBg}
        />
        <div className="seo-use-case-grid">
          {seo.useCases.map((item, index) => (
            <article key={item} className="seo-use-case-card">
              <div className={`seo-use-case-icon ${categoryMeta.iconBg} ${categoryMeta.iconColor}`}>
                <SectionIcon path={SECTION_NAV[3].icon} />
              </div>
              <p>{item}</p>
              <span className="seo-use-case-tag">Use case {index + 1}</span>
            </article>
          ))}
        </div>
      </section>

      <section id="benefits" className="seo-section scroll-mt-28">
        <SectionHeader
          id="benefits-heading"
          title={`Benefits of Using ${tool.name}`}
          subtitle="Why thousands choose this free utility"
          icon={SECTION_NAV[4].icon}
          accent={categoryMeta.iconBg}
        />
        <ul className="seo-benefits-grid">
          {seo.benefits.map((item) => (
            <li key={item} className="seo-benefit-item">
              <span className="seo-benefit-check" aria-hidden>
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section id="faq" className="seo-section scroll-mt-28">
        <SectionHeader
          id="faq-heading"
          title={`${tool.name} FAQ`}
          subtitle="Quick answers to the most common questions"
          icon={SECTION_NAV[5].icon}
          accent={categoryMeta.iconBg}
        />
        <FaqAccordion faqs={seo.faqs} />
      </section>

      <section id="related-tools" className="seo-section scroll-mt-28">
        <SectionHeader
          id="related-heading"
          title="Related Tools"
          subtitle={`More free utilities that pair well with ${tool.name}`}
          icon={SECTION_NAV[6].icon}
          accent={categoryMeta.iconBg}
        />
        <div className="seo-related-grid">
          {seo.relatedTools.map((related) => {
            const relatedMeta = getCategoryMeta(related.category);
            return (
              <Link key={related.slug} href={`/tool/${related.slug}`} className="seo-related-card group">
                <div className={`seo-related-accent bg-gradient-to-br ${relatedMeta.gradient}`} />
                <div className="seo-related-body">
                  <span className="blog-category">{related.category}</span>
                  <p className="seo-related-name">{related.name}</p>
                  <p className="seo-related-desc">{related.description}</p>
                  <span className="seo-related-link">
                    Open tool
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 transition-transform group-hover:translate-x-1">
                      <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                    </svg>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="seo-blog-cta">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">Learn more</p>
            <p className="mt-1 font-display text-lg font-bold text-heading">Read in-depth guides on our blog</p>
          </div>
          <Link href="/blog" className="btn-secondary">
            Browse articles
          </Link>
        </div>
      </section>
    </div>
  );
}
