const fs = require('fs/promises');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const { processedDir } = require('../utils/upload');
const { removeFiles } = require('../utils/fileCleanup');

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

async function mergePdfFiles(files) {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const bytes = await fs.readFile(file.path);
    const pdf = await PDFDocument.load(bytes);
    const copied = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copied.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedBytes = await mergedPdf.save({ useObjectStreams: true });
  const outputName = `merged-${Date.now()}.pdf`;
  await fs.writeFile(path.join(processedDir, outputName), mergedBytes);
  await removeFiles(files);

  return { filename: outputName };
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

  const outputBytes = await outputPdf.save({ useObjectStreams: true });
  const outputName = `split-${Date.now()}.pdf`;
  await fs.writeFile(path.join(processedDir, outputName), outputBytes);
  await removeFiles([file]);

  return { filename: outputName, pages: pageNumbers };
}

async function compressPdfFile(file) {
  const bytes = await fs.readFile(file.path);
  const pdf = await PDFDocument.load(bytes);
  const compressedBytes = await pdf.save({ useObjectStreams: true });
  const outputName = `compressed-${Date.now()}.pdf`;
  await fs.writeFile(path.join(processedDir, outputName), compressedBytes);
  await removeFiles([file]);

  return {
    filename: outputName,
    originalSize: bytes.length,
    compressedSize: compressedBytes.length
  };
}

module.exports = { mergePdfFiles, splitPdfFile, compressPdfFile };
