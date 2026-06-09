import { useRef, useState } from 'react';

export default function FileDropZone({ multiple = false, accept, onFiles }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length) onFiles(files);
  };

  return (
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
      <p className="mt-1 text-xs text-muted">Max 10MB · 50MB for media</p>
    </div>
  );
}
