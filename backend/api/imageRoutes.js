const express = require('express');
const upload = require('../utils/upload');
const { sendDownload } = require('../utils/response');
const {
  compressImage,
  resizeImage,
  convertImage,
  extractTextFromImage
} = require('../services/imageService');

const router = express.Router();

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

module.exports = router;
