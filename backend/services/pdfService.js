const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');
const { PDFDocument, rgb, degrees, StandardFonts } = require('pdf-lib');
const { processedDir } = require('../utils/upload');
const { removeFiles } = require('../utils/fileCleanup');

const PAGE_SIZES = {
  A4: { width: 595.28, height: 841.89 },
  LETTER: { width: 612, height: 792 },
  LEGAL: { width: 612, height: 1008 }
};

function parsePageRanges(rangeText, totalPages) {
  const pages = new Set();
  const parts = String(rangeText || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (!parts.length) {
    for (let i = 1; i <= totalPages; i += 1) pages.add(i);
    return [...pages].sort((a, b) => a - b);
  }

  parts.forEach((part) => {
    if (part.includes('-')) {
      const [startRaw, endRaw] = part.split('-');
      const start = Math.max(1, Number(startRaw));
      const end = Math.min(totalPages, Number(endRaw || startRaw));
      for (let i = start; i <= end; i += 1) pages.add(i);
      return;
    }

    const page = Number(part);
    if (!Number.isNaN(page) && page >= 1 && page <= totalPages) {
      pages.add(page);
    }
  });

  return [...pages].sort((a, b) => a - b);
}

function getPageDimensions(pageSizeName, orientation) {
  const size = PAGE_SIZES[String(pageSizeName || 'A4').toUpperCase()] || PAGE_SIZES.A4;
  const landscape = String(orientation || 'portrait').toLowerCase() === 'landscape';
  return landscape
    ? { width: size.height, height: size.width }
    : { width: size.width, height: size.height };
}

function getPdfFont(pdf, fontFamily) {
  const key = String(fontFamily || 'Helvetica').toLowerCase();
  if (key.includes('times')) return StandardFonts.TimesRoman;
  if (key.includes('courier')) return StandardFonts.Courier;
  return StandardFonts.Helvetica;
}

function parseHexColor(hex, fallback = { r: 0, g: 0, b: 0 }) {
  const value = String(hex || '').replace('#', '');
  if (value.length !== 6) return fallback;
  return {
    r: parseInt(value.slice(0, 2), 16) / 255,
    g: parseInt(value.slice(2, 4), 16) / 255,
    b: parseInt(value.slice(4, 6), 16) / 255
  };
}

function fitImageInPage(imageWidth, imageHeight, pageWidth, pageHeight) {
  const scale = Math.min(pageWidth / imageWidth, pageHeight / imageHeight);
  const width = imageWidth * scale;
  const height = imageHeight * scale;
  return {
    width,
    height,
    x: (pageWidth - width) / 2,
    y: (pageHeight - height) / 2
  };
}

async function writeOutputPdf(pdfDoc, baseName) {
  const bytes = await pdfDoc.save({ useObjectStreams: true });
  const outputName = `${baseName}.pdf`;
  await fs.writeFile(path.join(processedDir, outputName), bytes);
  return { filename: outputName };
}

async function embedImageFromFile(pdf, filePath, options = {}) {
  const bytes = await fs.readFile(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const quality = getCompressionQuality(options.compression);

  if (ext === '.png' || ext === '.webp') {
    const pngBytes =
      ext === '.webp'
        ? await sharp(bytes).png({ compressionLevel: 9 }).toBuffer()
        : await sharp(bytes).png({ compressionLevel: 9 }).toBuffer();
    return pdf.embedPng(pngBytes);
  }

  const jpgBytes = await sharp(bytes).jpeg({ quality, mozjpeg: true }).toBuffer();
  return pdf.embedJpg(jpgBytes);
}

function getCompressionQuality(compression) {
  const key = String(compression || 'medium').toLowerCase();
  if (key === 'high') return 92;
  if (key === 'low') return 65;
  return 80;
}

async function preprocessScanImage(filePath, options = {}) {
  let pipeline = sharp(filePath).rotate();

  if (options.grayscale === '1' || options.grayscale === true) pipeline = pipeline.grayscale();
  if (options.brightness) pipeline = pipeline.modulate({ brightness: Number(options.brightness) });
  if (options.contrast) {
    const contrast = Number(options.contrast);
    pipeline = pipeline.linear(contrast, -(128 * contrast) + 128);
  }
  if (options.sharpen === '1' || options.sharpen === true) pipeline = pipeline.sharpen();

  const quality = getCompressionQuality(options.compression);
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') return pipeline.png({ compressionLevel: 9 }).toBuffer();
  return pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();
}

async function addImagePage(pdf, file, options = {}) {
  const { pageSize, orientation, rotation = 0 } = options;
  const { width: pageWidth, height: pageHeight } = getPageDimensions(pageSize, orientation);

  let imageBytes;
  if (options.scanMode) {
    imageBytes = await preprocessScanImage(file.path, options);
    const embedded = file.path.toLowerCase().endsWith('.png')
      ? await pdf.embedPng(imageBytes)
      : await pdf.embedJpg(imageBytes);
    const page = pdf.addPage([pageWidth, pageHeight]);
    const fit = fitImageInPage(embedded.width, embedded.height, pageWidth, pageHeight);
    page.drawImage(embedded, fit);
    if (rotation) page.setRotation(degrees(Number(rotation)));
    return;
  }

  const embedded = await embedImageFromFile(pdf, file.path, { compression: options.compression });
  const page = pdf.addPage([pageWidth, pageHeight]);
  const fit = fitImageInPage(embedded.width, embedded.height, pageWidth, pageHeight);
  page.drawImage(embedded, fit);
  if (rotation) page.setRotation(degrees(Number(rotation)));
}

async function mergePdfFiles(files) {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const bytes = await fs.readFile(file.path);
    const pdf = await PDFDocument.load(bytes);
    const copied = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copied.forEach((page) => mergedPdf.addPage(page));
  }

  // Use first file's name as the output name
  const baseName = path.parse(files[0].originalname || 'merged').name;
  const { filename } = await writeOutputPdf(mergedPdf, baseName);
  await removeFiles(files);
  return { filename };
}

async function splitPdfFile(file, rangeText) {
  const bytes = await fs.readFile(file.path);
  const source = await PDFDocument.load(bytes);
  const totalPages = source.getPageCount();
  const pageNumbers = parsePageRanges(rangeText, totalPages);

  if (!pageNumbers.length) {
    throw new Error('No valid pages selected for split.');
  }

  const outputPdf = await PDFDocument.create();
  const zeroBased = pageNumbers.map((page) => page - 1);
  const copied = await outputPdf.copyPages(source, zeroBased);
  copied.forEach((page) => outputPdf.addPage(page));

  const baseName = path.parse(file.originalname || 'document').name;
  const { filename } = await writeOutputPdf(outputPdf, baseName);
  await removeFiles([file]);
  return { filename, pages: pageNumbers };
}

async function compressPdfFile(file) {
  const bytes = await fs.readFile(file.path);
  const pdf = await PDFDocument.load(bytes);
  const compressedBytes = await pdf.save({ useObjectStreams: true });
  const baseName = path.parse(file.originalname || 'document').name;
  const outputName = `${baseName}.pdf`;
  await fs.writeFile(path.join(processedDir, outputName), compressedBytes);
  await removeFiles([file]);

  return {
    filename: outputName,
    originalSize: bytes.length,
    compressedSize: compressedBytes.length
  };
}

async function createPdfFromText({ text, pageSize, orientation, fontSize }) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const { width, height } = getPageDimensions(pageSize, orientation);
  const size = Math.min(24, Math.max(8, Number(fontSize) || 12));
  const margin = 48;
  const maxWidth = width - margin * 2;
  const lineHeight = size + 6;
  const lines = String(text || '').split('\n');

  let page = pdf.addPage([width, height]);
  let y = height - margin;

  const ensureSpace = () => {
    if (y < margin) {
      page = pdf.addPage([width, height]);
      y = height - margin;
    }
  };

  lines.forEach((line) => {
    if (!line.trim()) {
      y -= lineHeight;
      ensureSpace();
      return;
    }

    const words = line.split(' ');
    let current = '';

    words.forEach((word) => {
      const test = current ? `${current} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(test, size);
      if (testWidth > maxWidth && current) {
        ensureSpace();
        page.drawText(current, { x: margin, y, size, font, color: rgb(0, 0, 0) });
        y -= lineHeight;
        ensureSpace();
        current = word;
      } else {
        current = test;
      }
    });

    if (current) {
      ensureSpace();
      page.drawText(current, { x: margin, y, size, font, color: rgb(0, 0, 0) });
      y -= lineHeight;
    }
  });

  return writeOutputPdf(pdf, 'document');
}

async function createPdfFromImages(files, options = {}) {
  if (!files?.length) throw new Error('Please upload at least one image.');

  const pdf = await PDFDocument.create();
  const order = String(options.order || '')
    .split(',')
    .map((n) => Number(n.trim()))
    .filter((n) => !Number.isNaN(n));

  const rotations = String(options.rotations || '')
    .split(',')
    .map((n) => Number(n.trim()));

  const orderedFiles = order.length
    ? order.map((index) => files[index]).filter(Boolean)
    : files;

  for (let i = 0; i < orderedFiles.length; i += 1) {
    await addImagePage(pdf, orderedFiles[i], {
      pageSize: options.pageSize,
      orientation: options.orientation,
      rotation: rotations[i] || 0,
      scanMode: options.scanMode === '1' || options.scanMode === true,
      compression: options.compression,
      grayscale: options.grayscale,
      brightness: options.brightness,
      contrast: options.contrast,
      sharpen: options.sharpen
    });
  }

  const result = await writeOutputPdf(pdf, options.scanMode ? 'scan' : 'document');
  await removeFiles(files);
  return result;
}

async function createPdfFromMixed(files, options = {}) {
  if (!files?.length) throw new Error('Please upload at least one file.');

  const pdf = await PDFDocument.create();
  const { pageSize, orientation } = options;

  const order = String(options.order || '')
    .split(',')
    .map((n) => Number(n.trim()))
    .filter((n) => !Number.isNaN(n));

  const rotations = String(options.rotations || '')
    .split(',')
    .map((n) => Number(n.trim()));

  const orderedFiles = order.length ? order.map((index) => files[index]).filter(Boolean) : files;

  for (let i = 0; i < orderedFiles.length; i += 1) {
    const file = orderedFiles[i];
    const ext = path.extname(file.originalname || file.path).toLowerCase();
    if (ext === '.pdf') {
      const bytes = await fs.readFile(file.path);
      const source = await PDFDocument.load(bytes);
      const copied = await pdf.copyPages(source, source.getPageIndices());
      copied.forEach((page) => {
        const rotation = rotations[i] || 0;
        if (rotation) page.setRotation(degrees(rotation));
        pdf.addPage(page);
      });
    } else {
      await addImagePage(pdf, file, {
        pageSize,
        orientation,
        rotation: rotations[i] || 0,
        compression: options.compression
      });
    }
  }

  const result = await writeOutputPdf(pdf, 'document');
  await removeFiles(files);
  return result;
}

async function deletePdfPages(file, rangeText) {
  const bytes = await fs.readFile(file.path);
  const source = await PDFDocument.load(bytes);
  const totalPages = source.getPageCount();
  const pagesToDelete = new Set(parsePageRanges(rangeText, totalPages));
  const pagesToKeep = [];

  for (let i = 1; i <= totalPages; i += 1) {
    if (!pagesToDelete.has(i)) pagesToKeep.push(i);
  }

  if (!pagesToKeep.length) {
    throw new Error('Cannot delete all pages. At least one page must remain.');
  }

  const outputPdf = await PDFDocument.create();
  const copied = await outputPdf.copyPages(
    source,
    pagesToKeep.map((page) => page - 1)
  );
  copied.forEach((page) => outputPdf.addPage(page));

  const baseName = path.parse(file.originalname || 'document').name;
  const { filename } = await writeOutputPdf(outputPdf, baseName);
  await removeFiles([file]);
  return { filename, removedPages: [...pagesToDelete].sort((a, b) => a - b), keptPages: pagesToKeep };
}

async function reorderRotatePdf(file, { order, rotations }) {
  const bytes = await fs.readFile(file.path);
  const source = await PDFDocument.load(bytes);
  const totalPages = source.getPageCount();

  const orderList = String(order || '')
    .split(',')
    .map((n) => Number(n.trim()) - 1)
    .filter((n) => !Number.isNaN(n) && n >= 0 && n < totalPages);

  const rotationList = String(rotations || '')
    .split(',')
    .map((n) => Number(n.trim()));

  const indices = orderList.length ? orderList : source.getPageIndices();
  const outputPdf = await PDFDocument.create();
  const copied = await outputPdf.copyPages(source, indices);

  copied.forEach((page, index) => {
    const rotation = rotationList[index] || 0;
    if (rotation) page.setRotation(degrees(rotation));
    outputPdf.addPage(page);
  });

  const baseName = path.parse(file.originalname || 'document').name;
  const { filename } = await writeOutputPdf(outputPdf, baseName);
  await removeFiles([file]);
  return { filename, pageCount: indices.length };
}

async function editPdfFile(file, annotationsJson, overlayFiles = []) {
  const bytes = await fs.readFile(file.path);
  const pdf = await PDFDocument.load(bytes);
  const fontCache = {};
  let annotations = [];

  try {
    annotations = JSON.parse(annotationsJson || '[]');
  } catch {
    throw new Error('Invalid annotation data.');
  }

  const getFont = async (fontFamily) => {
    const key = getPdfFont(pdf, fontFamily);
    if (!fontCache[key]) {
      fontCache[key] = await pdf.embedFont(key);
    }
    return fontCache[key];
  };

  for (const item of annotations) {
    const pageIndex = Number(item.page || 1) - 1;
    const pages = pdf.getPages();
    if (pageIndex < 0 || pageIndex >= pages.length) continue;
    const page = pages[pageIndex];
    const { height } = page.getSize();

    if (item.type === 'whiteout') {
      page.drawRectangle({
        x: Number(item.x) || 0,
        y: height - (Number(item.y) || 0) - (Number(item.height) || 20),
        width: Number(item.width) || 100,
        height: Number(item.height) || 20,
        color: rgb(1, 1, 1),
        borderWidth: 0
      });
    }

    if (item.type === 'text' || item.type === 'replace-text') {
      const color = parseHexColor(item.color);
      const font = await getFont(item.fontFamily);
      page.drawText(String(item.text || ''), {
        x: Number(item.x) || 0,
        y: height - (Number(item.y) || 0) - (Number(item.fontSize) || 14),
        size: Number(item.fontSize) || 14,
        font,
        color: rgb(color.r, color.g, color.b)
      });
    }

    if (item.type === 'highlight') {
      const color = parseHexColor(item.color || '#FFFF00');
      page.drawRectangle({
        x: Number(item.x) || 0,
        y: height - (Number(item.y) || 0) - (Number(item.height) || 20),
        width: Number(item.width) || 100,
        height: Number(item.height) || 20,
        color: rgb(color.r, color.g, color.b),
        opacity: 0.35
      });
    }

    if (item.type === 'rect') {
      const color = parseHexColor(item.color || '#3B82F6');
      page.drawRectangle({
        x: Number(item.x) || 0,
        y: height - (Number(item.y) || 0) - (Number(item.height) || 40),
        width: Number(item.width) || 100,
        height: Number(item.height) || 40,
        borderColor: rgb(color.r, color.g, color.b),
        borderWidth: 2
      });
    }

    if (item.type === 'ellipse') {
      const color = parseHexColor(item.color || '#3B82F6');
      const x = Number(item.x) || 0;
      const y = Number(item.y) || 0;
      const width = Number(item.width) || 80;
      const heightBox = Number(item.height) || 80;
      page.drawEllipse({
        x: x + width / 2,
        y: height - y - heightBox / 2,
        xScale: width / 2,
        yScale: heightBox / 2,
        borderColor: rgb(color.r, color.g, color.b),
        borderWidth: 2
      });
    }

    if (item.type === 'line') {
      const color = parseHexColor(item.color || '#3B82F6');
      page.drawLine({
        start: { x: Number(item.x) || 0, y: height - (Number(item.y) || 0) },
        end: { x: Number(item.x2) || 0, y: height - (Number(item.y2) || 0) },
        thickness: 2,
        color: rgb(color.r, color.g, color.b)
      });
    }

    if (item.type === 'image' && overlayFiles[item.fileIndex]) {
      const embedded = await embedImageFromFile(pdf, overlayFiles[item.fileIndex].path);
      const drawHeight = Number(item.height) || 80;
      const scale = drawHeight / embedded.height;
      const drawWidth = embedded.width * scale;
      page.drawImage(embedded, {
        x: Number(item.x) || 0,
        y: height - (Number(item.y) || 0) - drawHeight,
        width: drawWidth,
        height: drawHeight
      });
    }

    if ((item.type === 'drawing' || item.type === 'signature') && item.dataUrl) {
      const base64 = String(item.dataUrl).split(',')[1];
      if (base64) {
        const pngBytes = Buffer.from(base64, 'base64');
        const embedded = await pdf.embedPng(pngBytes);
        const drawWidth = Number(item.width) || embedded.width;
        const drawHeight = Number(item.height) || embedded.height;
        page.drawImage(embedded, {
          x: Number(item.x) || 0,
          y: height - (Number(item.y) || 0) - drawHeight,
          width: drawWidth,
          height: drawHeight
        });
      }
    }
  }

  const baseName = path.parse(file.originalname || 'document').name;
  const { filename } = await writeOutputPdf(pdf, baseName);
  await removeFiles([file, ...overlayFiles]);
  return { filename, annotationCount: annotations.length };
}

async function scanImagesToPdf(files, options = {}) {
  return createPdfFromImages(files, { ...options, scanMode: true });
}

module.exports = {
  mergePdfFiles,
  splitPdfFile,
  compressPdfFile,
  createPdfFromText,
  createPdfFromImages,
  createPdfFromMixed,
  deletePdfPages,
  reorderRotatePdf,
  editPdfFile,
  scanImagesToPdf,
  parsePageRanges
};
