import { useEffect, useState } from 'react';
import FileDropZone from '../../FileDropZone';
import MediaUploadZone from '../../MediaUploadZone';
import useToolRequest from '../../../hooks/useToolRequest';
import * as api from '../../../services/api';
import {
  DownloadBlobButton,
  DownloadLink,
  NumberField,
  PrimaryButton,
  SelectField,
  TextAreaField,
  ToolActions,
  ToolError,
  ToolLoading,
  ToolPanel
} from '../shared';
import {
  SOCIAL_PRESETS,
  adjustImage,
  addWatermark,
  blurImage,
  canvasToBlob,
  createCollage,
  createMemeImage,
  cropImage,
  flipImage,
  formatToMime,
  getImageMetadata,
  loadImageFromFile,
  pickColorFromImage,
  removeBackgroundSimple,
  resizeCanvas,
  rotateImage,
  sharpenImage,
  upscaleImage
} from '../../../lib/imageProcessors';

const CLIENT_OPS = {
  rotate: async (img, { degrees }) => rotateImage(img, Number(degrees) || 90),
  flip: async (img, { direction }) => flipImage(img, direction || 'horizontal'),
  crop: async (img, { x, y, width, height }) =>
    cropImage(img, Number(x) || 0, Number(y) || 0, Number(width) || img.width, Number(height) || img.height),
  blur: async (img, { amount }) => blurImage(img, Number(amount) || 4),
  sharpen: async (img) => sharpenImage(img),
  brightness: async (img, { value }) => adjustImage(img, { brightness: Number(value) || 100 }),
  contrast: async (img, { value }) => adjustImage(img, { contrast: Number(value) || 100 }),
  saturation: async (img, { value }) => adjustImage(img, { saturate: Number(value) || 100 }),
  grayscale: async (img) => adjustImage(img, { grayscale: true }),
  blackwhite: async (img) => adjustImage(img, { grayscale: true, contrast: 140 }),
  watermark: async (img, { text }) => addWatermark(img, text || 'Watermark'),
  upscale: async (img, { scale }) => upscaleImage(img, Number(scale) || 2),
  'bg-remove': async (img, { tolerance }) => removeBackgroundSimple(img, Number(tolerance) || 40),
  meme: async (img, { topText, bottomText }) => createMemeImage(img, topText, bottomText),
  social: async (img, { preset }) => {
    const p = SOCIAL_PRESETS[preset] || SOCIAL_PRESETS['instagram-post'];
    return resizeCanvas(img, p.width, p.height, 'cover');
  }
};

function buildInitialOptions(config) {
  const initial = {};
  if (config.defaultPreset) initial.preset = config.defaultPreset;
  config.fields?.forEach((field) => {
    if (field.default !== undefined) initial[field.key] = field.default;
  });
  return initial;
}

