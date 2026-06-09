import Layout from '../components/Layout';

export default function ContactPage() {
  return (
    <Layout
      title="Contact"
      description="Contact All-in-One Utility Tools for support, feature requests, or feedback. We are here to help."
      canonical="/contact"
    >
      <header className="animate-fade-up mb-8">
        <span className="badge">Contact</span>
        <h1 className="section-title mt-4">
          Get in <span className="gradient-text">touch</span>
        </h1>
        <p className="section-subtitle mt-4 max-w-xl">
          Questions, feature requests, or bug reports — send us a message.
        </p>
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
          <button type="button" className="btn-primary w-full sm:w-auto">Send Message</button>
        </form>
      </div>
    </Layout>
  );
}
