const express = require('express');
const { mediaUpload } = require('../utils/upload');
const { sendDownload } = require('../utils/response');
const {
  videoToMp3,
  compressVideo,
  cutAudio,
  downloadVideoFromUrl
} = require('../services/mediaService');

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

// ── Single file routes ─────────────────────────────────────────────────────

router.post('/video-to-mp3', mediaUpload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Please upload a video file.' });
    const { filename } = await videoToMp3(req.file);
    return sendDownload(req, res, { filename, message: 'MP3 extracted successfully.' });
  } catch (error) {
    return next(error);
  }
});

router.post('/compress', mediaUpload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Please upload a video file.' });
    const { filename } = await compressVideo(req.file, { crf: req.body.crf });
    return sendDownload(req, res, { filename, message: 'Video compressed successfully.' });
  } catch (error) {
    return next(error);
  }
});

router.post('/audio-cut', mediaUpload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Please upload an audio file.' });
    const { filename } = await cutAudio(req.file, { start: req.body.start, duration: req.body.duration });
    return sendDownload(req, res, { filename, message: 'Audio trimmed successfully.' });
  } catch (error) {
    return next(error);
  }
});

// ── Batch routes ───────────────────────────────────────────────────────────

router.post('/video-to-mp3/batch', mediaUpload.array('files', 20), async (req, res, next) => {
  try {
    if (!req.files?.length) return res.status(400).json({ error: 'Please upload at least one video file.' });
    const results = await processBatch(req.files, async (file) => {
      const { filename } = await videoToMp3(file);
      return { downloadUrl: `/downloads/${filename}`, downloadFilename: filename, message: 'MP3 extracted.' };
    });
    return res.json({ message: 'Batch MP3 extraction completed.', results });
  } catch (error) {
    return next(error);
  }
});

router.post('/compress/batch', mediaUpload.array('files', 10), async (req, res, next) => {
  try {
    if (!req.files?.length) return res.status(400).json({ error: 'Please upload at least one video file.' });
    const results = await processBatch(req.files, async (file) => {
      const { filename } = await compressVideo(file, { crf: req.body.crf });
      return { downloadUrl: `/downloads/${filename}`, downloadFilename: filename, message: 'Video compressed.' };
    });
    return res.json({ message: 'Batch video compression completed.', results });
  } catch (error) {
    return next(error);
  }
});

router.post('/audio-cut/batch', mediaUpload.array('files', 20), async (req, res, next) => {
  try {
    if (!req.files?.length) return res.status(400).json({ error: 'Please upload at least one audio file.' });
    const results = await processBatch(req.files, async (file) => {
      const { filename } = await cutAudio(file, { start: req.body.start, duration: req.body.duration });
      return { downloadUrl: `/downloads/${filename}`, downloadFilename: filename, message: 'Audio trimmed.' };
    });
    return res.json({ message: 'Batch audio trim completed.', results });
  } catch (error) {
    return next(error);
  }
});

router.post('/download', async (req, res, next) => {
  try {
    const videoUrl = req.body.url;
    if (!videoUrl) return res.status(400).json({ error: 'Video URL is required.' });
    const { filename } = await downloadVideoFromUrl(videoUrl);
    return sendDownload(req, res, { filename, message: 'Video downloaded successfully.' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
