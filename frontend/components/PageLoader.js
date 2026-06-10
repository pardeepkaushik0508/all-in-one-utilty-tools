export default function PageLoader({ active }) {
  if (!active) return null;

  return (
    <div className="page-loader" role="status" aria-live="polite" aria-label="Loading page">
      <div className="page-loader-bar" aria-hidden>
        <span className="page-loader-bar-fill" />
      </div>

      <div className="page-loader-overlay">
        <div className="page-loader-card">
          <div className="page-loader-brand">
            <span className="page-loader-logo" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <p className="page-loader-title">
              Utility<span className="gradient-text">Tools</span>
            </p>
          </div>

          <div className="page-loader-spinner" aria-hidden>
            <span />
            <span />
            <span />
          </div>

          <p className="page-loader-text">Loading...</p>
        </div>
      </div>
    </div>
  );
}
