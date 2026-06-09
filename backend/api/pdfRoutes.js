const express = require('express');
const upload = require('../utils/upload');
const { sendDownload } = require('../utils/response');
const { mergePdfFiles, splitPdfFile, compressPdfFile } = require('../services/pdfService');

const router = express.Router();

router.post('/merge', upload.array('files', 10), async (req, res, next) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ error: 'Please upload at least 2 PDF files.' });
    }

    const { filename } = await mergePdfFiles(req.files);
    return sendDownload(req, res, { filename, message: 'PDF merged successfully.' });
  } catch (error) {
    return next(error);
  }
});

router.post('/split', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF file.' });
    }

    const { filename, pages } = await splitPdfFile(req.file, req.body.range);
    return res.json({
      message: `Extracted pages: ${pages.join(', ')}`,
      downloadUrl: `/downloads/${filename}`,
      pages
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/compress', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF file.' });
    }

    const { filename, originalSize, compressedSize } = await compressPdfFile(req.file);
    return res.json({
      message: 'PDF compressed successfully.',
      downloadUrl: `/downloads/${filename}`,
      originalSize,
      compressedSize,
      savedBytes: Math.max(0, originalSize - compressedSize)
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
