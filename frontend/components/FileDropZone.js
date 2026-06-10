import { useEffect, useMemo, useRef, useState } from 'react';

function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileTypeLabel(file) {
  if (!file) return '';
  if (file.type) return file.type;
  const ext = file.name?.split('.').pop();
  return ext ? `.${ext.toUpperCase()}` : 'Unknown type';
}

function FilePreviewCard({ file, previewUrl, onRemove }) {
  const isImage = file.type?.startsWith('image/');
  const isVideo = file.type?.startsWith('video/');
  const isAudio = file.type?.startsWith('audio/');
  const isPdf = file.type === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf');

  return (
    <div className="flex items-start gap-3 rounded-xl border border-theme bg-[var(--bg-elevated)] p-3 text-left">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-theme bg-white">
        {isImage && previewUrl ? (
          <img src={previewUrl} alt={file.name} className="h-full w-full object-cover" />
        ) : isVideo && previewUrl ? (
          <video src={previewUrl} className="h-full w-full object-cover" muted playsInline />
        ) : (
          <span className="px-1 text-center text-[10px] font-semibold uppercase text-muted">
            {isPdf ? 'PDF' : isVideo ? 'Video' : isAudio ? 'Audio' : 'File'}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-heading">{file.name}</p>
        <p className="mt-0.5 text-xs text-muted">{fileTypeLabel(file)}</p>
        <p className="text-xs text-muted">{formatFileSize(file.size)}</p>
      </div>

      {onRemove && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          className="text-xs text-muted underline"
        >
          Remove
        </button>
      )}
    </div>
  );
}

export default function FileDropZone({
  multiple = false,
  accept,
  onFiles,
  selectedFiles = [],
  onRemoveFile
}) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);

  const files = useMemo(() => selectedFiles.filter(Boolean), [selectedFiles]);

  useEffect(() => {
    const urls = files.map((file) => {
      if (file.type?.startsWith('image/') || file.type?.startsWith('video/')) {
        return URL.createObjectURL(file);
      }
      return null;
    });
    setPreviewUrls(urls);
    return () => {
      urls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [files]);

  const handleFiles = (fileList) => {
    const nextFiles = Array.from(fileList || []);
    if (nextFiles.length) onFiles(nextFiles);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className="group cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300"
        style={{
          borderColor: isDragging ? 'var(--accent-border)' : 'var(--border)',
          background: isDragging ? 'var(--accent-subtle)' : 'var(--bg-elevated)'
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="icon-box mx-auto mb-3 h-12 w-12 transition-transform duration-300 group-hover:scale-105">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
            <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-sm font-medium text-heading">
          {isDragging ? 'Release to upload' : 'Drag & drop or click to browse'}
        </p>
        <p className="mt-1 text-xs text-muted">Max 100MB per file</p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <FilePreviewCard
              key={`${file.name}-${file.size}-${file.lastModified}`}
              file={file}
              previewUrl={previewUrls[index]}
              onRemove={
                onRemoveFile
                  ? () => onRemoveFile(index)
                  : () => onFiles(multiple ? files.filter((_, i) => i !== index) : [])
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
