import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import MediaUploadZone from '../MediaUploadZone';
import PageThumbnailGrid from '../pdf/PageThumbnailGrid';
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
  const [grayscale, setGrayscale] = useState('1');
  const [brightness, setBrightness] = useState('1');
  const [contrast, setContrast] = useState('1.1');
  const [pageSize, setPageSize] = useState('A4');
  const { loading, error, result, run } = useToolRequest();

  const items = useMemo(
    () =>
      files.map((file, index) => ({
        id: `${file.name}-${index}`,
        name: file.name,
        file,
        preview: URL.createObjectURL(file)
      })),
    [files]
  );

  useEffect(
    () => () => items.forEach((item) => item.preview && URL.revokeObjectURL(item.preview)),
    [items]
  );

  const handleScan = () => {
    if (!files.length) return run(() => Promise.reject(new Error('Capture or upload at least one page.')));

    const order = files.map((_, index) => index).join(',');
    return run(() =>
      api.scanToPdf(files, {
        pageSize,
        orientation: 'portrait',
        order,
        grayscale,
        brightness,
        contrast
      })
    ).then((data) => {
      toast.success('Scan converted to PDF');
      return data;
    });
  };

  return (
    <ToolPanel>
      <MediaUploadZone
        multiple
        accept="image/*"
        files={files}
        onFilesChange={setFiles}
        label="Upload scans"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <SelectField
          label="Black & white mode"
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
        <NumberField label="Brightness" value={brightness} onChange={setBrightness} min={0.5} max={1.5} step={0.1} />
        <NumberField label="Contrast" value={contrast} onChange={setContrast} min={0.5} max={2} step={0.1} />
      </div>

      {!!items.length && (
        <div className="space-y-2">
          <p className="label-text">Scan preview ({items.length} page(s))</p>
          <PageThumbnailGrid
            items={items}
            onReorder={(next) => setFiles(next.map((item) => item.file))}
            onRemove={(index) => setFiles((prev) => prev.filter((_, i) => i !== index))}
          />
        </div>
      )}

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
