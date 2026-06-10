import { useState } from 'react';

function ChevronIcon({ open }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`h-5 w-5 shrink-0 text-[var(--accent)] transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function FaqAccordion({ faqs = [], variant = 'default' }) {
  const [openIndex, setOpenIndex] = useState(0);

  if (!faqs.length) return null;

  return (
    <div className={`faq-accordion ${variant === 'compact' ? 'faq-accordion--compact' : ''}`}>
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={faq.question} className={`faq-item ${isOpen ? 'faq-item--open' : ''}`}>
            <button
              type="button"
              className="faq-trigger"
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
              aria-expanded={isOpen}
            >
              <span className="faq-number">{String(index + 1).padStart(2, '0')}</span>
              <span className="faq-question">{faq.question}</span>
              <ChevronIcon open={isOpen} />
            </button>
            <div className={`faq-panel ${isOpen ? 'faq-panel--open' : ''}`}>
              <div className="faq-panel-inner">
                <p className="faq-answer">{faq.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
