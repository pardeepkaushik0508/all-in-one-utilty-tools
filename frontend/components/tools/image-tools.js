import { useState } from 'react';
import FileDropZone from '../FileDropZone';
import MediaUploadZone from '../MediaUploadZone';
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
        <DownloadLink url={result?.downloadUrl} filename={result?.downloadFilename} />
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
        <DownloadLink url={result?.downloadUrl} filename={result?.downloadFilename} />
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
        <DownloadLink url={result?.downloadUrl} filename={result?.downloadFilename} />
      </ToolActions>
      <ToolLoading loading={loading} text="Converting image..." />
      <ToolError message={error} />
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
        <FileDropZone accept="image/*" onFiles={(files) => setReferenceImage(files[0] || null)} />
        <p className="text-sm text-muted">
          {referenceImage
            ? `Selected: ${referenceImage.name} — Gemini will use it for style or editing guidance.`
            : 'Upload a reference image to guide style, composition, or edits.'}
        </p>
        {referenceImage && (
          <button type="button" onClick={() => setReferenceImage(null)} className="text-xs text-muted underline">
            Remove reference image
          </button>
        )}
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
