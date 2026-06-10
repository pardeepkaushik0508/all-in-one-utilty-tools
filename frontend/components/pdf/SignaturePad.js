import { useEffect, useRef, useState } from 'react';

export default function SignaturePad({ onSave, onClose }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const [hasStroke, setHasStroke] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getPoint = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height
    };
  };

  const startDraw = (event) => {
    event.preventDefault();
    drawingRef.current = true;
    const ctx = canvasRef.current.getContext('2d');
    const point = getPoint(event);
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  };

  const draw = (event) => {
    if (!drawingRef.current) return;
    event.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const point = getPoint(event);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    setHasStroke(true);
  };

  const endDraw = () => {
    drawingRef.current = false;
  };

  const clearPad = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasStroke(false);
  };

  const handleSave = () => {
    if (!hasStroke) return;
    onSave?.(canvasRef.current.toDataURL('image/png'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-2xl border border-theme bg-[var(--bg)] p-4 shadow-xl">
        <h3 className="font-display text-lg font-semibold text-heading">Draw your signature</h3>
        <p className="mt-1 text-sm text-muted">Sign with mouse or finger, then save to place on the PDF.</p>
        <canvas
          ref={canvasRef}
          width={640}
          height={220}
          className="mt-3 w-full touch-none rounded-xl border border-theme bg-white"
          onPointerDown={startDraw}
          onPointerMove={draw}
          onPointerUp={endDraw}
          onPointerLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={clearPad}>
            Clear
          </button>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={handleSave} disabled={!hasStroke}>
            Use Signature
          </button>
        </div>
      </div>
    </div>
  );
}
