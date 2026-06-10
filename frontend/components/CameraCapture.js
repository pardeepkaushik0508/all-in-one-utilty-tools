import useCamera from '../hooks/useCamera';

export default function CameraCapture({ onCapture, onError, className = '' }) {
  const {
    videoRef,
    isActive,
    error,
    startCamera,
    stopCamera,
    switchCamera,
    capturePhoto
  } = useCamera('environment');

  const handleCapture = async () => {
    const file = await capturePhoto();
    if (!file) {
      onError?.('Could not capture image. Try again.');
      return;
    }
    onCapture?.(file);
  };

  return (
    <div className={`space-y-3 ${className}`.trim()}>
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
        <p className="text-xs text-muted">{error || 'Camera is off. Start the camera to capture a document.'}</p>
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
              Switch Camera
            </button>
            <button type="button" onClick={stopCamera} className="btn-secondary">
              Stop Camera
            </button>
          </>
        )}
      </div>
    </div>
  );
}
