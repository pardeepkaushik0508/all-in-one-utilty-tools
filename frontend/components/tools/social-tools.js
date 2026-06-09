import { useState } from 'react';
import useToolRequest from '../../hooks/useToolRequest';
import * as api from '../../services/api';
import {
  CopyButton,
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

export function InstagramDownloaderTool() {
  const [url, setUrl] = useState('');
  const { loading, error, result, run } = useToolRequest();

  return (
    <ToolPanel>
      <TextAreaField label="Instagram post URL" value={url} onChange={setUrl} rows={3} />
      <ToolActions>
        <PrimaryButton
          onClick={() => {
            if (!url.trim()) return run(() => Promise.reject(new Error('Instagram URL is required.')));
            return run(() => api.downloadInstagram(url.trim()));
          }}
          disabled={loading}
        >
          Resolve Media
        </PrimaryButton>
      </ToolActions>
      <ToolLoading loading={loading} text="Resolving media..." />
      <ToolError message={error} />
      {result && (
        <div className="animate-fade-in flex flex-wrap gap-3">
          {result.imageUrl && (
            <a href={result.imageUrl} className="tool-card-link" target="_blank" rel="noreferrer">
              Open image
            </a>
          )}
          {result.videoUrl && (
            <a href={result.videoUrl} className="tool-card-link" target="_blank" rel="noreferrer">
              Open video
            </a>
          )}
        </div>
      )}
    </ToolPanel>
  );
}

export function ThumbnailDownloaderTool() {
  const [url, setUrl] = useState('');
  const [quality, setQuality] = useState('hq');
  const { loading, error, result, run } = useToolRequest();

  return (
    <ToolPanel>
      <TextAreaField label="YouTube URL" value={url} onChange={setUrl} rows={3} />
      <SelectField
        label="Thumbnail quality"
        value={quality}
        onChange={setQuality}
        options={[
          { value: 'default', label: 'Default' },
          { value: 'mq', label: 'Medium' },
          { value: 'hq', label: 'High' },
          { value: 'maxres', label: 'Max Resolution' }
        ]}
      />
      <ToolActions>
        <PrimaryButton
          onClick={() => {
            if (!url.trim()) return run(() => Promise.reject(new Error('YouTube URL is required.')));
            return run(() => api.downloadThumbnail(url.trim(), quality));
          }}
          disabled={loading}
        >
          Fetch Thumbnail
        </PrimaryButton>
      </ToolActions>
      <ToolLoading loading={loading} text="Fetching thumbnail..." />
      <ToolError message={error} />
      {result?.thumbnailUrl && (
        <div className="animate-fade-in space-y-3">
          <img src={result.thumbnailUrl} alt="Video thumbnail" className="max-h-80 rounded-xl border border-theme" />
          <a href={result.thumbnailUrl} className="tool-card-link" target="_blank" rel="noreferrer">
            Open full image
          </a>
        </div>
      )}
    </ToolPanel>
  );
}

export function HashtagGeneratorTool() {
  const [keywords, setKeywords] = useState('');
  const [count, setCount] = useState(12);
  const [status, setStatus] = useState('');
  const { loading, error, result, run } = useToolRequest();

  return (
    <ToolPanel>
      <TextAreaField label="Keywords (comma or space separated)" value={keywords} onChange={setKeywords} rows={3} />
      <NumberField label="Number of hashtags" value={count} onChange={setCount} min={3} max={30} />
      <ToolActions>
        <PrimaryButton
          onClick={() => {
            if (!keywords.trim()) return run(() => Promise.reject(new Error('Keywords are required.')));
            return run(() => api.generateHashtags(keywords, count));
          }}
          disabled={loading}
        >
          Generate Hashtags
        </PrimaryButton>
      </ToolActions>
      <ToolLoading loading={loading} text="Generating hashtags..." />
      <ToolError message={error} />
      {result?.hashtags && (
        <div className="animate-fade-in space-y-3">
          <p className="rounded-xl border border-theme bg-[var(--bg-elevated)] p-3 text-sm text-body">{result.hashtags.join(' ')}</p>
          <ToolActions>
            <CopyButton text={result.hashtags.join(' ')} onCopied={setStatus} />
          </ToolActions>
        </div>
      )}
      {status && <ToolSuccess message={status} />}
    </ToolPanel>
  );
}
