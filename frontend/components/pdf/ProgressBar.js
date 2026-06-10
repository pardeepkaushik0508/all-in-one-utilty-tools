export default function ProgressBar({ value = 0, label = 'Loading...' }) {
  const safeValue = Math.min(100, Math.max(0, Number(value) || 0));

  return (
    <div className="space-y-2" role="progressbar" aria-valuenow={safeValue} aria-valuemin={0} aria-valuemax={100}>
      <div className="flex items-center justify-between text-xs text-muted">
        <span>{label}</span>
        <span>{safeValue}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-elevated)]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}