export default function ImageToolShell({ config }) {
  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState('');
  const [resultBlob, setResultBlob] = useState(null);
  const [resultUrl, setResultUrl] = useState('');
  const [downloadMeta, setDownloadMeta] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [color, setColor] = useState(null);
  const [options, setOptions] = useState(() => buildInitialOptions(config));
  const { loading, error, result, run } = useToolRequest();

  const file = files[0] || null;

  useEffect(() => {
    if (!file) {
      setPreview('');
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!resultUrl || !resultUrl.startsWith('blob:')) return undefined;
    return () => URL.revokeObjectURL(resultUrl);
  }, [resultUrl]);

  const setOpt = (key, value) => setOptions((prev) => ({ ...prev, [key]: value }));

  const processClient = async () => {
    if (!file && config.mode !== 'collage') throw new Error('Please upload an image first.');

    if (config.mode === 'metadata') {
      setMetadata(getImageMetadata(file));
      return;
    }

    if (config.mode === 'collage') {
      if (!files.length) throw new Error('Please upload at least one image.');
      const images = await Promise.all(files.map(loadImageFromFile));
      const canvas = createCollage(images, Number(options.columns) || 2);
      const blob = await canvasToBlob(canvas, 'image/png');
      setResultBlob(blob);
      setResultUrl(URL.createObjectURL(blob));
      setDownloadMeta(null);
      return;
    }

    const img = await loadImageFromFile(file);
    const handler = CLIENT_OPS[config.clientOp];
    if (!handler) throw new Error('Unsupported client operation.');
    const canvas = await handler(img, options);
    const format = options.format || config.defaultFormat || 'png';
    const mime = formatToMime(format);
    const blob = await canvasToBlob(canvas, mime, 0.92);
    setResultBlob(blob);
    setResultUrl(URL.createObjectURL(blob));
    setDownloadMeta(null);
  };

  const processServer = () => {
    if (!file) return run(() => Promise.reject(new Error('Please upload an image first.')));
    const payload = {
      ...options,
      operation: config.serverOp,
      format: options.format || config.defaultFormat || 'png'
    };
    return run(() => api.processImage(file, payload)).then((data) => {
      if (data?.downloadUrl) {
        setDownloadMeta({ url: data.downloadUrl, filename: data.downloadFilename });
        setResultUrl(data.downloadUrl);
        setResultBlob(null);
      }
      return data;
    });
  };

  const handleProcess = async () => {
    setResultBlob(null);
    setResultUrl('');
    setDownloadMeta(null);
    setMetadata(null);
    setColor(null);

    if (config.serverOp) {
      await processServer();
    } else {
      await processClient();
    }
  };

  const handleColorPick = async (event) => {
    if (!file || config.mode !== 'color-picker') return;
    const img = await loadImageFromFile(file);
    const rect = event.currentTarget.getBoundingClientRect();
    const scaleX = img.width / rect.width;
    const scaleY = img.height / rect.height;
    const x = Math.floor((event.clientX - rect.left) * scaleX);
    const y = Math.floor((event.clientY - rect.top) * scaleY);
    setColor(pickColorFromImage(img, x, y));
  };

  const uploadZone = config.useCamera ? (
    <MediaUploadZone
      accept="image/*"
      onFiles={(selected) => setFiles(selected)}
      selectedFiles={files}
      onRemoveFile={(index) => setFiles((prev) => prev.filter((_, i) => i !== index))}
    />
  ) : (
    <FileDropZone
      accept="image/*"
      multiple={config.multiple}
      onFiles={(selected) => setFiles(selected)}
      selectedFiles={files}
      onRemoveFile={(index) => setFiles((prev) => prev.filter((_, i) => i !== index))}
    />
  );

  return (
    <ToolPanel>
      {uploadZone}

      {preview && config.mode !== 'metadata' && (
        <div className="overflow-hidden rounded-2xl border border-theme bg-[var(--bg-elevated)] p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Preview</p>
          <img
            src={preview}
            alt="Upload preview"
            className={`max-h-96 w-full rounded-xl object-contain ${config.mode === 'color-picker' ? 'cursor-crosshair' : ''}`}
            onClick={config.mode === 'color-picker' ? handleColorPick : undefined}
          />
          {config.mode === 'color-picker' && (
            <p className="mt-2 text-xs text-muted">Click anywhere on the image to pick a color.</p>
          )}
        </div>
      )}

      {config.fields?.map((field) => {
        if (field.type === 'select') {
          return (
            <SelectField
              key={field.key}
              label={field.label}
              value={options[field.key] ?? field.default ?? field.options[0].value}
              onChange={(v) => setOpt(field.key, v)}
              options={field.options}
            />
          );
        }
        if (field.type === 'number') {
          return (
            <NumberField
              key={field.key}
              label={field.label}
              value={options[field.key] ?? field.default ?? 0}
              onChange={(v) => setOpt(field.key, v)}
              min={field.min}
              max={field.max}
            />
          );
        }
        return (
          <TextAreaField
            key={field.key}
            label={field.label}
            value={options[field.key] ?? ''}
            onChange={(v) => setOpt(field.key, v)}
            rows={field.rows || 2}
          />
        );
      })}

      {config.presetOptions && (
        <SelectField
          label="Social preset"
          value={options.preset || config.defaultPreset || 'instagram-post'}
          onChange={(v) => setOpt('preset', v)}
          options={Object.entries(SOCIAL_PRESETS).map(([value, p]) => ({ value, label: p.label }))}
        />
      )}

      <ToolActions>
        <PrimaryButton onClick={handleProcess} disabled={loading}>
          {config.buttonLabel || 'Process Image'}
        </PrimaryButton>
        {resultBlob && (
          <DownloadBlobButton blob={resultBlob} filename={config.downloadFilename || 'processed-image.png'} />
        )}
        {downloadMeta?.url && (
          <DownloadLink url={downloadMeta.url} filename={downloadMeta.filename} />
        )}
      </ToolActions>

      <ToolLoading loading={loading} text="Processing image..." />
      <ToolError message={error} />

      {resultUrl && config.mode !== 'metadata' && (
        <div className="animate-fade-in space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Result</p>
          <img src={resultUrl} alt="Processed result" className="max-h-96 w-full rounded-xl border border-theme object-contain" />
        </div>
      )}

      {metadata && (
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.entries(metadata).map(([key, value]) => (
            <div key={key} className="stat-card text-sm">
              <span className="text-muted">{key}</span>
              <p className="font-medium text-heading">{String(value)}</p>
            </div>
          ))}
        </div>
      )}

      {color && (
        <div className="stat-card flex items-center gap-4">
          <span className="h-12 w-12 rounded-xl border border-theme" style={{ background: color.hex }} />
          <div>
            <p className="font-mono text-heading">{color.hex}</p>
            <p className="text-sm text-muted">{color.rgb}</p>
          </div>
        </div>
      )}
    </ToolPanel>
  );
}
