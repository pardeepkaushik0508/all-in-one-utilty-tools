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
  ToolActions,
  ToolError,
  ToolLoading,
  ToolPanel,
  ToolSuccess
} from './shared';

export function ScanToPdfTool() {
  const [files, setFiles] = useState([]);
  const [rotations, setRotations] = useState([]);
  const [grayscale, setGrayscale] = useState('1');
  const [brightness, setBrightness] = useState('1');
  const [contrast, setContrast] = useState('1.15');
  const [sharpen, setSharpen] = useState('1');
  const [pageSize, setPageSize] = useState('A4');
  const [orientation, setOrientation] = useState('portrait');
  const [compression, setCompression] = useState('medium');
  const [progress, setProgress] = useState(0);
  const { loading, error, result, run } = useToolRequest();

  const items = useMemo(
    () =>
      files.map((file, index) => ({
        id: `${file.name}-${index}`,
        name: file.name,
        file,
        pageNumber: index + 1,
        preview: URL.createObjectURL(file),
        rotation: rotations[index] || 0
      })),
    [files, rotations]
  );

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

  const handleScan = () => {
    if (!files.length) return run(() => Promise.reject(new Error('Capture or upload at least one page.')));

    const order = files.map((_, index) => index).join(',');
    const rotationValues = files.map((_, index) => rotations[index] || 0).join(',');
    setProgress(25);

    return run(() =>
      api.scanToPdf(files, {
        pageSize,
        orientation,
        order,
        rotations: rotationValues,
        grayscale,
        brightness,
        contrast,
        sharpen,
        compression
      })
    )
      .then((data) => {
        setProgress(100);
        toast.success('Scan converted to PDF');
        return data;
      })
      .finally(() => setTimeout(() => setProgress(0), 600));
  };

  return (
    <ToolPanel>
      <div className="rounded-2xl border border-theme bg-[var(--bg-elevated)] p-4">
        <h3 className="font-display text-base font-semibold text-heading">Scan to PDF</h3>
        <p className="mt-1 text-sm text-muted">
          Capture documents with your camera or upload scans. Enhance, reorder pages, and export as PDF.
        </p>
      </div>

      <MediaUploadZone
        multiple
        accept="image/*"
        files={files}
        onFilesChange={setFiles}
        label="Upload scans"
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <SelectField
          label="Color mode"
          value={grayscale}
          onChange={setGrayscale}
          options={[
            { value: '0', label: 'Color' },
            { value: '1', label: 'Black & White' }
          ]}
        />
        <SelectField
          label="Page size"
          value={pageSize}
          onChange={setPageSize}
          options={[
            { value: 'A4', label: 'A4' },
            { value: 'LETTER', label: 'Letter' },
            { value: 'LEGAL', label: 'Legal' }
          ]}
        />
        <SelectField
          label="Orientation"
          value={orientation}
          onChange={setOrientation}
          options={[
            { value: 'portrait', label: 'Portrait' },
            { value: 'landscape', label: 'Landscape' }
          ]}
        />
        <NumberField label="Brightness" value={brightness} onChange={setBrightness} min={0.5} max={1.5} step={0.1} />
        <NumberField label="Contrast" value={contrast} onChange={setContrast} min={0.5} max={2} step={0.1} />
        <SelectField
          label="Enhancement"
          value={sharpen}
          onChange={setSharpen}
          options={[
            { value: '0', label: 'Normal' },
            { value: '1', label: 'Sharpen text' }
          ]}
        />
        <SelectField
          label="Compression"
          value={compression}
          onChange={setCompression}
          options={[
            { value: 'high', label: 'High quality' },
            { value: 'medium', label: 'Balanced' },
            { value: 'low', label: 'Smallest file' }
          ]}
        />
      </div>

      {!!items.length && (
        <div className="space-y-2">
          <p className="label-text">Scan preview ({items.length} page(s))</p>
          <PageThumbnailGrid
            items={items}
            onReorder={(next) => {
              setFiles(next.map((item) => item.file));
              setRotations(next.map((item) => item.rotation || 0));
            }}
            onRotate={handleRotate}
            onRemove={(index) => {
              setFiles((prev) => prev.filter((_, i) => i !== index));
              setRotations((prev) => prev.filter((_, i) => i !== index));
            }}
            enableDragDrop
          />
        </div>
      )}

      {progress > 0 && <ProgressBar value={progress} label="Building scanned PDF..." />}

      <ToolActions>
        <PrimaryButton onClick={handleScan} disabled={loading}>
          Convert to PDF
        </PrimaryButton>
        <DownloadLink url={result?.downloadUrl} filename={result?.downloadFilename} />
      </ToolActions>

      <ToolLoading loading={loading} text="Processing scans..." />
      <ToolError message={error} />
      <ToolSuccess message={result?.message} />
    </ToolPanel>
  );
}
