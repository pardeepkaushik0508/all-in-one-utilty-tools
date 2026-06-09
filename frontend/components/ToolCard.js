import Link from 'next/link';
import { getCategoryMeta } from '../utils/categoryMeta';

export default function ToolCard({ tool }) {
  const meta = getCategoryMeta(tool.category);

  return (
    <article className="card card-hover group h-full">
      <div className="relative flex h-full flex-col">
        <div className="mb-4 flex items-start justify-between gap-3">
          <span className={`icon-box h-11 w-11 transition-transform duration-300 group-hover:scale-105 ${meta.iconColor}`}>
            {meta.icon}
          </span>
          <span
            className="rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
          >
            {tool.category.replace(' Tools', '')}
          </span>
        </div>

        <h2 className="tool-card-title group-hover:text-[var(--accent)]">{tool.name}</h2>
        <p className="tool-card-desc flex-1">{tool.description}</p>

        <div className="mt-5 flex items-center justify-between border-t pt-4" style={{ borderColor: 'var(--border)' }}>
          <Link href={`/tool/${tool.slug}`} className="tool-card-link group-hover:gap-3">
            Open tool
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 transition-transform group-hover:translate-x-0.5">
              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
            </svg>
          </Link>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Free</span>
        </div>
      </div>
    </article>
  );
}
