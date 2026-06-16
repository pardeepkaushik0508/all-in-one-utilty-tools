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

export default function PrivacyPolicyPage() {
  const lastUpdated = 'June 16, 2026';

  return (
    <Layout
      title="Privacy Policy - UtilityTools"
      description="Read UtilityTools privacy policy to understand how we collect, use, and protect user information."
      canonical="/privacy-policy"
    >
      <header className="animate-fade-up mb-8">
        <span className="badge">Legal</span>
        <h1 className="section-title mt-4">
          Privacy <span className="gradient-text">Policy</span>
        </h1>
        <p className="section-subtitle mt-4 max-w-3xl">
          We respect your privacy. This policy explains what information UtilityTools collects and how we use it.
        </p>
      </header>

      <article className="card animate-fade-up max-w-4xl space-y-8" style={{ animationDelay: '100ms' }}>
        <p className="text-xs text-muted">Last updated: {lastUpdated}</p>

        <Section title="Introduction">
          <p>
            UtilityTools is an all-in-one online tools platform offering 200+ free tools including PDF tools, image tools,
            video tools, AI tools, developer tools, security tools, text tools, converters, and utility tools. We aim to
            keep the service simple and privacy-friendly.
          </p>
        </Section>

        <Section title="Information We Collect">
          <ul className="list-disc space-y-2 pl-5">
            <li>We do not collect unnecessary personal information to use our tools.</li>
            <li>
              Basic analytics information (such as page views and device/browser info) may be collected to improve site
              performance and reliability.
            </li>
            <li>
              Contact information is collected only when you voluntarily contact us (for example, via email or a contact
              form).
            </li>
          </ul>
        </Section>

        <Section title="How We Use Information">
          <ul className="list-disc space-y-2 pl-5">
            <li>Improve website performance and stability.</li>
            <li>Improve tools and overall user experience.</li>
            <li>Respond to user queries and support requests.</li>
            <li>Maintain security, prevent abuse, and troubleshoot issues.</li>
          </ul>
        </Section>

        <Section title="Cookies">
          <p>
            We may use cookies and similar technologies to remember preferences, understand usage patterns through
            analytics, and improve the user experience. You can control cookies through your browser settings.
          </p>
        </Section>

        <Section title="Third Party Services">
          <p>
            UtilityTools may rely on third-party services to operate and improve the website, such as analytics
            providers, infrastructure/hosting providers, and external services required for functionality. These services
            may process limited data as needed to provide their service.
          </p>
          <p>
            If we use advertising partners in the future, this policy will be updated to describe what data is used and
            how you can manage your preferences.
          </p>
        </Section>

        <Section title="Data Security">
          <p>
            We take reasonable measures to protect the website and any information we handle. However, no method of
            transmission or storage is 100% secure, and we cannot guarantee absolute security.
          </p>
        </Section>

        <Section title="User Rights">
          <p>
            Depending on your location, you may have rights to request access to, correction of, or deletion of certain
            information. If you would like to make a request, contact us using the details below.
          </p>
        </Section>

        <Section title="Children's Privacy">
          <p>
            UtilityTools is not intended for collecting personal data from children. If you believe a child has provided
            us personal information, please contact us and we will take reasonable steps to remove it.
          </p>
        </Section>

        <Section title="Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. Updates will be posted on this page with a revised
            “Last updated” date.
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

