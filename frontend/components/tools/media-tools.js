import { useState } from 'react';
import FileDropZone from '../FileDropZone';
import useToolRequest from '../../hooks/useToolRequest';
import * as api from '../../services/api';
import {
  DownloadLink,
  NumberField,
  PrimaryButton,
  TextAreaField,
  ToolActions,
  ToolError,
  ToolLoading,
  ToolPanel,
  ToolSuccess
} from './shared';

export function VideoToMp3Tool() {
  const [file, setFile] = useState(null);
  const { loading, error, result, run } = useToolRequest();

  return (
    <ToolPanel>
      <FileDropZone accept="video/*" onFiles={(files) => setFile(files[0])} />
      <ToolActions>
        <PrimaryButton
          onClick={() => {
            if (!file) return run(() => Promise.reject(new Error('Please upload a video file.')));
            return run(() => api.videoToMp3(file));
          }}
          disabled={loading}
        >
          Convert to MP3
        </PrimaryButton>
        <DownloadLink url={result?.downloadUrl} filename={result?.downloadFilename} label="Download MP3" />
      </ToolActions>
      <ToolLoading loading={loading} text="Extracting audio..." />
      <ToolError message={error} />
    </ToolPanel>
  );
}

export function VideoCompressionTool() {
  const [file, setFile] = useState(null);
  const [crf, setCrf] = useState(28);
  const { loading, error, result, run } = useToolRequest();

  return (
    <ToolPanel>
      <FileDropZone accept="video/*" onFiles={(files) => setFile(files[0])} />
      <NumberField label="CRF (18 best quality, 35 smallest)" value={crf} onChange={setCrf} min={18} max={35} />
      <ToolActions>
        <PrimaryButton
          onClick={() => {
            if (!file) return run(() => Promise.reject(new Error('Please upload a video file.')));
            return run(() => api.compressVideo(file, crf));
          }}
          disabled={loading}
        >
          Compress Video
        </PrimaryButton>
        <DownloadLink url={result?.downloadUrl} filename={result?.downloadFilename} />
      </ToolActions>
      <ToolLoading loading={loading} text="Compressing video..." />
      <ToolError message={error} />
    </ToolPanel>
  );
}

export function AudioCutterTool() {
  const [file, setFile] = useState(null);
  const [start, setStart] = useState('0');
  const [duration, setDuration] = useState('30');
  const { loading, error, result, run } = useToolRequest();

  return (
    <ToolPanel>
      <FileDropZone accept="audio/*" onFiles={(files) => setFile(files[0])} />
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="Start (seconds)" value={start} onChange={setStart} min={0} />
        <NumberField label="Duration (seconds)" value={duration} onChange={setDuration} min={1} />
      </div>
      <ToolActions>
        <PrimaryButton
          onClick={() => {
            if (!file) return run(() => Promise.reject(new Error('Please upload an audio file.')));
            return run(() => api.cutAudio(file, start, duration));
          }}
          disabled={loading}
        >
          Cut Audio
        </PrimaryButton>
        <DownloadLink url={result?.downloadUrl} filename={result?.downloadFilename} />
      </ToolActions>
      <ToolLoading loading={loading} text="Trimming audio..." />
      <ToolError message={error} />
    </ToolPanel>
  );
}

export function VideoDownloaderTool() {
  const [url, setUrl] = useState('');
  const { loading, error, result, run } = useToolRequest();

  return (
    <ToolPanel>
      <TextAreaField
        label="Video URL"
        value={url}
        onChange={setUrl}
        placeholder="https://youtu.be/... or https://example.com/video.mp4"
        rows={3}
      />
      <p className="text-xs text-muted">
        Supports YouTube links (youtu.be / youtube.com) and direct MP4/WebM file URLs.
      </p>
      <ToolActions>
        <PrimaryButton
          onClick={() => {
            if (!url.trim()) return run(() => Promise.reject(new Error('Video URL is required.')));
            return run(() => api.downloadVideo(url.trim()));
          }}
          disabled={loading}
        >
          Download Video
        </PrimaryButton>
        <DownloadLink url={result?.downloadUrl} filename={result?.downloadFilename} />
      </ToolActions>
      <ToolLoading loading={loading} text="Downloading video..." />
      <ToolError message={error} />
      <ToolSuccess message={result?.message} />
    </ToolPanel>
  );
}
