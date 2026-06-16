import { useState } from 'react';
import JSZip from 'jszip';
import { resolveApiUrl } from '../../utils/apiBase';

export default function DownloadAllButton({ items = [], zipName = 'batch-results.zip' }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const downloadableItems = items.filter((item) => item.status === 'success' && item.downloadUrl);
  if (!downloadableItems.length) return null;

  const handleDownloadAll = async () => {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const zip = new JSZip();
      for (const item of downloadableItems) {
        let blob;
        if (item.downloadUrl.startsWith('blob:') || item.downloadUrl.startsWith('data:')) {
          const response = await fetch(item.downloadUrl);
          blob = await response.blob();
        } else {
          const fileUrl = resolveApiUrl(item.downloadUrl);
          const response = await fetch(fileUrl);
          if (!response.ok) continue;
          blob = await response.blob();
        }
        zip.file(item.downloadFilename || item.original || `output-${Date.now()}`, blob);
      }
      const content = await zip.generateAsync({ type: 'blob' });
      const objectUrl = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = zipName;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch (_error) {
      setError('Could not create ZIP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inline-flex flex-col gap-1">
      <button type="button" className="btn-success" onClick={handleDownloadAll} disabled={loading}>
        {loading ? 'Preparing ZIP...' : 'Download All (ZIP)'}
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
