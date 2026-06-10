import { useEffect, useState } from 'react';
import { getPdfPageCount, renderPdfPageToDataUrl } from '../utils/pdfPreview';

export default function usePdfPages(file, { scale = 0.45, batchSize = 4 } = {}) {
  const [pages, setPages] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadPages() {
      if (!file) {
        setPages([]);
        setPageCount(0);
        setProgress(0);
        setError('');
        return;
      }

      setLoading(true);
      setError('');
      setProgress(0);
      setPages([]);

      try {
        const count = await getPdfPageCount(file);
        if (cancelled) return;
        setPageCount(count);

        const loaded = [];
        for (let start = 0; start < count; start += batchSize) {
          const end = Math.min(start + batchSize, count);
          const batch = await Promise.all(
            Array.from({ length: end - start }, async (_, offset) => {
              const pageNumber = start + offset + 1;
              const rendered = await renderPdfPageToDataUrl(file, pageNumber, scale);
              return {
                id: `page-${pageNumber}`,
                pageNumber,
                name: `Page ${pageNumber}`,
                preview: rendered.dataUrl
              };
            })
          );

          if (cancelled) return;
          loaded.push(...batch);
          setPages([...loaded]);
          setProgress(Math.round((loaded.length / count) * 100));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Could not load PDF pages.');
          setPages([]);
          setPageCount(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPages();
    return () => {
      cancelled = true;
    };
  }, [file, scale, batchSize]);

  return { pages, pageCount, loading, progress, error, setPages };
}
