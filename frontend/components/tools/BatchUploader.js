import FileDropZone from '../FileDropZone';

function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function BatchUploader({
  files,
  onChange,
  accept,
  maxFiles = 50,
  multiple = true
}) {
  const handleFiles = (incoming) => {
    const merged = [...files, ...incoming];
    const deduped = merged.filter(
      (file, index, arr) =>
        arr.findIndex(
          (item) =>
            item.name === file.name &&
            item.size === file.size &&
            item.lastModified === file.lastModified
        ) === index
    );
    onChange(deduped.slice(0, maxFiles));
  };

  const moveFile = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= files.length) return;
    const updated = [...files];
    const [item] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, item);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <FileDropZone multiple={multiple} accept={accept} onFiles={handleFiles} selectedFiles={files} onRemoveFile={(index) => onChange(files.filter((_, i) => i !== index))} />
      {files.length > 0 && (
        <div className="space-y-2 rounded-xl border border-theme bg-[var(--bg-elevated)] p-3">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>{files.length} file(s) in queue</span>
            <button type="button" className="underline" onClick={() => onChange([])}>
              Clear all
            </button>
          </div>
          <div className="space-y-1">
            {files.map((file, index) => (
              <div key={`${file.name}-${file.lastModified}-${file.size}`} className="flex items-center justify-between gap-3 rounded-lg border border-theme px-3 py-2 text-xs">
                <div className="min-w-0">
                  <p className="truncate font-medium text-heading">{file.name}</p>
                  <p className="text-muted">{formatFileSize(file.size)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" className="text-muted underline" onClick={() => moveFile(index, index - 1)} disabled={index === 0}>
                    Up
                  </button>
                  <button type="button" className="text-muted underline" onClick={() => moveFile(index, index + 1)} disabled={index === files.length - 1}>
                    Down
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
