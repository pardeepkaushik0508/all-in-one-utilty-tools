import { useState } from 'react';
import useCamera from '../hooks/useCamera';

export default function CameraCapture({ onCapture, onError, className = '' }) {
  const {
    videoRef,
    isActive,
    error,
    facingMode,
    startCamera,
    stopCamera,
    switchCamera,
    capturePhoto
  } = useCamera('environment');

  const [previewUrl, setPreviewUrl] = useState('');
  const [previewFile, setPreviewFile] = useState(null);

  const clearPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    setPreviewFile(null);
  };

  const handleCapture = async () => {
    const file = await capturePhoto();
    if (!file) {
      onError?.('Could not capture image. Try again.');
      return;
    }
    clearPreview();
    setPreviewFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRetake = () => {
    clearPreview();
    if (!isActive) startCamera();
  };

  const handleUsePhoto = () => {
    if (!previewFile) return;
    onCapture?.(previewFile);
    clearPreview();
  };

  return (
    <div className={`space-y-3 ${className}`.trim()}>
      {previewUrl ? (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-2xl border border-theme bg-black/80">
            <img src={previewUrl} alt="Captured preview" className="aspect-[4/3] w-full object-cover" />
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={handleUsePhoto} className="btn-primary">
              Use Photo
            </button>
            <button type="button" onClick={handleRetake} className="btn-secondary">
              Retake
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-theme bg-black/80">
            <video
              ref={videoRef}
              playsInline
              muted
              className="aspect-[4/3] w-full object-cover"
              aria-label="Camera preview"
            />
          </div>

          {(error || !isActive) && (
            <p className="text-xs text-muted">
              {error || 'Camera is off. Start the camera to capture a document or image.'}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {!isActive ? (
              <button type="button" onClick={startCamera} className="btn-primary">
                Open Camera
              </button>
            ) : (
              <>
                <button type="button" onClick={handleCapture} className="btn-primary">
                  Capture Photo
                </button>
                <button type="button" onClick={switchCamera} className="btn-secondary">
                  {facingMode === 'environment' ? 'Front Camera' : 'Rear Camera'}
                </button>
                <button type="button" onClick={stopCamera} className="btn-secondary">
                  Stop Camera
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
