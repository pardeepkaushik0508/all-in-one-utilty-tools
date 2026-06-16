import { useState } from 'react';
import FileDropZone from '../FileDropZone';
import MediaUploadZone from '../MediaUploadZone';
import BatchUploader from './BatchUploader';
import { BatchResults } from './BatchResults';
import DownloadAllButton from './DownloadAllButton';
import useToolRequest from '../../hooks/useToolRequest';
import * as api from '../../services/api';
import {
  CopyButton,
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

export function CompressImageTool() {
  const [files, setFiles] = useState([]);
  const [quality, setQuality] = useState(70);
  const [width, setWidth] = useState('');
  const { loading, error, result, run } = useToolRequest();

  const handleSubmit = () => {
    if (!files.length) return run(() => Promise.reject(new Error('Please upload at least one image first.')));
    if (files.length === 1) {
      return run(() => api.compressImage(files[0], quality, width || undefined));
    }
    return run(() => api.compressImageBatch(files, quality, width || undefined));
  };

  return (
    <ToolPanel>
      <BatchUploader accept="image/*" files={files} onChange={setFiles} />
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="Quality (1-100)" value={quality} onChange={setQuality} min={1} max={100} />
        <NumberField label="Width (optional)" value={width} onChange={setWidth} />
      </div>
      <ToolActions>
        <PrimaryButton onClick={handleSubmit} disabled={loading}>Compress Image</PrimaryButton>
        {!result?.results && <DownloadLink url={result?.downloadUrl} filename={result?.downloadFilename} />}
        <DownloadAllButton items={result?.results || []} zipName="compressed-images.zip" />
      </ToolActions>
      <ToolLoading loading={loading} text="Compressing image..." />
      <ToolError message={error} />
      <ToolSuccess message={result?.message} />
      <BatchResults items={result?.results} />
    </ToolPanel>
  );
}

export function ResizeImageTool() {
  const [files, setFiles] = useState([]);
  const [width, setWidth] = useState('800');
  const [height, setHeight] = useState('');
  const { loading, error, result, run } = useToolRequest();

  const handleSubmit = () => {
    if (!files.length) return run(() => Promise.reject(new Error('Please upload at least one image first.')));
    if (files.length === 1) {
      return run(() => api.resizeImage(files[0], width, height || undefined));
    }
    return run(() => api.resizeImageBatch(files, width, height || undefined));
  };

  return (
    <ToolPanel>
      <BatchUploader accept="image/*" files={files} onChange={setFiles} />
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="Width" value={width} onChange={setWidth} />
        <NumberField label="Height (optional)" value={height} onChange={setHeight} />
      </div>
      <ToolActions>
        <PrimaryButton onClick={handleSubmit} disabled={loading}>Resize Image</PrimaryButton>
        {!result?.results && <DownloadLink url={result?.downloadUrl} filename={result?.downloadFilename} />}
        <DownloadAllButton items={result?.results || []} zipName="resized-images.zip" />
      </ToolActions>
      <ToolLoading loading={loading} text="Resizing image..." />
      <ToolError message={error} />
      <BatchResults items={result?.results} />
    </ToolPanel>
  );
}

export function ConvertJpgPngTool() {
  const [files, setFiles] = useState([]);
  const [format, setFormat] = useState('png');
  const { loading, error, result, run } = useToolRequest();

  const handleSubmit = () => {
    if (!files.length) return run(() => Promise.reject(new Error('Please upload at least one image first.')));
    if (files.length === 1) {
      return run(() => api.convertImage(files[0], format));
    }
    return run(() => api.convertImageBatch(files, format));
  };

  return (
    <ToolPanel>
      <BatchUploader accept="image/*" files={files} onChange={setFiles} />
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
        {!result?.results && <DownloadLink url={result?.downloadUrl} filename={result?.downloadFilename} />}
        <DownloadAllButton items={result?.results || []} zipName="converted-images.zip" />
      </ToolActions>
      <ToolLoading loading={loading} text="Converting image..." />
      <ToolError message={error} />
      <BatchResults items={result?.results} />
    </ToolPanel>
  );
}

function downloadDataUrl(dataUrl, filename = 'ai-generated-image.png') {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function AiImageGeneratorTool() {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [referenceImage, setReferenceImage] = useState(null);
  const { loading, error, result, run } = useToolRequest();

  const handleGenerate = () => {
    if (!prompt.trim()) {
      return run(() => Promise.reject(new Error('Prompt is required.')));
    }
    return run(() => api.generateAiImage(prompt, { aspectRatio, referenceImage }));
  };

  return (
    <ToolPanel>
      <TextAreaField
        label="Image prompt"
        value={prompt}
        onChange={setPrompt}
        placeholder="Describe the image you want — e.g. A minimalist logo of a coffee cup on a white background"
        rows={4}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <SelectField
          label="Aspect ratio"
          value={aspectRatio}
          onChange={setAspectRatio}
          options={[
            { value: '1:1', label: 'Square (1:1)' },
            { value: '16:9', label: 'Landscape (16:9)' },
            { value: '9:16', label: 'Portrait (9:16)' },
            { value: '4:3', label: 'Standard (4:3)' },
            { value: '3:4', label: 'Tall (3:4)' }
          ]}
        />
      </div>

      <div className="space-y-2">
        <span className="label-text">Reference image (optional)</span>
        <FileDropZone
          accept="image/*"
          onFiles={(files) => setReferenceImage(files[0] || null)}
          selectedFiles={referenceImage ? [referenceImage] : []}
          onRemoveFile={() => setReferenceImage(null)}
        />
        <p className="text-sm text-muted">
          {referenceImage
            ? 'Reference image attached — Gemini will use it for style or editing guidance.'
            : 'Upload a reference image to guide style, composition, or edits.'}
        </p>
      </div>

      <div className="rounded-2xl border border-theme bg-[var(--bg-elevated)] p-3 text-sm text-muted">
        Powered by <strong className="text-heading">Google Gemini</strong> image generation. Describe your scene clearly
        for best results.
      </div>

      <ToolActions>
        <PrimaryButton onClick={handleGenerate} disabled={loading}>
          Generate Image
        </PrimaryButton>
      </ToolActions>

      <ToolLoading loading={loading} text="Generating image with Gemini..." />
      <ToolError message={error} />

      {result?.imageDataUrl && (
        <div className="animate-fade-in space-y-3">
          <img
            src={result.imageDataUrl}
            alt="AI generated"
            className="mx-auto max-h-[480px] rounded-2xl border border-theme object-contain"
          />
          {result.description && (
            <p className="text-sm text-muted">{result.description}</p>
          )}
          <ToolActions>
            <PrimaryButton onClick={() => downloadDataUrl(result.imageDataUrl, 'gemini-image.png')}>
              Download Image
            </PrimaryButton>
          </ToolActions>
          <p className="text-xs text-muted">Provider: {result.provider}</p>
          <ToolSuccess message={result.message} />
        </div>
      )}
    </ToolPanel>
  );
}

export function ImageToTextTool() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const { loading, error, result, run } = useToolRequest();

  const handleSubmit = () => {
    if (!file) return run(() => Promise.reject(new Error('Please upload or capture an image first.')));
    return run(() => api.imageToText(file));
  };

  return (
    <ToolPanel>
      <MediaUploadZone
        accept="image/*"
        files={file ? [file] : []}
        onFilesChange={(files) => setFile(files[0] || null)}
        label="Upload image"
      />
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
