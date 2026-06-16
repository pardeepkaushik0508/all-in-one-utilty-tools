import { useEffect, useMemo, useRef, useState } from 'react';

export function formatFileSize(bytes) {
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

const EMPTY_FILES = [];

export function useFilePreviewUrls(files) {
  const [previewUrls, setPreviewUrls] = useState([]);

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

  return previewUrls;
}

export function FilePreviewCard({ file, previewUrl, onRemove, actions }) {
  const isImage = file.type?.startsWith('image/');
  const isVideo = file.type?.startsWith('video/');
  const isAudio = file.type?.startsWith('audio/');
  const isPdf = file.type === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf');

  return (
    <article className="file-preview-card">
      <div className="file-preview-thumb">
        {isImage && previewUrl ? (
          <img src={previewUrl} alt={file.name} className="h-full w-full object-cover" />
        ) : isVideo && previewUrl ? (
          <video src={previewUrl} className="h-full w-full object-cover" muted playsInline />
        ) : (
          <span className="file-preview-kind">
            {isPdf ? 'PDF' : isVideo ? 'Video' : isAudio ? 'Audio' : 'File'}
          </span>
        )}
      </div>

      <div className="file-preview-body">
        <p className="file-preview-name" title={file.name}>{file.name}</p>
        <p className="file-preview-meta">{fileTypeLabel(file)}</p>
        <p className="file-preview-meta">{formatFileSize(file.size)}</p>
      </div>

      {(onRemove || actions) && (
        <div className="file-preview-actions">
          {actions}
          {onRemove && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onRemove();
              }}
              className="file-preview-action"
              aria-label={`Remove ${file.name}`}
            >
              Remove
            </button>
          )}
        </div>
      )}
    </article>
  );
}

export default function FileDropZone({
  multiple = false,
  accept,
  onFiles,
  selectedFiles = [],
  onRemoveFile,
  showFileList = true
}) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const files = useMemo(() => selectedFiles.filter(Boolean), [selectedFiles]);
  const previewUrls = useFilePreviewUrls(showFileList ? files : EMPTY_FILES);

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

      {showFileList && files.length > 0 && (
        <div className="file-preview-grid" aria-label="Selected files">
          {files.map((file, index) => (
            <FilePreviewCard
              key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
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
