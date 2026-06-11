const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const Tesseract = require('tesseract.js');
const { removeBackground } = require('@imgly/background-removal-node');
const { processedDir } = require('../utils/upload');
const { removeFiles } = require('../utils/fileCleanup');
const { generateGeminiImage } = require('./geminiService');

async function compressImage(file, options = {}) {
  const quality = Math.min(100, Math.max(1, Number(options.quality || 70)));
  const width = options.width ? Number(options.width) : null;
  const outputName = `compressed-${Date.now()}.jpg`;
  const outputPath = path.join(processedDir, outputName);

  let pipeline = sharp(file.path).jpeg({ quality, mozjpeg: true });
  if (width && !Number.isNaN(width)) {
    pipeline = pipeline.resize({ width, withoutEnlargement: true });
  }

  await pipeline.toFile(outputPath);
  await removeFiles([file]);
  return { filename: outputName };
}

async function resizeImage(file, options = {}) {
  const width = Number(options.width);
  const height = Number(options.height);
  if (!width && !height) {
    throw new Error('Provide width and/or height.');
  }

  const outputName = `resized-${Date.now()}.png`;
  const outputPath = path.join(processedDir, outputName);

  await sharp(file.path)
    .resize({
      width: width || undefined,
      height: height || undefined,
      fit: 'inside',
      withoutEnlargement: true
    })
    .png()
    .toFile(outputPath);

  await removeFiles([file]);
  return { filename: outputName };
}

async function convertImage(file, targetFormat) {
  const format = String(targetFormat || 'png').toLowerCase();
  const allowed = ['png', 'jpg', 'jpeg', 'webp'];
  if (!allowed.includes(format)) {
    throw new Error('Supported formats: png, jpg, webp.');
  }

  const ext = format === 'jpeg' ? 'jpg' : format;
  const outputName = `converted-${Date.now()}.${ext}`;
  const outputPath = path.join(processedDir, outputName);

  let pipeline = sharp(file.path);
  if (ext === 'jpg') pipeline = pipeline.jpeg({ quality: 90 });
  if (ext === 'png') pipeline = pipeline.png();
  if (ext === 'webp') pipeline = pipeline.webp({ quality: 90 });

  await pipeline.toFile(outputPath);
  await removeFiles([file]);
  return { filename: outputName };
}

async function extractTextFromImage(file) {
  const { data } = await Tesseract.recognize(file.path, 'eng', {
    logger: () => {}
  });

  await removeFiles([file]);
  return { text: (data.text || '').trim() };
}

const MAX_BG_REMOVAL_BYTES = 25 * 1024 * 1024;
const BG_REMOVAL_TIMEOUT_MS = 120000;

async function removeImageBackground(file) {
  const inputBuffer = await fs.readFile(file.path);

  if (!file.mimetype?.startsWith('image/')) {
    throw new Error('Invalid image format. Please upload JPG, PNG, or WebP.');
  }
  if (inputBuffer.length > MAX_BG_REMOVAL_BYTES) {
    throw new Error(`Image is too large. Maximum is ${MAX_BG_REMOVAL_BYTES / 1024 / 1024}MB for background removal.`);
  }

  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Background removal timed out. Try a smaller image.')), BG_REMOVAL_TIMEOUT_MS);
  });

  const blob = await Promise.race([
    removeBackground(inputBuffer, { output: { format: 'image/png', quality: 1 } }),
    timeout
  ]);

  const outputName = `bg-removed-${Date.now()}.png`;
  const outputPath = path.join(processedDir, outputName);
  await fs.writeFile(outputPath, Buffer.from(await blob.arrayBuffer()));
  await removeFiles([file]);
  return { filename: outputName };
}

async function generateAiImage(prompt, options = {}) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured. Add it to backend/.env and restart the server.');
  }

  return generateGeminiImage(prompt, options);
}

async function processImage(file, options = {}) {
  const operation = String(options.operation || 'convert');
  const format = String(options.format || 'png').toLowerCase();
  const ext = format === 'jpeg' ? 'jpg' : format;
  const outputName = `processed-${Date.now()}.${ext}`;
  const outputPath = path.join(processedDir, outputName);

  let pipeline = sharp(file.path);

  if (operation === 'resize' || operation === 'thumbnail') {
    const width = options.width ? Number(options.width) : null;
    const height = options.height ? Number(options.height) : null;
    pipeline = pipeline.resize({
      width: width || undefined,
      height: height || undefined,
      fit: 'inside',
      withoutEnlargement: false
    });
  }

  if (operation === 'rotate') {
    pipeline = pipeline.rotate(Number(options.degrees) || 90);
  }

  if (operation === 'flip') {
    pipeline = options.direction === 'vertical' ? pipeline.flip() : pipeline.flop();
  }

  if (operation === 'blur') {
    pipeline = pipeline.blur(Number(options.amount) || 3);
  }

  if (operation === 'sharpen') {
    pipeline = pipeline.sharpen();
  }

  if (operation === 'greyscale' || operation === 'grayscale') {
    pipeline = pipeline.grayscale();
  }

  if (operation === 'modulate') {
    pipeline = pipeline.modulate({
      brightness: options.brightness ? Number(options.brightness) / 100 : 1,
      saturation: options.saturation ? Number(options.saturation) / 100 : 1
    });
  }

  if (operation === 'bg-remove') {
    return removeImageBackground(file);
  }

  if (ext === 'jpg') pipeline = pipeline.jpeg({ quality: 90 });
  else if (ext === 'png') pipeline = pipeline.png();
  else if (ext === 'webp') pipeline = pipeline.webp({ quality: 90 });

  await pipeline.toFile(outputPath);
  await removeFiles([file]);
  return { filename: outputName };
}

module.exports = {
  compressImage,
  resizeImage,
  convertImage,
  extractTextFromImage,
  generateAiImage,
  processImage
};
