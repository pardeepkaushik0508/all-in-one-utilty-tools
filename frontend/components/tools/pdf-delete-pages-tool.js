import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import FileDropZone from '../FileDropZone';
import PageThumbnailGrid from '../pdf/PageThumbnailGrid';
import ProgressBar from '../pdf/ProgressBar';
import SkeletonGrid from '../pdf/SkeletonGrid';
import usePdfPages from '../../hooks/usePdfPages';
import useToolRequest from '../../hooks/useToolRequest';
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

const MODE_OPTIONS = [
  { id: 'delete', label: 'Delete Pages' },
  { id: 'extract', label: 'Extract Pages' },
  { id: 'organize', label: 'Reorder & Rotate' }
];

function indicesToRange(indices) {
  if (!indices.length) return '';
  const sorted = [...indices].sort((a, b) => a - b);
  const ranges = [];
  let start = sorted[0];
  let end = sorted[0];

  for (let i = 1; i < sorted.length; i += 1) {
    if (sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      ranges.push(start === end ? `${start}` : `${start}-${end}`);
      start = sorted[i];
      end = sorted[i];
    }
  }
  ranges.push(start === end ? `${start}` : `${start}-${end}`);
  return ranges.join(',');
}

export function DeletePdfPagesTool() {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState('delete');
  const [range, setRange] = useState('');
  const [markedPages, setMarkedPages] = useState([]);
  const [rotations, setRotations] = useState([]);
  const { pages, pageCount, loading: loadingPreview, progress, error: previewError, setPages } = usePdfPages(file);
  const { loading, error, result, run } = useToolRequest();

  const organizedPages = useMemo(
    () =>
      pages.map((page, index) => ({
        ...page,
        rotation: rotations[index] || 0
      })),
    [pages, rotations]
  );

  const toggleMarkedPage = (index) => {
    const pageNumber = pages[index]?.pageNumber || index + 1;
    setMarkedPages((prev) =>
      prev.includes(pageNumber) ? prev.filter((n) => n !== pageNumber) : [...prev, pageNumber]
    );
  };

  const syncRangeFromMarked = () => {
    setRange(indicesToRange(markedPages));
  };

  const handleRotate = (index) => {
    setRotations((prev) => {
      const next = [...prev];
      next[index] = ((next[index] || 0) + 90) % 360;
      return next;
    });
  };

  const handleReorder = (nextItems) => {
    const orderMap = nextItems.map((item) => item.pageNumber);
    const reordered = orderMap
      .map((pageNumber) => pages.find((page) => page.pageNumber === pageNumber))
      .filter(Boolean);
    const reorderedRotations = orderMap.map((pageNumber) => {
      const oldIndex = pages.findIndex((page) => page.pageNumber === pageNumber);
      return rotations[oldIndex] || 0;
    });
    setPages(reordered);
    setRotations(reorderedRotations);
  };

  const handleSubmit = () => {
    if (!file) return run(() => Promise.reject(new Error('Please upload a PDF file.')));

    if (mode === 'organize') {
      const order = pages.map((page) => page.pageNumber).join(',');
      const rotationValues = pages.map((_, index) => rotations[index] || 0).join(',');
      return run(() => api.reorderPdfPages(file, order, rotationValues)).then((data) => {
        toast.success('PDF pages reorganized');
        return data;
      });
    }

    const effectiveRange = range.trim() || indicesToRange(markedPages);
    if (!effectiveRange) {
      return run(() => Promise.reject(new Error('Select pages or enter a page range.')));
    }

    if (mode === 'extract') {
      return run(() => api.splitPdf(file, effectiveRange)).then((data) => {
        toast.success('Pages extracted successfully');
        return data;
      });
    }

    return run(() => api.deletePdfPages(file, effectiveRange)).then((data) => {
      toast.success('Pages deleted successfully');
      return data;
    });
  };

  return (
    <ToolPanel>
      <div className="flex flex-wrap gap-2">
        {MODE_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setMode(option.id)}
            className={mode === option.id ? 'btn-primary !px-3 !py-2 !text-xs' : 'btn-secondary !px-3 !py-2 !text-xs'}
          >
            {option.label}
          </button>
        ))}
      </div>

      <FileDropZone
        accept="application/pdf"
        onFiles={(items) => {
          setFile(items[0] || null);
          setMarkedPages([]);
          setRange('');
          setRotations([]);
        }}
        selectedFiles={file ? [file] : []}
        onRemoveFile={() => {
          setFile(null);
          setMarkedPages([]);
          setRange('');
          setRotations([]);
        }}
      />

      {mode !== 'organize' && (
        <TextAreaField
          label={mode === 'extract' ? 'Pages to extract (e.g. 2,4-6)' : 'Pages to delete (e.g. 2,4-6)'}
          value={range}
          onChange={setRange}
          rows={2}
          placeholder="Click thumbnails below or type page numbers"
        />
      )}

      {mode !== 'organize' && (
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-secondary !text-xs" onClick={syncRangeFromMarked}>
            Apply selected pages to range
          </button>
          <button type="button" className="btn-secondary !text-xs" onClick={() => setMarkedPages([])}>
            Clear selection
          </button>
        </div>
      )}

      {loadingPreview && (
        <div className="space-y-3">
          <ProgressBar value={progress} label="Loading page previews..." />
          <SkeletonGrid count={8} />
        </div>
      )}

      {previewError && <p className="alert-error">{previewError}</p>}

      {!loadingPreview && !!organizedPages.length && (
        <div className="space-y-2">
          <p className="label-text">
            {pageCount} page(s) — {mode === 'organize' ? 'drag to reorder, rotate as needed' : 'click pages to select'}
          </p>
          <PageThumbnailGrid
            items={organizedPages}
            markedIndices={
              mode === 'organize'
                ? []
                : markedPages.map((pageNumber) => pages.findIndex((page) => page.pageNumber === pageNumber))
            }
            onToggleMark={mode === 'organize' ? undefined : toggleMarkedPage}
            onReorder={mode === 'organize' ? handleReorder : undefined}
            onRotate={mode === 'organize' ? handleRotate : undefined}
            enableDragDrop={mode === 'organize'}
          />
        </div>
      )}

      <ToolActions>
        <PrimaryButton onClick={handleSubmit} disabled={loading || !file}>
          {mode === 'extract' ? 'Extract Pages' : mode === 'organize' ? 'Save Organization' : 'Delete Pages'}
        </PrimaryButton>
        <DownloadLink url={result?.downloadUrl} filename={result?.downloadFilename} />
      </ToolActions>

      <ToolLoading
        loading={loading}
        text={mode === 'extract' ? 'Extracting pages...' : mode === 'organize' ? 'Saving changes...' : 'Updating PDF...'}
      />
      <ToolError message={error} />
      <ToolSuccess message={result?.message} />
    </ToolPanel>
  );
}
