import { useState } from 'react';
import BatchUploader from './BatchUploader';
import { BatchResults } from './BatchResults';
import DownloadAllButton from './DownloadAllButton';
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
  const [files, setFiles] = useState([]);
  const { loading, error, result, run } = useToolRequest();

  const handleSubmit = () => {
    if (!files.length) return run(() => Promise.reject(new Error('Please upload at least one video file.')));
    if (files.length === 1) return run(() => api.videoToMp3(files[0]));
    return run(() => api.videoToMp3Batch(files));
  };

  return (
    <ToolPanel>
      <BatchUploader
        accept="video/*"
        files={files}
        onChange={setFiles}
        maxFiles={20}
      />
      <ToolActions>
        <PrimaryButton onClick={handleSubmit} disabled={loading}>
          {files.length > 1 ? `Convert ${files.length} Videos to MP3` : 'Convert to MP3'}
        </PrimaryButton>
        {!result?.results && <DownloadLink url={result?.downloadUrl} filename={result?.downloadFilename} label="Download MP3" />}
        <DownloadAllButton items={result?.results || []} zipName="mp3-files.zip" />
      </ToolActions>
      <ToolLoading loading={loading} text={files.length > 1 ? `Extracting audio from ${files.length} files...` : 'Extracting audio...'} />
      <ToolError message={error} />
      <ToolSuccess message={!result?.results ? result?.message : ''} />
      <BatchResults items={result?.results} />
    </ToolPanel>
  );
}

export function VideoCompressionTool() {
  const [files, setFiles] = useState([]);
  const [crf, setCrf] = useState(28);
  const { loading, error, result, run } = useToolRequest();

  const handleSubmit = () => {
    if (!files.length) return run(() => Promise.reject(new Error('Please upload at least one video file.')));
    if (files.length === 1) return run(() => api.compressVideo(files[0], crf));
    return run(() => api.compressVideoBatch(files, crf));
  };

  return (
    <ToolPanel>
      <BatchUploader
        accept="video/*"
        files={files}
        onChange={setFiles}
        maxFiles={10}
      />
      <NumberField label="CRF (18 best quality, 35 smallest)" value={crf} onChange={setCrf} min={18} max={35} />
      <ToolActions>
        <PrimaryButton onClick={handleSubmit} disabled={loading}>
          {files.length > 1 ? `Compress ${files.length} Videos` : 'Compress Video'}
        </PrimaryButton>
        {!result?.results && <DownloadLink url={result?.downloadUrl} filename={result?.downloadFilename} />}
        <DownloadAllButton items={result?.results || []} zipName="compressed-videos.zip" />
      </ToolActions>
      <ToolLoading loading={loading} text={files.length > 1 ? `Compressing ${files.length} videos...` : 'Compressing video...'} />
      <ToolError message={error} />
      <ToolSuccess message={!result?.results ? result?.message : ''} />
      <BatchResults items={result?.results} />
    </ToolPanel>
  );
}

export function AudioCutterTool() {
  const [files, setFiles] = useState([]);
  const [start, setStart] = useState('0');
  const [duration, setDuration] = useState('30');
  const { loading, error, result, run } = useToolRequest();

  const handleSubmit = () => {
    if (!files.length) return run(() => Promise.reject(new Error('Please upload at least one audio file.')));
    if (files.length === 1) return run(() => api.cutAudio(files[0], start, duration));
    return run(() => api.cutAudioBatch(files, start, duration));
  };

  return (
    <ToolPanel>
      <BatchUploader
        accept="audio/*"
        files={files}
        onChange={setFiles}
        maxFiles={20}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="Start (seconds)" value={start} onChange={setStart} min={0} />
        <NumberField label="Duration (seconds)" value={duration} onChange={setDuration} min={1} />
      </div>
      <ToolActions>
        <PrimaryButton onClick={handleSubmit} disabled={loading}>
          {files.length > 1 ? `Cut ${files.length} Audio Files` : 'Cut Audio'}
        </PrimaryButton>
        {!result?.results && <DownloadLink url={result?.downloadUrl} filename={result?.downloadFilename} />}
        <DownloadAllButton items={result?.results || []} zipName="trimmed-audio.zip" />
      </ToolActions>
      <ToolLoading loading={loading} text={files.length > 1 ? `Trimming ${files.length} audio files...` : 'Trimming audio...'} />
      <ToolError message={error} />
      <ToolSuccess message={!result?.results ? result?.message : ''} />
      <BatchResults items={result?.results} />
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
