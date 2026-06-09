export default function LoadingSpinner({ text = 'Processing...' }) {
  return (
    <div
      className="inline-flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium"
      style={{ background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', color: 'var(--accent)' }}
    >
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70" />
      {text}
    </div>
  );
}
