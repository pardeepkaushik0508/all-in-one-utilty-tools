export const SOCIAL_PRESETS = {
  passport: { width: 600, height: 600, label: 'Passport Photo (600×600)' },
  'instagram-post': { width: 1080, height: 1080, label: 'Instagram Post (1:1)' },
  'instagram-story': { width: 1080, height: 1920, label: 'Instagram Story (9:16)' },
  'youtube-thumbnail': { width: 1280, height: 720, label: 'YouTube Thumbnail (16:9)' },
  'facebook-cover': { width: 820, height: 312, label: 'Facebook Cover' },
  'twitter-post': { width: 1200, height: 675, label: 'Twitter/X Post' },
  'linkedin-banner': { width: 1584, height: 396, label: 'LinkedIn Banner' }
};

export function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not load image.'));
    };
    img.src = url;
  });
}

export function canvasToBlob(canvas, type = 'image/png', quality = 0.92) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to export image.'));
    }, type, quality);
  });
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function createCanvasFromImage(img, width = img.width, height = img.height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);
  return { canvas, ctx };
}

export function applyCanvasFilter(ctx, canvas, filter) {
  ctx.filter = filter;
  ctx.drawImage(canvas, 0, 0);
  ctx.filter = 'none';
}

export function rotateImage(img, degrees) {
  const rad = (degrees * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));
  const width = img.width * cos + img.height * sin;
  const height = img.width * sin + img.height * cos;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.translate(width / 2, height / 2);
  ctx.rotate(rad);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);
  return canvas;
}

export function flipImage(img, direction = 'horizontal') {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (direction === 'horizontal') {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(0, canvas.height);
    ctx.scale(1, -1);
  }
  ctx.drawImage(img, 0, 0);
  return canvas;
}

export function cropImage(img, x, y, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
  return canvas;
}

export function adjustImage(img, { brightness = 100, contrast = 100, saturate = 100, grayscale = false }) {
  const { canvas, ctx } = createCanvasFromImage(img);
  const filters = [
    `brightness(${brightness}%)`,
    `contrast(${contrast}%)`,
    `saturate(${saturate}%)`,
    grayscale ? 'grayscale(100%)' : ''
  ].filter(Boolean).join(' ');
  applyCanvasFilter(ctx, canvas, filters);
  return canvas;
}

export function blurImage(img, amount = 4) {
  const { canvas, ctx } = createCanvasFromImage(img);
  applyCanvasFilter(ctx, canvas, `blur(${amount}px)`);
  return canvas;
}

export function sharpenImage(img) {
  const { canvas, ctx } = createCanvasFromImage(img);
  applyCanvasFilter(ctx, canvas, 'contrast(130%) saturate(110%)');
  return canvas;
}

export function addWatermark(img, text, opacity = 0.5) {
  const { canvas, ctx } = createCanvasFromImage(img);
  ctx.font = `${Math.max(16, Math.round(canvas.width / 25))}px sans-serif`;
  ctx.fillStyle = `rgba(255,255,255,${opacity})`;
  ctx.textAlign = 'right';
  ctx.fillText(text, canvas.width - 20, canvas.height - 20);
  return canvas;
}

export function resizeCanvas(img, width, height, fit = 'cover') {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const scale = fit === 'cover'
    ? Math.max(width / img.width, height / img.height)
    : Math.min(width / img.width, height / img.height);
  const sw = img.width * scale;
  const sh = img.height * scale;
  const sx = (width - sw) / 2;
  const sy = (height - sh) / 2;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, sx, sy, sw, sh);
  return canvas;
}

export function upscaleImage(img, scale = 2) {
  return resizeCanvas(img, img.width * scale, img.height * scale, 'contain');
}

function srgbToLinear(channel) {
  const v = channel / 255;
  return v > 0.04045 ? ((v + 0.055) / 1.055) ** 2.4 : v / 12.92;
}

