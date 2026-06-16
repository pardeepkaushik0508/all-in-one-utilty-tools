import Layout from '../components/Layout';

const CONTACT_EMAIL = 'support@utilitytools.in';
const WEBSITE_URL = 'https://utilitytools.in/';

function Section({ title, children }) {
  return (
    <section className="space-y-2">
      <h2 className="font-display text-lg font-semibold text-heading">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted">{children}</div>
    </section>
  );
}

export default function TermsAndConditionsPage() {
  const lastUpdated = 'June 16, 2026';

  return (
    <Layout
      title="Terms and Conditions - UtilityTools"
      description="Read UtilityTools terms and conditions for using our free online tools."
      canonical="/terms-and-conditions"
    >
      <header className="animate-fade-up mb-8">
        <span className="badge">Legal</span>
        <h1 className="section-title mt-4">
          Terms & <span className="gradient-text">Conditions</span>
        </h1>
        <p className="section-subtitle mt-4 max-w-3xl">
          These terms govern your use of UtilityTools and our free online tools.
        </p>
      </header>

      <article className="card animate-fade-up max-w-4xl space-y-8" style={{ animationDelay: '100ms' }}>
        <p className="text-xs text-muted">Last updated: {lastUpdated}</p>

        <Section title="Acceptance of Terms">
          <p>
            By accessing or using UtilityTools, you agree to be bound by these Terms & Conditions. If you do not agree,
            please do not use the website.
          </p>
        </Section>

        <Section title="Use of Website">
          <ul className="list-disc space-y-2 pl-5">
            <li>Tools are provided for personal and professional use.</li>
            <li>You must not misuse, disrupt, or attempt to interfere with the website or its services.</li>
            <li>You are responsible for how you use the tools and any results generated.</li>
          </ul>
        </Section>

        <Section title="Tool Accuracy">
          <p>
            Tools are provided “as is” and “as available”. Results may vary based on input data, formats, and external
            factors. We do not guarantee the accuracy, completeness, or suitability of outputs for any particular
            purpose.
          </p>
        </Section>

        <Section title="Prohibited Activities">
          <p>You must not:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Use the tools for illegal purposes or to violate any laws or regulations.</li>
            <li>Attempt to damage, disable, or impair the website or servers.</li>
            <li>Abuse, overload, scrape, or stress the services in a way that impacts other users.</li>
            <li>Attempt to access restricted areas, bypass security, or reverse engineer the platform.</li>
          </ul>
        </Section>

        <Section title="Intellectual Property">
          <p>
            The website, branding, design, and code (including the arrangement and presentation of content) are owned by
            UtilityTools or its licensors and are protected by applicable intellectual property laws.
          </p>
        </Section>

        <Section title="Third Party Links">
          <p>
            UtilityTools may include links to third-party websites or services. We do not control these third parties and
            are not responsible for their content, policies, or practices.
          </p>
        </Section>

        <Section title="Limitation of Liability">
          <p>
            To the maximum extent permitted by law, UtilityTools will not be liable for any direct, indirect, incidental,
            special, consequential, or punitive damages arising from your use of (or inability to use) the website or
            tools, including losses resulting from tool outputs or reliance on results.
          </p>
        </Section>

        <Section title="Changes to Terms">
          <p>
            We may update these Terms & Conditions at any time. Updates will be posted on this page with a revised “Last
            updated” date. Continued use of the website after changes means you accept the updated terms.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Website: <a className="text-[var(--accent)] underline" href={WEBSITE_URL}>{WEBSITE_URL}</a>
          </p>
          <p>
            Email: <a className="text-[var(--accent)] underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
        </Section>
      </article>
    </Layout>
  );
}

