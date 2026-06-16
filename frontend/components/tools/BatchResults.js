import { DownloadLink } from './shared';

function statusClass(status) {
  if (status === 'completed' || status === 'success') return 'text-emerald-400';
  if (status === 'failed') return 'text-red-400';
  if (status === 'processing') return 'text-sky-400';
  return 'text-muted';
}

export function BatchResults({ items = [] }) {
  if (!items.length) return null;

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={`${item.original || item.name}-${index}`} className="rounded-xl border border-theme bg-[var(--bg-elevated)] p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-heading">{item.original || item.name || `Item ${index + 1}`}</p>
              <p className={`text-xs ${statusClass(item.status)}`}>{item.status || 'pending'}</p>
              {item.error && <p className="text-xs text-red-400">{item.error}</p>}
            </div>
            <DownloadLink
              url={item.downloadUrl}
              filename={item.downloadFilename}
              label="Download"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
