import FileDropZone, { FilePreviewCard, useFilePreviewUrls } from '../FileDropZone';

export default function BatchUploader({
  files,
  onChange,
  accept,
  maxFiles = 50,
  multiple = true
}) {
  const previewUrls = useFilePreviewUrls(files);

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
      <FileDropZone
        multiple={multiple}
        accept={accept}
        onFiles={handleFiles}
        selectedFiles={files}
        onRemoveFile={(index) => onChange(files.filter((_, i) => i !== index))}
        showFileList={false}
      />
      {files.length > 0 && (
        <div className="upload-queue-panel">
          <div className="upload-queue-header">
            <span>{files.length} file(s) in queue</span>
            <button type="button" className="upload-queue-clear" onClick={() => onChange([])}>
              Clear all
            </button>
          </div>
          <div className="file-preview-grid">
            {files.map((file, index) => (
              <FilePreviewCard
                key={`${file.name}-${file.lastModified}-${file.size}-${index}`}
                file={file}
                previewUrl={previewUrls[index]}
                onRemove={() => onChange(files.filter((_, i) => i !== index))}
                actions={(
                  <>
                    <button
                      type="button"
                      className="file-preview-action"
                      onClick={() => moveFile(index, index - 1)}
                      disabled={index === 0}
                      aria-label={`Move ${file.name} up`}
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      className="file-preview-action"
                      onClick={() => moveFile(index, index + 1)}
                      disabled={index === files.length - 1}
                      aria-label={`Move ${file.name} down`}
                    >
                      Down
                    </button>
                  </>
                )}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