function rgbToLab(r, g, b) {
  const rL = srgbToLinear(r);
  const gL = srgbToLinear(g);
  const bL = srgbToLinear(b);
  const x = (rL * 0.4124564 + gL * 0.3575761 + bL * 0.1804375) / 0.95047;
  const y = (rL * 0.2126729 + gL * 0.7151522 + bL * 0.072175) / 1.0;
  const z = (rL * 0.0193339 + gL * 0.119192 + bL * 0.9503041) / 1.08883;
  const fx = x > 0.008856 ? x ** (1 / 3) : 7.787 * x + 16 / 116;
  const fy = y > 0.008856 ? y ** (1 / 3) : 7.787 * y + 16 / 116;
  const fz = z > 0.008856 ? z ** (1 / 3) : 7.787 * z + 16 / 116;
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

function deltaE(labA, labB) {
  const dL = labA[0] - labB[0];
  const da = labA[1] - labB[1];
  const db = labA[2] - labB[2];
  return Math.sqrt(dL * dL + da * da + db * db);
}

function estimateBackgroundLabs(data, width, height, band) {
  const buckets = new Map();
  const sample = (x, y) => {
    const i = (y * width + x) * 4;
    const key = `${data[i] >> 4},${data[i + 1] >> 4},${data[i + 2] >> 4}`;
    buckets.set(key, (buckets.get(key) || 0) + 1);
  };

  for (let x = 0; x < width; x += 1) {
    for (let y = 0; y < band; y += 1) sample(x, y);
    for (let y = height - band; y < height; y += 1) sample(x, y);
  }
  for (let y = band; y < height - band; y += 1) {
    for (let x = 0; x < band; x += 1) sample(x, y);
    for (let x = width - band; x < width; x += 1) sample(x, y);
  }

  const dominant = [...buckets.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  return dominant.map(([key]) => {
    const [r, g, b] = key.split(',').map((v) => Number(v) * 16 + 8);
    return rgbToLab(r, g, b);
  });
}

function blurAlphaChannel(mask, width, height, radius) {
  const output = new Float32Array(mask.length);
  const kernel = [];
  let sum = 0;
  for (let i = -radius; i <= radius; i += 1) {
    const w = Math.exp(-(i * i) / (2 * (radius / 2) ** 2));
    kernel.push(w);
    sum += w;
  }
  kernel.forEach((_, idx) => {
    kernel[idx] /= sum;
  });

  const temp = new Float32Array(mask.length);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let value = 0;
      for (let k = -radius; k <= radius; k += 1) {
        const sx = Math.min(width - 1, Math.max(0, x + k));
        value += mask[y * width + sx] * kernel[k + radius];
      }
      temp[y * width + x] = value;
    }
  }
  for (let x = 0; x < width; x += 1) {
    for (let y = 0; y < height; y += 1) {
      let value = 0;
      for (let k = -radius; k <= radius; k += 1) {
        const sy = Math.min(height - 1, Math.max(0, y + k));
        value += temp[sy * width + x] * kernel[k + radius];
      }
      output[y * width + x] = value;
    }
  }
  return output;
}

function floodBackground(mask, width, height, bgDistance, threshold) {
  const visited = new Uint8Array(mask.length);
  const queue = [];

  const enqueue = (x, y) => {
    const idx = y * width + x;
    if (visited[idx] || mask[idx] > 0.4 || bgDistance[idx] > threshold * 0.9) return;
    visited[idx] = 1;
    queue.push(idx);
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }

  while (queue.length) {
    const idx = queue.pop();
    mask[idx] = 0;
    const x = idx % width;
    const y = (idx - x) / width;
    if (x > 0) enqueue(x - 1, y);
    if (x < width - 1) enqueue(x + 1, y);
    if (y > 0) enqueue(x, y - 1);
    if (y < height - 1) enqueue(x, y + 1);
  }
}

function dilateForeground(mask, width, height, radius) {
  const output = new Float32Array(mask.length);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let peak = 0;
      for (let dy = -radius; dy <= radius; dy += 1) {
        for (let dx = -radius; dx <= radius; dx += 1) {
          const sx = Math.min(width - 1, Math.max(0, x + dx));
          const sy = Math.min(height - 1, Math.max(0, y + dy));
          peak = Math.max(peak, mask[sy * width + sx]);
        }
      }
      output[y * width + x] = peak;
    }
  }
  return output;
}

function suppressColorSpill(data, alpha) {
  const a = alpha / 255;
  if (a <= 0.01 || a >= 0.99) return;
  const spill = Math.max(data[0], data[1], data[2]);
  if (spill < 200) return;
  const factor = 1 - (1 - a) * 0.85;
  data[0] = Math.round(data[0] * factor);
  data[1] = Math.round(data[1] * factor);
  data[2] = Math.round(data[2] * factor);
}

