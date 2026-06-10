import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import MediaUploadZone from '../MediaUploadZone';
import PageThumbnailGrid from '../pdf/PageThumbnailGrid';
import ProgressBar from '../pdf/ProgressBar';
import useToolRequest from '../../hooks/useToolRequest';
import * as api from '../../services/api';
import {
  DownloadLink,
  NumberField,
  PrimaryButton,
  SelectField,
  TextAreaField,
  ToolActions,
  ToolError,
  ToolLoading,
  ToolPanel,
  ToolSuccess
} from './shared';

const PAGE_SIZE_OPTIONS = [
  { value: 'A4', label: 'A4' },
  { value: 'LETTER', label: 'Letter' },
  { value: 'LEGAL', label: 'Legal' }
];

const ORIENTATION_OPTIONS = [
  { value: 'portrait', label: 'Portrait' },
  { value: 'landscape', label: 'Landscape' }
];

const MODE_OPTIONS = [
  { value: 'images', label: 'From Images' },
  { value: 'text', label: 'From Text' },
  { value: 'mixed', label: 'Images + PDFs' }
];

const COMPRESSION_OPTIONS = [
  { value: 'high', label: 'High quality' },
  { value: 'medium', label: 'Balanced' },
  { value: 'low', label: 'Smallest file' }
];

function buildPreviewItems(files, rotations) {
  return files.map((file, index) => ({
    id: `${file.name}-${file.lastModified}-${index}`,
    name: file.name,
    file,
    pageNumber: index + 1,
    preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
    rotation: rotations[index] || 0
  }));
}

export function CreatePdfTool() {
  const [mode, setMode] = useState('images');
  const [files, setFiles] = useState([]);
  const [rotations, setRotations] = useState([]);
  const [text, setText] = useState('');
  const [pageSize, setPageSize] = useState('A4');
  const [orientation, setOrientation] = useState('portrait');
  const [fontSize, setFontSize] = useState('12');
  const [compression, setCompression] = useState('medium');
  const [uploadProgress, setUploadProgress] = useState(0);
  const { loading, error, result, run } = useToolRequest();

  const items = useMemo(() => buildPreviewItems(files, rotations), [files, rotations]);

  useEffect(
    () => () => items.forEach((item) => item.preview && URL.revokeObjectURL(item.preview)),
    [items]
  );

  const handleRotate = (index) => {
    setRotations((prev) => {
      const next = [...prev];
      next[index] = ((next[index] || 0) + 90) % 360;
      return next;
    });
  };

  const handleRemove = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setRotations((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReorder = (nextFiles) => {
    const orderMap = nextFiles.map((item) => item.file);
    const newRotations = nextFiles.map((item) => item.rotation || 0);
    setFiles(orderMap);
    setRotations(newRotations);
  };

  const handleCreate = async () => {
    const order = files.map((_, index) => index).join(',');
    const rotationValues = files.map((_, index) => rotations[index] || 0).join(',');

    if (mode === 'text') {
      if (!text.trim()) return run(() => Promise.reject(new Error('Enter text content to create a PDF.')));
      setUploadProgress(30);
      return run(() => api.createPdfFromText({ text, pageSize, orientation, fontSize, compression }))
        .then((data) => {
          setUploadProgress(100);
          toast.success('PDF created successfully');
          return data;
        })
        .finally(() => setTimeout(() => setUploadProgress(0), 600));
    }

    if (!files.length) return run(() => Promise.reject(new Error('Upload at least one file.')));

    const payload = { pageSize, orientation, order, rotations: rotationValues, compression };
    const request =
      mode === 'mixed'
        ? () => api.createPdfFromMixed(files, payload)
        : () => api.createPdfFromImages(files, payload);

    setUploadProgress(20);
    return run(request)
      .then((data) => {
        setUploadProgress(100);
        toast.success('PDF created successfully');
        return data;
      })
      .finally(() => setTimeout(() => setUploadProgress(0), 600));
  };

  return (
    <ToolPanel>
      <div className="rounded-2xl border border-theme bg-[var(--bg-elevated)] p-4">
        <h3 className="font-display text-base font-semibold text-heading">Create PDF</h3>
        <p className="mt-1 text-sm text-muted">
          Build a PDF from images, text, or mixed files. Reorder pages, rotate, and choose page size before download.
        </p>
      </div>

      <SelectField label="Create mode" value={mode} onChange={setMode} options={MODE_OPTIONS} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SelectField label="Page size" value={pageSize} onChange={setPageSize} options={PAGE_SIZE_OPTIONS} />
        <SelectField label="Orientation" value={orientation} onChange={setOrientation} options={ORIENTATION_OPTIONS} />
        <SelectField label="Compression" value={compression} onChange={setCompression} options={COMPRESSION_OPTIONS} />
        {mode === 'text' && (
          <NumberField label="Font size" value={fontSize} onChange={setFontSize} min={8} max={24} />
        )}
      </div>

      {mode === 'text' ? (
        <TextAreaField
          label="Text content"
          value={text}
          onChange={setText}
          placeholder="Type or paste the content you want in your PDF..."
          rows={12}
        />
      ) : (
        <>
          <MediaUploadZone
            multiple
            accept={mode === 'mixed' ? 'image/*,application/pdf,.webp' : 'image/*,.webp'}
            files={files}
            onFilesChange={setFiles}
            label="Upload files"
          />
          {!!items.length && (
            <div className="space-y-2">
              <p className="label-text">Page preview & order ({items.length})</p>
              <PageThumbnailGrid
                items={items}
                onReorder={handleReorder}
                onRotate={handleRotate}
                onRemove={handleRemove}
                enableDragDrop
              />
            </div>
          )}
        </>
      )}

      {uploadProgress > 0 && <ProgressBar value={uploadProgress} label="Generating PDF..." />}

      <ToolActions>
        <PrimaryButton onClick={handleCreate} disabled={loading}>
          Create PDF
        </PrimaryButton>
        <DownloadLink url={result?.downloadUrl} filename={result?.downloadFilename} />
      </ToolActions>

      <ToolLoading loading={loading} text="Generating PDF..." />
      <ToolError message={error} />
      <ToolSuccess message={result?.message} />
    </ToolPanel>
  );
}
