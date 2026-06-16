import { useState } from 'react';
import LoadingSpinner from '../LoadingSpinner';
import { resolveApiUrl } from '../../utils/apiBase';

export function ToolPanel({ children, className = '' }) {
  return <div className={`card tool-panel space-y-4 ${className}`.trim()}>{children}</div>;
}

export function ToolActions({ children }) {
  return <div className="tool-actions">{children}</div>;
}

function guessFilename(url, filename) {
  if (filename) return filename;
  try {
    const params = new URL(url, window.location.origin).searchParams;
    const fromQuery = params.get('filename');
    if (fromQuery) return fromQuery;
    const path = new URL(url, window.location.origin).pathname;
    return decodeURIComponent(path.split('/').pop() || 'download');
  } catch {
    return 'download';
  }
}

export function DownloadLink({ url, label = 'Download Result', filename }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  if (!url) return null;

  const handleDownload = async () => {
    if (downloading) return;

    const fetchUrl = resolveApiUrl(url.startsWith('http') ? url : url.startsWith('/') ? url : `/${url}`);
    const saveAs = guessFilename(fetchUrl, filename);

    setDownloading(true);
    setError('');

    try {
      const response = await fetch(fetchUrl);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = saveAs;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      setError('Could not download the file. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className="btn-success download-enter"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
          <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
        </svg>
        {downloading ? 'Downloading...' : label}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

export function ToolError({ message }) {
  if (!message) return null;
  return <div className="alert-error animate-fade-in">{message}</div>;
}

export function ToolSuccess({ message }) {
  if (!message) return null;
  return <div className="alert-success animate-fade-in">{message}</div>;
}

export function ToolLoading({ loading, text }) {
  if (!loading) return null;
  return <div className="animate-fade-in"><LoadingSpinner text={text} /></div>;
}

export function DownloadTextButton({ text, filename = 'result.txt' }) {
  if (!text) return null;

  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button type="button" onClick={handleDownload} className="btn-secondary">
      Download
    </button>
  );
}

export function DownloadBlobButton({ blob, filename = 'download.png', label = 'Download' }) {
  if (!blob) return null;

  const handleDownload = () => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button type="button" onClick={handleDownload} className="btn-success">
      {label}
    </button>
  );
}

export function CopyButton({ text, onCopied }) {
  if (!text) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      onCopied?.('Copied to clipboard.');
    } catch (_error) {
      onCopied?.('Could not copy. Please copy manually.', true);
    }
  };

  return (
    <button type="button" onClick={handleCopy} className="btn-secondary">
      Copy
    </button>
  );
}

export function TextAreaField({ label, value, onChange, placeholder, rows = 8, readOnly = false }) {
  return (
    <label className="block">
      <span className="label-text">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        readOnly={readOnly}
        className="input-field font-mono"
      />
    </label>
  );
}

export function NumberField({ label, value, onChange, min, max, step }) {
  return (
    <label className="block">
      <span className="label-text">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(e.target.value)}
        className="input-field"
      />
    </label>
  );
}

export function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="label-text">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="input-field">
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function PrimaryButton({ children, onClick, disabled }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="btn-primary">
      {children}
    </button>
  );
}
