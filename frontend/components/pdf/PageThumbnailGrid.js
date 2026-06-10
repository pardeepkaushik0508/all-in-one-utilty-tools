import { useState } from 'react';

export default function PageThumbnailGrid({
  items,
  onReorder,
  onRotate,
  onRemove,
  selectedIndex = -1,
  selectedIndices = [],
  markedIndices = [],
  onSelect,
  onToggleMark,
  enableDragDrop = true
}) {
  const [dragIndex, setDragIndex] = useState(null);

  const isMarked = (index) => markedIndices.includes(index);
  const isSelected = (index) =>
    selectedIndices.includes(index) || (selectedIndex >= 0 && selectedIndex === index);

  const moveItem = (from, to) => {
    if (!onReorder || to < 0 || to >= items.length) return;
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onReorder(next);
  };

  const handleDrop = (targetIndex) => {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      return;
    }
    moveItem(dragIndex, targetIndex);
    setDragIndex(null);
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {items.map((item, index) => (
        <div
          key={item.id || `${item.name}-${index}`}
          draggable={enableDragDrop && !!onReorder}
          onDragStart={() => setDragIndex(index)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleDrop(index);
          }}
          className={`card !p-2 transition-all duration-200 ${
            isMarked(index) ? 'ring-2 ring-red-500 bg-red-500/5' : ''
          } ${isSelected(index) ? 'ring-2 ring-violet-500' : ''} ${
            dragIndex === index ? 'opacity-60 scale-95' : ''
          }`}
        >
          <button
            type="button"
            onClick={() => {
              if (onToggleMark) onToggleMark(index);
              else onSelect?.(index);
            }}
            className="block w-full text-left"
          >
            <div className="relative mb-2 overflow-hidden rounded-lg bg-black/5">
              {item.preview ? (
                <img
                  src={item.preview}
                  alt={item.name || `Page ${index + 1}`}
                  className="h-32 w-full object-contain bg-white"
                  style={{ transform: item.rotation ? `rotate(${item.rotation}deg)` : undefined }}
                />
              ) : (
                <div className="flex h-32 items-center justify-center text-xs text-muted">
                  {item.name || `Page ${index + 1}`}
                </div>
              )}
              <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white">
                {item.pageNumber || index + 1}
              </span>
              {isMarked(index) && (
                <span className="absolute right-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                  Remove
                </span>
              )}
            </div>
            <p className="truncate text-xs text-muted">{item.name || `Page ${index + 1}`}</p>
          </button>

          {(onReorder || onRotate || onRemove) && (
            <div className="mt-2 flex flex-wrap gap-1">
              {onReorder && (
                <>
                  <button
                    type="button"
                    className="btn-secondary !px-2 !py-1 !text-[10px]"
                    onClick={() => moveItem(index, index - 1)}
                    aria-label="Move left"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    className="btn-secondary !px-2 !py-1 !text-[10px]"
                    onClick={() => moveItem(index, index + 1)}
                    aria-label="Move right"
                  >
                    →
                  </button>
                </>
              )}
              {onRotate && (
                <button
                  type="button"
                  className="btn-secondary !px-2 !py-1 !text-[10px]"
                  onClick={() => onRotate(index)}
                  aria-label="Rotate page"
                >
                  ↻
                </button>
              )}
              {onRemove && (
                <button
                  type="button"
                  className="btn-secondary !px-2 !py-1 !text-[10px] !text-red-500"
                  onClick={() => onRemove(index)}
                  aria-label="Remove page"
                >
                  ✕
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
