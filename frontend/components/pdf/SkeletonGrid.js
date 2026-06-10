export default function SkeletonGrid({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card !p-2 animate-pulse">
          <div className="mb-2 h-28 rounded-lg bg-[var(--border)]" />
          <div className="h-3 w-2/3 rounded bg-[var(--border)]" />
        </div>
      ))}
    </div>
  );
}
