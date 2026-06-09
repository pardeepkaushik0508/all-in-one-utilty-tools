const path = require('path');
const sharp = require('sharp');
const Tesseract = require('tesseract.js');
const { processedDir } = require('../utils/upload');
const { removeFiles } = require('../utils/fileCleanup');

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

module.exports = {
  compressImage,
  resizeImage,
  convertImage,
  extractTextFromImage
};
