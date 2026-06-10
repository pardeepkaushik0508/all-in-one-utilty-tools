import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import MediaUploadZone from '../MediaUploadZone';
import PageThumbnailGrid from '../pdf/PageThumbnailGrid';
import useToolRequest from '../../hooks/useToolRequest';
import * as api from '../../services/api';
import {
  DownloadLink,
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

function buildPreviewItems(files, rotations) {
  return files.map((file, index) => ({
    id: `${file.name}-${file.lastModified}-${index}`,
    name: file.name,
    file,
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
    setFiles(orderMap);
  };

  const handleCreate = () => {
    const order = files.map((_, index) => index).join(',');
    const rotationValues = files.map((_, index) => rotations[index] || 0).join(',');

    if (mode === 'text') {
      if (!text.trim()) return run(() => Promise.reject(new Error('Enter text content to create a PDF.')));
      return run(() => api.createPdfFromText({ text, pageSize, orientation, fontSize }))
        .then((data) => {
          toast.success('PDF created successfully');
          return data;
        });
    }

    if (!files.length) return run(() => Promise.reject(new Error('Upload at least one file.')));

    const payload = { pageSize, orientation, order, rotations: rotationValues };
    const request =
      mode === 'mixed'
        ? () => api.createPdfFromMixed(files, payload)
        : () => api.createPdfFromImages(files, payload);

    return run(request).then((data) => {
      toast.success('PDF created successfully');
      return data;
    });
  };

  return (
    <ToolPanel>
      <SelectField label="Create mode" value={mode} onChange={setMode} options={MODE_OPTIONS} />

      <div className="grid gap-3 sm:grid-cols-2">
        <SelectField label="Page size" value={pageSize} onChange={setPageSize} options={PAGE_SIZE_OPTIONS} />
        <SelectField label="Orientation" value={orientation} onChange={setOrientation} options={ORIENTATION_OPTIONS} />
      </div>

      {mode === 'text' ? (
        <TextAreaField
          label="Text content"
          value={text}
          onChange={setText}
          placeholder="Type or paste the content you want in your PDF..."
          rows={10}
        />
      ) : (
        <>
          <MediaUploadZone
            multiple
            accept={mode === 'mixed' ? 'image/*,application/pdf' : 'image/*'}
            files={files}
            onFilesChange={setFiles}
            label="Upload files"
          />
          {!!items.length && (
            <div className="space-y-2">
              <p className="label-text">Page preview & order ({items.length})</p>
              <PageThumbnailGrid
                items={items}
                onReorder={(next) => handleReorder(next)}
                onRotate={handleRotate}
                onRemove={handleRemove}
              />
            </div>
          )}
        </>
      )}

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
