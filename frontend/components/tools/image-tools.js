import { useState } from 'react';
import FileDropZone from '../FileDropZone';
import useToolRequest from '../../hooks/useToolRequest';
import * as api from '../../services/api';
import {
  CopyButton,
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

export function CompressImageTool() {
  const [file, setFile] = useState(null);
  const [quality, setQuality] = useState(70);
  const [width, setWidth] = useState('');
  const { loading, error, result, run } = useToolRequest();

  const handleSubmit = () => {
    if (!file) return run(() => Promise.reject(new Error('Please upload an image first.')));
    return run(() => api.compressImage(file, quality, width || undefined));
  };

  return (
    <ToolPanel>
      <FileDropZone accept="image/*" onFiles={(files) => setFile(files[0])} />
      <p className="text-sm text-muted">Selected: {file ? file.name : 'No file selected'}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="Quality (1-100)" value={quality} onChange={setQuality} min={1} max={100} />
        <NumberField label="Width (optional)" value={width} onChange={setWidth} />
      </div>
      <ToolActions>
        <PrimaryButton onClick={handleSubmit} disabled={loading}>Compress Image</PrimaryButton>
        <DownloadLink url={result?.downloadUrl} />
      </ToolActions>
      <ToolLoading loading={loading} text="Compressing image..." />
      <ToolError message={error} />
      <ToolSuccess message={result?.message} />
    </ToolPanel>
  );
}

export function ResizeImageTool() {
  const [file, setFile] = useState(null);
  const [width, setWidth] = useState('800');
  const [height, setHeight] = useState('');
  const { loading, error, result, run } = useToolRequest();

  const handleSubmit = () => {
    if (!file) return run(() => Promise.reject(new Error('Please upload an image first.')));
    return run(() => api.resizeImage(file, width, height || undefined));
  };

  return (
    <ToolPanel>
      <FileDropZone accept="image/*" onFiles={(files) => setFile(files[0])} />
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="Width" value={width} onChange={setWidth} />
        <NumberField label="Height (optional)" value={height} onChange={setHeight} />
      </div>
      <ToolActions>
        <PrimaryButton onClick={handleSubmit} disabled={loading}>Resize Image</PrimaryButton>
        <DownloadLink url={result?.downloadUrl} />
      </ToolActions>
      <ToolLoading loading={loading} text="Resizing image..." />
      <ToolError message={error} />
    </ToolPanel>
  );
}

export function ConvertJpgPngTool() {
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState('png');
  const { loading, error, result, run } = useToolRequest();

  const handleSubmit = () => {
    if (!file) return run(() => Promise.reject(new Error('Please upload an image first.')));
    return run(() => api.convertImage(file, format));
  };

  return (
    <ToolPanel>
      <FileDropZone accept="image/*" onFiles={(files) => setFile(files[0])} />
      <SelectField
        label="Target format"
        value={format}
        onChange={setFormat}
        options={[
          { value: 'png', label: 'PNG' },
          { value: 'jpg', label: 'JPG' },
          { value: 'webp', label: 'WEBP' }
        ]}
      />
      <ToolActions>
        <PrimaryButton onClick={handleSubmit} disabled={loading}>Convert Image</PrimaryButton>
        <DownloadLink url={result?.downloadUrl} />
      </ToolActions>
      <ToolLoading loading={loading} text="Converting image..." />
      <ToolError message={error} />
    </ToolPanel>
  );
}

export function ImageToTextTool() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const { loading, error, result, run } = useToolRequest();

  const handleSubmit = () => {
    if (!file) return run(() => Promise.reject(new Error('Please upload an image first.')));
    return run(() => api.imageToText(file));
  };

  return (
    <ToolPanel>
      <FileDropZone accept="image/*" onFiles={(files) => setFile(files[0])} />
      <ToolActions>
        <PrimaryButton onClick={handleSubmit} disabled={loading}>Extract Text</PrimaryButton>
      </ToolActions>
      <ToolLoading loading={loading} text="Running OCR..." />
      <ToolError message={error} />
      {result?.text && (
        <div className="animate-fade-in space-y-3">
          <textarea readOnly value={result.text} className="input-field h-56 font-mono" />
          <ToolActions>
            <CopyButton text={result.text} onCopied={(msg) => setStatus(msg)} />
          </ToolActions>
          {status && <ToolSuccess message={status} />}
        </div>
      )}
    </ToolPanel>
  );
}
