export default function SearchBar({ value, onChange, placeholder = 'Search by name or description...' }) {
  const preserveScroll = () => {
    if (typeof window === 'undefined') return;
    const scrollY = window.scrollY;
    requestAnimationFrame(() => window.scrollTo(0, scrollY));
  };

  return (
    <div className="relative search-bar">
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
      >
        <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
      </svg>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={preserveScroll}
        placeholder={placeholder}
        className="input-field pl-11 pr-10"
        autoComplete="off"
        enterKeyHint="search"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Clear search"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      )}
    </div>
  );
}