/**
 * Advanced background removal: border sampling, LAB distance, flood-fill, feathered alpha, spill suppression.
 * Replaces the old single-pixel tolerance approach that caused halos and clipped subjects.
 */
export async function removeBackgroundAdvanced(img, { tolerance = 40, onProgress } = {}) {
  const { canvas, ctx } = createCanvasFromImage(img);
  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const { data } = imageData;
  const band = Math.max(2, Math.round(Math.min(width, height) * 0.025));
  const bgLabs = estimateBackgroundLabs(data, width, height, band);
  const threshold = Math.max(8, tolerance * 0.42);
  const mask = new Float32Array(width * height);
  const bgDistance = new Float32Array(width * height);
  const centerX = width / 2;
  const centerY = height / 2;
  const maxCenterDist = Math.sqrt(centerX * centerX + centerY * centerY) || 1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = y * width + x;
      const i = idx * 4;
      const pixelLab = rgbToLab(data[i], data[i + 1], data[i + 2]);
      let minDist = Infinity;
      bgLabs.forEach((bgLab) => {
        minDist = Math.min(minDist, deltaE(pixelLab, bgLab));
      });
      bgDistance[idx] = minDist;
      const edge = Math.min(x, y, width - 1 - x, height - 1 - y);
      const edgeBias = edge < band ? 0.65 : 1;
      const centerWeight = 1 - Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2) / maxCenterDist;
      const softness = Math.max(0, Math.min(1, ((minDist / threshold) - 0.25) * edgeBias));
      // Bias center region toward foreground to avoid cropping subjects.
      mask[idx] = Math.min(1, softness + centerWeight * 0.18 * (1 - softness));
    }
    if (y % 24 === 0) {
      onProgress?.(Math.round((y / height) * 55));
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  onProgress?.(60);
  floodBackground(mask, width, height, bgDistance, threshold);
  onProgress?.(70);

  const recovered = dilateForeground(mask, width, height, 1);
  onProgress?.(75);

  const feathered = blurAlphaChannel(recovered, width, height, 2);
  onProgress?.(90);

  for (let idx = 0; idx < mask.length; idx += 1) {
    const i = idx * 4;
    const alpha = Math.round(Math.max(0, Math.min(1, feathered[idx])) * 255);
    data[i + 3] = alpha;
    suppressColorSpill(data.subarray(i, i + 4), alpha);
  }

  ctx.putImageData(imageData, 0, 0);
  onProgress?.(100);
  return canvas;
}


export function getImageMetadata(file) {
  return {
    name: file.name,
    type: file.type,
    size: file.size,
    sizeFormatted: `${(file.size / 1024).toFixed(1)} KB`,
    lastModified: new Date(file.lastModified).toISOString()
  };
}

export function pickColorFromImage(img, x, y) {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const pixel = ctx.getImageData(x, y, 1, 1).data;
  const hex = `#${[pixel[0], pixel[1], pixel[2]].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
  return { hex, rgb: `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})` };
}

export function createMemeImage(img, topText, bottomText) {
  const { canvas, ctx } = createCanvasFromImage(img);
  const fontSize = Math.max(24, Math.round(canvas.width / 15));
  ctx.font = `bold ${fontSize}px Impact, sans-serif`;
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = Math.max(2, fontSize / 12);
  ctx.textAlign = 'center';
  [topText, bottomText].forEach((text, index) => {
    if (!text) return;
    const y = index === 0 ? fontSize + 10 : canvas.height - 20;
    ctx.strokeText(text, canvas.width / 2, y);
    ctx.fillText(text, canvas.width / 2, y);
  });
  return canvas;
}

export function createCollage(images, columns = 2) {
  const cellSize = 300;
  const rows = Math.ceil(images.length / columns);
  const canvas = document.createElement('canvas');
  canvas.width = columns * cellSize;
  canvas.height = rows * cellSize;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  images.forEach((img, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const resized = resizeCanvas(img, cellSize, cellSize, 'cover');
    ctx.drawImage(resized, col * cellSize, row * cellSize);
  });
  return canvas;
}

export function formatToMime(format) {
  const map = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif'
  };
  return map[format] || 'image/png';
}
