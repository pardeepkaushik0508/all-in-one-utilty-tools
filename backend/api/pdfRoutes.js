const express = require('express');
const upload = require('../utils/upload');
const { buildDownloadResponse, sendDownload } = require('../utils/response');
const {
  mergePdfFiles,
  splitPdfFile,
  compressPdfFile,
  createPdfFromText,
  createPdfFromImages,
  createPdfFromMixed,
  deletePdfPages,
  reorderRotatePdf,
  editPdfFile,
  scanImagesToPdf
} = require('../services/pdfService');

const router = express.Router();

router.post('/merge', upload.array('files', 20), async (req, res, next) => {
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
    return res.json(
      await buildDownloadResponse(filename, `Extracted pages: ${pages.join(', ')}`, { pages })
    );
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
    return res.json(
      await buildDownloadResponse(filename, 'PDF compressed successfully.', {
        originalSize,
        compressedSize,
        savedBytes: Math.max(0, originalSize - compressedSize)
      })
    );
  } catch (error) {
    return next(error);
  }
});

router.post('/create/text', async (req, res, next) => {
  try {
    const text = String(req.body.text || '').trim();
    if (!text) return res.status(400).json({ error: 'Text content is required.' });

    const { filename } = await createPdfFromText({
      text,
      pageSize: req.body.pageSize,
      orientation: req.body.orientation,
      fontSize: req.body.fontSize
    });

    return res.json(await buildDownloadResponse(filename, 'PDF created from text.'));
  } catch (error) {
    return next(error);
  }
});

router.post('/create/images', upload.array('files', 50), async (req, res, next) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({ error: 'Please upload at least one image.' });
    }

    const { filename } = await createPdfFromImages(req.files, req.body);
    return res.json(
      await buildDownloadResponse(filename, `PDF created with ${req.files.length} page(s).`, {
        pageCount: req.files.length
      })
    );
  } catch (error) {
    return next(error);
  }
});

router.post('/create/mixed', upload.array('files', 30), async (req, res, next) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({ error: 'Please upload at least one file.' });
    }

    const { filename } = await createPdfFromMixed(req.files, req.body);
    return res.json(
      await buildDownloadResponse(filename, 'PDF created from uploaded files.', {
        fileCount: req.files.length
      })
    );
  } catch (error) {
    return next(error);
  }
});

router.post('/delete-pages', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Please upload a PDF file.' });
    if (!String(req.body.range || '').trim()) {
      return res.status(400).json({ error: 'Page range to delete is required (e.g. 2,4-6).' });
    }

    const { filename, removedPages, keptPages } = await deletePdfPages(req.file, req.body.range);
    return res.json(
      await buildDownloadResponse(filename, `Removed pages: ${removedPages.join(', ')}`, {
        removedPages,
        keptPages
      })
    );
  } catch (error) {
    return next(error);
  }
});

router.post('/reorder', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Please upload a PDF file.' });

    const { filename, pageCount } = await reorderRotatePdf(req.file, {
      order: req.body.order,
      rotations: req.body.rotations
    });

    return res.json(
      await buildDownloadResponse(filename, 'PDF pages reordered and rotated.', { pageCount })
    );
  } catch (error) {
    return next(error);
  }
});

router.post('/edit', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'overlays', maxCount: 20 }]), async (req, res, next) => {
  try {
    if (!req.files?.file?.[0]) {
      return res.status(400).json({ error: 'Please upload a PDF file to edit.' });
    }

    const { filename, annotationCount } = await editPdfFile(
      req.files.file[0],
      req.body.annotations,
      req.files.overlays || []
    );

    return res.json(
      await buildDownloadResponse(filename, `PDF edited successfully (${annotationCount} change(s)).`, {
        annotationCount
      })
    );
  } catch (error) {
    return next(error);
  }
});

router.post('/scan', upload.array('files', 50), async (req, res, next) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({ error: 'Please capture or upload at least one scan.' });
    }

    const { filename } = await scanImagesToPdf(req.files, req.body);
    return res.json(
      await buildDownloadResponse(filename, `Scanned PDF created with ${req.files.length} page(s).`, {
        pageCount: req.files.length
      })
    );
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
