import { useEffect, useState } from 'react';

export default function BlogTableOfContents({ items = [] }) {
  const [activeId, setActiveId] = useState(items[0]?.id || '');

  useEffect(() => {
    if (!items.length || typeof window === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.25, 0.5, 1] }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (!items.length) return null;

  return (
    <nav aria-label="Table of contents" className="blog-toc">
      <div className="blog-toc-header">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 text-[var(--accent)]" aria-hidden>
          <path d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="blog-toc-label">On this page</p>
      </div>
      <ol className="blog-toc-list">
        {items.map((item, index) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`blog-toc-link ${activeId === item.id ? 'blog-toc-link--active' : ''}`}
            >
              <span className="blog-toc-index">{index + 1}</span>
              <span>{item.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
