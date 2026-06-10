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

export function removeBackgroundSimple(img, tolerance = 40) {
  const { canvas, ctx } = createCanvasFromImage(img);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const bg = [data[0], data[1], data[2]];
  for (let i = 0; i < data.length; i += 4) {
    const diff = Math.abs(data[i] - bg[0]) + Math.abs(data[i + 1] - bg[1]) + Math.abs(data[i + 2] - bg[2]);
    if (diff < tolerance) data[i + 3] = 0;
  }
  ctx.putImageData(imageData, 0, 0);
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
