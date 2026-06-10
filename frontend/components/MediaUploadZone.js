import { useState } from 'react';
import FileDropZone from './FileDropZone';
import CameraCapture from './CameraCapture';

export default function MediaUploadZone({
  multiple = false,
  accept = 'image/*',
  files = [],
  onFilesChange,
  enableCamera = true,
  label = 'Upload files'
}) {
  const [mode, setMode] = useState('upload');

  const addFiles = (incoming) => {
    const next = multiple ? [...files, ...incoming] : incoming.slice(0, 1);
    onFilesChange(next);
  };

  return (
    <div className="space-y-4">
      {enableCamera && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={mode === 'upload' ? 'btn-primary' : 'btn-secondary'}
          >
            {label}
          </button>
          <button
            type="button"
            onClick={() => setMode('camera')}
            className={mode === 'camera' ? 'btn-primary' : 'btn-secondary'}
          >
            Use Camera
          </button>
        </div>
      )}

      {mode === 'camera' && enableCamera ? (
        <CameraCapture onCapture={(file) => addFiles([file])} />
      ) : (
        <FileDropZone multiple={multiple} accept={accept} onFiles={addFiles} />
      )}
    </div>
  );
}
