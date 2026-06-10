import { useEffect, useState } from 'react';

export default function PdfTextEditModal({ open, initialText = '', title = 'Edit text', onSave, onClose }) {
  const [value, setValue] = useState(initialText);

  useEffect(() => {
    if (open) setValue(initialText);
  }, [open, initialText]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl border border-theme bg-[var(--bg)] p-4 shadow-xl animate-fade-in">
        <h3 className="font-display text-lg font-semibold text-heading">{title}</h3>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="input-field mt-3 h-28"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Escape') onClose?.();
            if (e.key === 'Enter' && e.ctrlKey) onSave?.(value);
          }}
        />
        <p className="mt-1 text-xs text-muted">Ctrl+Enter to save</p>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={() => onSave?.(value)}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
