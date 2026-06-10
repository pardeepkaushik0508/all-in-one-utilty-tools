const FEATURES = [
  {
    title: '100% Free',
    description: 'Every tool is free to use with no hidden fees or premium tiers.',
    icon: 'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    color: 'home-feature-icon--green'
  },
  {
    title: 'Privacy First',
    description: 'Files are processed securely and never stored longer than needed.',
    icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
    color: 'home-feature-icon--violet'
  },
  {
    title: 'Lightning Fast',
    description: 'Optimized processing so you get results in seconds, not minutes.',
    icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z',
    color: 'home-feature-icon--cyan'
  },
  {
    title: 'No Sign-up',
    description: 'Open any tool and start working immediately — no account required.',
    icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
    color: 'home-feature-icon--amber'
  }
];

export default function FeaturesStrip() {
  return (
    <section className="home-features animate-fade-up" aria-label="Why UtilityTools">
      <div className="home-features-grid">
        {FEATURES.map((feature) => (
          <article key={feature.title} className="home-feature-card">
            <span className={`home-feature-icon ${feature.color}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6" aria-hidden>
                <path d={feature.icon} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <h3 className="home-feature-title">{feature.title}</h3>
            <p className="home-feature-desc">{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
