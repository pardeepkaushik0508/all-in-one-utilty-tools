import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import useUndoRedo from '../../hooks/useUndoRedo';
import CameraCapture from '../CameraCapture';
import PdfTextEditModal from './PdfTextEditModal';
import ProgressBar from './ProgressBar';
import SignaturePad from './SignaturePad';
import {
  clearPdfDocumentCache,
  extractPdfTextItems,
  renderPdfPageToCanvas
} from '../../utils/pdfPreview';

const TOOLS = [
  { id: 'select', label: 'Select' },
  { id: 'edit-text', label: 'Edit Text' },
  { id: 'text', label: 'Add Text' },
  { id: 'whiteout', label: 'Whiteout' },
  { id: 'highlight', label: 'Highlight' },
  { id: 'rect', label: 'Rectangle' },
  { id: 'ellipse', label: 'Circle' },
  { id: 'line', label: 'Line' },
  { id: 'draw', label: 'Draw' },
  { id: 'image', label: 'Image' },
  { id: 'signature', label: 'Signature' }
];

const FONT_OPTIONS = [
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times', label: 'Times Roman' },
  { value: 'Courier', label: 'Courier' }
];

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function scalePoint(point, scale) {
  return { x: point.x / scale, y: point.y / scale };
}

export default function PdfEditor({ file, onSave, saving = false }) {
  const baseCanvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const dragRef = useRef(null);
  const shapeRef = useRef(null);

  const [tool, setTool] = useState('select');
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.25);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [pdfTextItems, setPdfTextItems] = useState([]);
  const [loadingPage, setLoadingPage] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [textInput, setTextInput] = useState('');
  const [fontSize, setFontSize] = useState('16');
  const [fontFamily, setFontFamily] = useState('Helvetica');
  const [color, setColor] = useState('#111827');
  const [overlayImage, setOverlayImage] = useState(null);
  const [imageMap, setImageMap] = useState({});
  const [textEditState, setTextEditState] = useState(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [pendingSignature, setPendingSignature] = useState('');
  const [showImageCamera, setShowImageCamera] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  const { value: annotations, setValue: setAnnotations, undo, redo, canUndo, canRedo, reset } = useUndoRedo([]);
  const safeAnnotations = Array.isArray(annotations) ? annotations : [];

  const pageAnnotations = useMemo(
    () => safeAnnotations.filter((item) => Number(item.page) === currentPage),
    [safeAnnotations, currentPage]
  );

  const redrawOverlay = useCallback(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pageAnnotations.forEach((item) => {
      const isSelected = item.id === selectedId;
      if (item.type === 'draw' && item.path?.length) {
        ctx.strokeStyle = item.color || '#2563EB';
        ctx.lineWidth = (item.lineWidth || 2) * scale;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        item.path.forEach((point, index) => {
          const x = point.x * scale;
          const y = point.y * scale;
          if (index === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      }

      if (item.type === 'highlight') {
        ctx.fillStyle = item.color || 'rgba(253, 224, 71, 0.45)';
        ctx.fillRect(item.x * scale, item.y * scale, item.width * scale, item.height * scale);
      }

      if (item.type === 'whiteout') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(item.x * scale, item.y * scale, item.width * scale, item.height * scale);
        ctx.strokeStyle = '#e5e7eb';
        ctx.strokeRect(item.x * scale, item.y * scale, item.width * scale, item.height * scale);
      }

      if (item.type === 'rect') {
        ctx.strokeStyle = item.color || '#2563EB';
        ctx.lineWidth = 2;
        ctx.strokeRect(item.x * scale, item.y * scale, item.width * scale, item.height * scale);
      }

      if (item.type === 'ellipse') {
        ctx.strokeStyle = item.color || '#2563EB';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(
          (item.x + item.width / 2) * scale,
          (item.y + item.height / 2) * scale,
          (item.width / 2) * scale,
          (item.height / 2) * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }

      if (item.type === 'line') {
        ctx.strokeStyle = item.color || '#2563EB';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(item.x * scale, item.y * scale);
        ctx.lineTo(item.x2 * scale, item.y2 * scale);
        ctx.stroke();
      }

      if (isSelected && item.width && item.height) {
        ctx.strokeStyle = '#7c3aed';
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(item.x * scale - 2, item.y * scale - 2, item.width * scale + 4, item.height * scale + 4);
        ctx.setLineDash([]);
      }
    });
  }, [pageAnnotations, scale, selectedId]);

  const loadPage = useCallback(async () => {
    if (!file) return;
    setLoadingPage(true);
    setLoadError('');
    setLoadProgress(15);

    try {
      const rendered = await renderPdfPageToCanvas(file, currentPage, scale);
      const textItems = await extractPdfTextItems(file, currentPage);

      const baseCanvas = baseCanvasRef.current;
      const overlayCanvas = overlayCanvasRef.current;
      if (!baseCanvas || !overlayCanvas) return;

      baseCanvas.width = rendered.width;
      baseCanvas.height = rendered.height;
      overlayCanvas.width = rendered.width;
      overlayCanvas.height = rendered.height;

      const baseCtx = baseCanvas.getContext('2d');
      baseCtx.clearRect(0, 0, baseCanvas.width, baseCanvas.height);
      baseCtx.drawImage(rendered.canvas, 0, 0);

      setPageSize({ width: rendered.width / scale, height: rendered.height / scale });
      setCanvasSize({ width: rendered.width, height: rendered.height });
      setPageCount(rendered.pageCount);
      setPdfTextItems(textItems);
      setLoadProgress(100);
    } catch (error) {
      console.error(error);
      setLoadError(error.message || 'Could not render PDF page.');
      toast.error('Could not render PDF page. Try another file.');
    } finally {
      setLoadingPage(false);
      setTimeout(() => setLoadProgress(0), 400);
    }
  }, [file, currentPage, scale]);

  useEffect(() => {
    reset([]);
    setSelectedId('');
    setCurrentPage(1);
    clearPdfDocumentCache();
  }, [file, reset]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  useEffect(() => {
    redrawOverlay();
  }, [redrawOverlay, pageAnnotations]);

  const getPoint = (event) => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
    return scalePoint({ x, y }, scale);
  };

  const findAnnotationAtPoint = (point) => {
    return [...pageAnnotations].reverse().find((item) => {
      if (item.type === 'line') return false;
      if (!item.width || !item.height) return false;
      return (
        point.x >= item.x &&
        point.x <= item.x + item.width &&
        point.y >= item.y &&
        point.y <= item.y + item.height
      );
    });
  };

  const updateAnnotation = (id, patch) => {
    setAnnotations((prev = []) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const addAnnotation = (item) => {
    setAnnotations((prev = []) => [...prev, item]);
  };

  const replaceExistingText = (textItem, newText) => {
    if (!newText.trim()) return;
    addAnnotation({
      id: createId('whiteout'),
      type: 'whiteout',
      page: currentPage,
      x: textItem.x - 2,
      y: textItem.y - 2,
      width: textItem.width + 8,
      height: textItem.height + 4
    });
    addAnnotation({
      id: createId('replace-text'),
      type: 'replace-text',
      page: currentPage,
      x: textItem.x,
      y: textItem.y,
      width: textItem.width,
      height: textItem.height,
      text: newText,
      originalText: textItem.str,
      fontSize: textItem.fontSize || Number(fontSize),
      fontFamily,
      color
    });
    toast.success('Text updated');
  };

  const handlePointerDown = (event) => {
    const point = getPoint(event);

    if (tool === 'select') {
      const hit = findAnnotationAtPoint(point);
      setSelectedId(hit?.id || '');
      if (hit) dragRef.current = { id: hit.id, offsetX: point.x - hit.x, offsetY: point.y - hit.y };
      return;
    }

    if (tool === 'edit-text') {
      const textHit = pdfTextItems.find(
        (item) =>
          point.x >= item.x &&
          point.x <= item.x + item.width &&
          point.y >= item.y &&
          point.y <= item.y + item.height
      );
      if (textHit) {
        setTextEditState({ item: textHit, value: textHit.str });
      }
      return;
    }

    if (tool === 'signature') {
      if (!pendingSignature) {
        setShowSignaturePad(true);
        return toast.error('Draw your signature first.');
      }
      addAnnotation({
        id: createId('signature'),
        type: 'signature',
        page: currentPage,
        x: point.x,
        y: point.y,
        width: 180,
        height: 70,
        dataUrl: pendingSignature
      });
      toast.success('Signature placed');
      return;
    }

    if (tool === 'text') {
      if (!textInput.trim()) return toast.error('Enter text in the box below, then click on the page.');
      addAnnotation({
        id: createId('text'),
        type: 'text',
        page: currentPage,
        x: point.x,
        y: point.y,
        width: Math.max(120, textInput.length * Number(fontSize) * 0.55),
        height: Number(fontSize) * 1.4,
        text: textInput,
        fontSize: Number(fontSize),
        fontFamily,
        color
      });
      setTextInput('');
      toast.success('Text placed');
      return;
    }

    if (tool === 'image') {
      if (!overlayImage) return toast.error('Choose an image first.');
      const imageId = createId('image');
      const fileIndex = Object.keys(imageMap).length;
      setImageMap((prev) => ({ ...prev, [fileIndex]: overlayImage }));
      addAnnotation({
        id: imageId,
        type: 'image',
        page: currentPage,
        x: point.x,
        y: point.y,
        width: 140,
        height: 100,
        fileIndex
      });
      return;
    }

    if (tool === 'draw') {
      shapeRef.current = {
        type: 'draw',
        id: createId('draw'),
        page: currentPage,
        color,
        lineWidth: 2,
        path: [point]
      };
      return;
    }

    shapeRef.current = {
      type: tool,
      start: point,
      page: currentPage,
      color: tool === 'highlight' ? 'rgba(253, 224, 71, 0.45)' : color
    };
  };

  const handlePointerMove = (event) => {
    const point = getPoint(event);

    if (dragRef.current) {
      const { id, offsetX, offsetY } = dragRef.current;
      updateAnnotation(id, { x: point.x - offsetX, y: point.y - offsetY });
      return;
    }

    if (shapeRef.current?.type === 'draw') {
      shapeRef.current.path.push(point);
      setAnnotations((prev) => {
        const existing = prev.find((item) => item.id === shapeRef.current.id);
        if (!existing) {
          return [...prev, { ...shapeRef.current }];
        }
        return prev.map((item) =>
          item.id === shapeRef.current.id ? { ...item, path: [...shapeRef.current.path] } : item
        );
      });
      return;
    }

    if (shapeRef.current?.start) {
      const { start, type, color: shapeColor } = shapeRef.current;
      const width = Math.abs(point.x - start.x);
      const height = Math.abs(point.y - start.y);
      const x = Math.min(start.x, point.x);
      const y = Math.min(start.y, point.y);

      const preview = {
        id: 'preview-shape',
        type,
        page: currentPage,
        x,
        y,
        width: Math.max(width, 8),
        height: Math.max(height, 8),
        x2: point.x,
        y2: point.y,
        color: shapeColor
      };

      setAnnotations((prev) => {
        const withoutPreview = prev.filter((item) => item.id !== 'preview-shape');
        return [...withoutPreview, preview];
      });
    }
  };

  const handlePointerUp = () => {
    if (shapeRef.current?.type === 'draw') {
      const finalized = { ...shapeRef.current, id: createId('draw') };
      setAnnotations((prev) => [...prev.filter((item) => item.id !== shapeRef.current.id), finalized]);
    } else if (shapeRef.current?.start) {
      setAnnotations((prev) =>
        prev.map((item) => (item.id === 'preview-shape' ? { ...item, id: createId(shapeRef.current.type) } : item))
      );
    }

    dragRef.current = null;
    shapeRef.current = null;
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setAnnotations((prev) => prev.filter((item) => item.id !== selectedId));
    setSelectedId('');
  };

  const exportPayload = async () => {
    const imageFiles = [];
    const fileIndexMap = {};
    const payload = [];

    safeAnnotations
      .filter((item) => item.id !== 'preview-shape')
      .forEach((item) => {
        if (item.type === 'image') {
          const source = imageMap[item.fileIndex];
          if (!source) return;
          if (fileIndexMap[item.fileIndex] === undefined) {
            fileIndexMap[item.fileIndex] = imageFiles.length;
            imageFiles.push(source);
          }
          payload.push({ ...item, fileIndex: fileIndexMap[item.fileIndex] });
          return;
        }

        if (item.type === 'signature' && item.dataUrl) {
          payload.push(item);
          return;
        }

        if (item.type === 'draw') {
          const pageDrawings = safeAnnotations.filter((a) => a.type === 'draw' && a.page === item.page);
          if (pageDrawings[0]?.id !== item.id) return;

          const canvas = document.createElement('canvas');
          canvas.width = pageSize.width;
          canvas.height = pageSize.height;
          const ctx = canvas.getContext('2d');
          pageDrawings.forEach((drawing) => {
            if (!drawing.path?.length) return;
            ctx.strokeStyle = drawing.color || '#2563EB';
            ctx.lineWidth = drawing.lineWidth || 2;
            ctx.beginPath();
            drawing.path.forEach((point, index) => {
              if (index === 0) ctx.moveTo(point.x, point.y);
              else ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
          });

          payload.push({
            type: 'drawing',
            page: item.page,
            x: 0,
            y: 0,
            width: pageSize.width,
            height: pageSize.height,
            dataUrl: canvas.toDataURL('image/png')
          });
          return;
        }

        payload.push(item);
      });

    return { payload, imageFiles };
  };

  const handleSave = async () => {
    const { payload, imageFiles } = await exportPayload();
    await onSave(payload, imageFiles);
  };

  if (!file) {
    return <p className="text-sm text-muted">Upload a PDF to start editing.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {TOOLS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTool(item.id)}
            className={tool === item.id ? 'btn-primary !px-3 !py-2 !text-xs' : 'btn-secondary !px-3 !py-2 !text-xs'}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="label-text">Font</span>
          <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="input-field">
            {FONT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label-text">Font size</span>
          <input
            type="number"
            min={8}
            max={72}
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            className="input-field"
          />
        </label>
        <label className="block">
          <span className="label-text">Color</span>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="input-field h-12" />
        </label>
        <label className="block">
          <span className="label-text">Zoom</span>
          <input
            type="range"
            min={0.8}
            max={2}
            step={0.1}
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            className="input-field"
          />
        </label>
      </div>

      {tool === 'text' && (
        <input
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Type text, then click on the page to place it"
          className="input-field"
        />
      )}

      {tool === 'image' && (
        <div className="space-y-3">
          <input type="file" accept="image/*" onChange={(e) => setOverlayImage(e.target.files?.[0] || null)} className="input-field" />
          <button type="button" className="btn-secondary !text-xs" onClick={() => setShowImageCamera((v) => !v)}>
            {showImageCamera ? 'Hide Camera' : 'Use Camera'}
          </button>
          {showImageCamera && (
            <CameraCapture
              onCapture={(captured) => {
                setOverlayImage(captured);
                setShowImageCamera(false);
                toast.success('Image captured — click on the PDF to place it');
              }}
            />
          )}
          {overlayImage && <p className="text-xs text-muted">Selected: {overlayImage.name}</p>}
        </div>
      )}

      {tool === 'signature' && (
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="btn-secondary" onClick={() => setShowSignaturePad(true)}>
            {pendingSignature ? 'Redraw Signature' : 'Draw Signature'}
          </button>
          {pendingSignature && (
            <img src={pendingSignature} alt="Signature preview" className="h-10 rounded border border-theme bg-white px-2" />
          )}
          <p className="text-xs text-muted">Draw a signature, then click on the PDF to place it.</p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted">
          Page {currentPage} of {pageCount || '—'}
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-secondary" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => p - 1)}>
            Previous
          </button>
          <button
            type="button"
            className="btn-secondary"
            disabled={!pageCount || currentPage >= pageCount}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </button>
          <button type="button" className="btn-secondary" onClick={undo} disabled={!canUndo}>
            Undo
          </button>
          <button type="button" className="btn-secondary" onClick={redo} disabled={!canRedo}>
            Redo
          </button>
          <button type="button" className="btn-secondary !text-red-500" onClick={deleteSelected} disabled={!selectedId}>
            Delete Selected
          </button>
        </div>
      </div>

      {loadingPage && <ProgressBar value={loadProgress || 35} label="Rendering PDF page..." />}
      {loadError && <p className="alert-error">{loadError}</p>}

      <div ref={containerRef} className="overflow-auto rounded-2xl border border-theme bg-white p-3">
        <div
          className="relative mx-auto"
          style={canvasSize.width ? { width: canvasSize.width, height: canvasSize.height } : undefined}
        >
          <canvas ref={baseCanvasRef} className="block" />
          <canvas
            ref={overlayCanvasRef}
            className="absolute left-0 top-0 touch-none"
            style={canvasSize.width ? { width: canvasSize.width, height: canvasSize.height } : undefined}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />

          {tool === 'edit-text' &&
            pageSize.width > 0 &&
            pdfTextItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className="absolute border border-dashed border-violet-400/70 bg-violet-500/10 text-left text-[10px] text-transparent"
                style={{
                  left: item.x * scale,
                  top: item.y * scale,
                  width: Math.max(item.width * scale, 8),
                  height: Math.max(item.height * scale, 8)
                }}
                onClick={() => setTextEditState({ item, value: item.str })}
                title={`Edit: ${item.str}`}
              >
                {item.str}
              </button>
            ))}

          {pageSize.width > 0 &&
            pageAnnotations
              .filter((item) => item.type === 'signature' && item.dataUrl)
              .map((item) => (
                <img
                  key={item.id}
                  src={item.dataUrl}
                  alt="Signature"
                  className={`absolute ${item.id === selectedId ? 'outline outline-2 outline-violet-500' : ''}`}
                  style={{
                    left: item.x * scale,
                    top: item.y * scale,
                    width: item.width * scale,
                    height: item.height * scale,
                    pointerEvents: 'none'
                  }}
                />
              ))}

          {pageSize.width > 0 &&
            pageAnnotations
              .filter((item) => item.type === 'text' || item.type === 'replace-text')
              .map((item) => (
                <div
                  key={item.id}
                  className={`absolute whitespace-pre-wrap px-1 ${item.id === selectedId ? 'outline outline-2 outline-violet-500' : ''}`}
                  style={{
                    left: item.x * scale,
                    top: item.y * scale,
                    maxWidth: Math.max((pageSize.width - item.x) * scale, 40),
                    color: item.color || '#111827',
                    fontSize: (item.fontSize || 16) * scale,
                    fontFamily: item.fontFamily || 'Helvetica, Arial, sans-serif',
                    lineHeight: 1.2,
                    pointerEvents: 'none'
                  }}
                >
                  {item.text}
                </div>
              ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Edited PDF'}
        </button>
      </div>

      <PdfTextEditModal
        open={!!textEditState}
        initialText={textEditState?.value || ''}
        title="Edit PDF text"
        onClose={() => setTextEditState(null)}
        onSave={(value) => {
          if (textEditState?.item) replaceExistingText(textEditState.item, value);
          setTextEditState(null);
        }}
      />

      {showSignaturePad && (
        <SignaturePad
          onClose={() => setShowSignaturePad(false)}
          onSave={(dataUrl) => {
            setPendingSignature(dataUrl);
            setShowSignaturePad(false);
            toast.success('Signature ready — click on the PDF to place it');
          }}
        />
      )}
    </div>
  );
}
