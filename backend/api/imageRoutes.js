const express = require('express');
const upload = require('../utils/upload');
const { buildDownloadResponse, sendDownload } = require('../utils/response');
const {
  compressImage,
  resizeImage,
  convertImage,
  extractTextFromImage,
  generateAiImage,
  processImage
} = require('../services/imageService');

const router = express.Router();

async function processBatch(files, handler) {
  const results = [];
  for (const file of files) {
    try {
      const data = await handler(file);
      results.push({
        original: file.originalname,
        status: 'success',
        ...data
      });
    } catch (error) {
      results.push({
        original: file.originalname,
        status: 'failed',
        error: error.message || 'Processing failed.'
      });
    }
  }
  return results;
}

router.post('/compress', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image file.' });
    }

    const { filename } = await compressImage(req.file, {
      quality: req.body.quality,
      width: req.body.width
    });

    return sendDownload(req, res, { filename, message: 'Image compressed successfully.' });
  } catch (error) {
    return next(error);
  }
});

router.post('/compress/batch', upload.array('files', 50), async (req, res, next) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({ error: 'Please upload at least one image file.' });
    }

    const results = await processBatch(req.files, async (file) => {
      const { filename } = await compressImage(file, {
        quality: req.body.quality,
        width: req.body.width
      });
      return buildDownloadResponse(filename, 'Image compressed successfully.');
    });
    return res.json({ message: 'Batch image compression completed.', results });
  } catch (error) {
    return next(error);
  }
});

router.post('/resize', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image file.' });
    }

    const { filename } = await resizeImage(req.file, {
      width: req.body.width,
      height: req.body.height
    });

    return sendDownload(req, res, { filename, message: 'Image resized successfully.' });
  } catch (error) {
    return next(error);
  }
});

router.post('/resize/batch', upload.array('files', 50), async (req, res, next) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({ error: 'Please upload at least one image file.' });
    }

    const results = await processBatch(req.files, async (file) => {
      const { filename } = await resizeImage(file, {
        width: req.body.width,
        height: req.body.height
      });
      return buildDownloadResponse(filename, 'Image resized successfully.');
    });
    return res.json({ message: 'Batch image resize completed.', results });
  } catch (error) {
    return next(error);
  }
});

router.post('/convert', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image file.' });
    }

    const { filename } = await convertImage(req.file, req.body.format);
    return sendDownload(req, res, { filename, message: 'Image converted successfully.' });
  } catch (error) {
    return next(error);
  }
});

router.post('/convert/batch', upload.array('files', 50), async (req, res, next) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({ error: 'Please upload at least one image file.' });
    }

    const results = await processBatch(req.files, async (file) => {
      const { filename } = await convertImage(file, req.body.format);
      return buildDownloadResponse(filename, 'Image converted successfully.');
    });
    return res.json({ message: 'Batch image conversion completed.', results });
  } catch (error) {
    return next(error);
  }
});

router.post('/ocr', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image file.' });
    }
    const { text } = await extractTextFromImage(req.file);
    return res.json({ message: 'Text extracted successfully.', text });
  } catch (error) {
    return next(error);
  }
});

router.post('/ocr/batch', upload.array('files', 20), async (req, res, next) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({ error: 'Please upload at least one image file.' });
    }
    const results = await processBatch(req.files, async (file) => {
      const { text } = await extractTextFromImage(file);
      return { text };
    });
    return res.json({ message: 'Batch OCR completed.', results });
  } catch (error) {
    return next(error);
  }
});

router.post('/ai-generate', upload.single('referenceImage'), async (req, res, next) => {
  try {
    const prompt = String(req.body.prompt || '').trim();
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const aspectRatio = String(req.body.aspectRatio || '1:1');
    const result = await generateAiImage(prompt, {
      aspectRatio,
      referenceImage: req.file || null
    });

    return res.json({
      message: 'Image generated successfully.',
      ...result
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/process', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image file.' });
    }

    const { filename } = await processImage(req.file, req.body);
    return sendDownload(req, res, { filename, message: 'Image processed successfully.' });
  } catch (error) {
    return next(error);
  }
});

router.post('/process/batch', upload.array('files', 50), async (req, res, next) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({ error: 'Please upload at least one image file.' });
    }

    const results = await processBatch(req.files, async (file) => {
      const { filename } = await processImage(file, req.body);
      return buildDownloadResponse(filename, 'Image processed successfully.');
    });

    return res.json({ message: 'Batch image processing completed.', results });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
