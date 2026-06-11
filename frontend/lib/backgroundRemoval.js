import {
  canvasToBlob,
  createCanvasFromImage,
  loadImageFromFile,
  removeBackgroundAdvanced
} from './imageProcessors';

export const MAX_BG_REMOVAL_BYTES = 25 * 1024 * 1024;
const PROCESSING_TIMEOUT_MS = 120000;
const MAX_ML_DIMENSION = 4096;

export function validateImageForBgRemoval(file) {
  if (!file) {
    throw new Error('Please upload an image first.');
  }
  if (!file.type?.startsWith('image/')) {
    throw new Error('Invalid image format. Please upload JPG, PNG, or WebP.');
  }
  if (file.size > MAX_BG_REMOVAL_BYTES) {
    throw new Error(
      `Image is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is ${MAX_BG_REMOVAL_BYTES / 1024 / 1024}MB for background removal.`
    );
  }
}

async function prepareImage(file) {
  const img = await loadImageFromFile(file);
  const maxSide = Math.max(img.width, img.height);

  if (maxSide <= MAX_ML_DIMENSION) {
    return img;
  }

  const scale = MAX_ML_DIMENSION / maxSide;
  const { canvas } = createCanvasFromImage(
    img,
    Math.round(img.width * scale),
    Math.round(img.height * scale)
  );
  const blob = await canvasToBlob(canvas, 'image/png', 0.95);
  return loadImageFromFile(new File([blob], 'prepared.png', { type: 'image/png' }));
}

/**
 * Client-side background removal with multi-sample segmentation, edge refinement, and alpha matting.
 * Server-side AI tool uses ML via @imgly/background-removal-node for maximum quality.
 */
export async function removeBackgroundFromFile(file, { tolerance = 40, onProgress, signal } = {}) {
  validateImageForBgRemoval(file);

  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error('Background removal timed out. Try a smaller image or retry.')),
      PROCESSING_TIMEOUT_MS
    );
  });

  const abortPromise = signal
    ? new Promise((_, reject) => {
        if (signal.aborted) {
          reject(new Error('Processing cancelled.'));
          return;
        }
        signal.addEventListener('abort', () => reject(new Error('Processing cancelled.')), { once: true });
      })
    : null;

  try {
    onProgress?.(5);
    const img = await prepareImage(file);
    onProgress?.(15);

    const work = removeBackgroundAdvanced(img, {
      tolerance,
      onProgress: (pct) => onProgress?.(15 + Math.round(pct * 0.85))
    });

    const racers = [work, timeoutPromise];
    if (abortPromise) racers.push(abortPromise);

    const canvas = await Promise.race(racers);
    onProgress?.(100);
    return canvas;
  } catch (err) {
    if (err?.message?.includes('timed out') || err?.message?.includes('cancelled')) {
      throw err;
    }
    throw new Error(err?.message || 'Background removal failed. Please try another image.');
  } finally {
    clearTimeout(timeoutId);
  }
}
