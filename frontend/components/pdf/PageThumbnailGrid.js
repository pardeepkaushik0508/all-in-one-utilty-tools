export default function PageThumbnailGrid({
  items,
  onReorder,
  onRotate,
  onRemove,
  selectedIndex = 0,
  onSelect
}) {
  const moveItem = (from, to) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onReorder(next);
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {items.map((item, index) => (
        <div
          key={item.id || `${item.name}-${index}`}
          className={`card !p-2 transition-all ${selectedIndex === index ? 'ring-2 ring-violet-500' : ''}`}
        >
          <button type="button" onClick={() => onSelect?.(index)} className="block w-full text-left">
            <div className="mb-2 overflow-hidden rounded-lg bg-black/5">
              {item.preview ? (
                <img src={item.preview} alt={`Page ${index + 1}`} className="h-28 w-full object-cover" />
              ) : (
                <div className="flex h-28 items-center justify-center text-xs text-muted">Page {index + 1}</div>
              )}
            </div>
            <p className="truncate text-xs text-muted">{item.name || `Page ${index + 1}`}</p>
          </button>

          <div className="mt-2 flex flex-wrap gap-1">
            <button type="button" className="btn-secondary !px-2 !py-1 !text-[10px]" onClick={() => moveItem(index, index - 1)}>
              ←
            </button>
            <button type="button" className="btn-secondary !px-2 !py-1 !text-[10px]" onClick={() => moveItem(index, index + 1)}>
              →
            </button>
            {onRotate && (
              <button type="button" className="btn-secondary !px-2 !py-1 !text-[10px]" onClick={() => onRotate(index)}>
                ↻
              </button>
            )}
            {onRemove && (
              <button type="button" className="btn-secondary !px-2 !py-1 !text-[10px] !text-red-500" onClick={() => onRemove(index)}>
                ✕
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
