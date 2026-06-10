import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import FileDropZone from '../FileDropZone';
import PageThumbnailGrid from '../pdf/PageThumbnailGrid';
import useToolRequest from '../../hooks/useToolRequest';
import { getPdfPageCount, renderPdfPageToDataUrl } from '../../utils/pdfPreview';
import * as api from '../../services/api';
import {
  DownloadLink,
  PrimaryButton,
  TextAreaField,
  ToolActions,
  ToolError,
  ToolLoading,
  ToolPanel,
  ToolSuccess
} from './shared';

export function DeletePdfPagesTool() {
  const [file, setFile] = useState(null);
  const [range, setRange] = useState('');
  const [pages, setPages] = useState([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const { loading, error, result, run } = useToolRequest();

  useEffect(() => {
    let cancelled = false;

    async function loadPreview() {
      if (!file) {
        setPages([]);
        return;
      }

      setLoadingPreview(true);
      try {
        const count = await getPdfPageCount(file);
        const previews = await Promise.all(
          Array.from({ length: Math.min(count, 12) }, async (_, index) => {
            const rendered = await renderPdfPageToDataUrl(file, index + 1, 0.5);
            return { id: `page-${index}`, name: `Page ${index + 1}`, preview: rendered.dataUrl };
          })
        );
        if (!cancelled) setPages(previews);
      } catch {
        if (!cancelled) setPages([]);
      } finally {
        if (!cancelled) setLoadingPreview(false);
      }
    }

    loadPreview();
    return () => {
      cancelled = true;
    };
  }, [file]);

  const handleSubmit = () => {
    if (!file) return run(() => Promise.reject(new Error('Please upload a PDF file.')));
    if (!range.trim()) return run(() => Promise.reject(new Error('Enter pages to delete (e.g. 2,4-6).')));

    return run(() => api.deletePdfPages(file, range)).then((data) => {
      toast.success('Pages deleted successfully');
      return data;
    });
  };

  return (
    <ToolPanel>
      <FileDropZone accept="application/pdf" onFiles={(items) => setFile(items[0] || null)} />
      <p className="text-sm text-muted">Selected: {file ? file.name : 'No file selected'}</p>

      <TextAreaField
        label="Pages to delete (e.g. 2,4-6)"
        value={range}
        onChange={setRange}
        rows={2}
        placeholder="Enter page numbers or ranges to remove"
      />

      {loadingPreview && <p className="text-sm text-muted animate-pulse">Loading page previews...</p>}
      {!!pages.length && (
        <div className="space-y-2">
          <p className="label-text">Page preview</p>
          <PageThumbnailGrid items={pages} />
        </div>
      )}

      <ToolActions>
        <PrimaryButton onClick={handleSubmit} disabled={loading}>
          Delete Pages
        </PrimaryButton>
        <DownloadLink url={result?.downloadUrl} filename={result?.downloadFilename} />
      </ToolActions>

      <ToolLoading loading={loading} text="Updating PDF..." />
      <ToolError message={error} />
      <ToolSuccess message={result?.message} />
    </ToolPanel>
  );
}
