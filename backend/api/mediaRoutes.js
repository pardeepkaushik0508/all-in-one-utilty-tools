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

router.post('/video-to-mp3', mediaUpload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a video file.' });
    }

    const { filename } = await videoToMp3(req.file);
    return sendDownload(req, res, { filename, message: 'MP3 extracted successfully.' });
  } catch (error) {
    return next(error);
  }
});

router.post('/compress', mediaUpload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a video file.' });
    }

    const { filename } = await compressVideo(req.file, { crf: req.body.crf });
    return sendDownload(req, res, { filename, message: 'Video compressed successfully.' });
  } catch (error) {
    return next(error);
  }
});

router.post('/audio-cut', mediaUpload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an audio file.' });
    }

    const { filename } = await cutAudio(req.file, {
      start: req.body.start,
      duration: req.body.duration
    });

    return sendDownload(req, res, { filename, message: 'Audio trimmed successfully.' });
  } catch (error) {
    return next(error);
  }
});

router.post('/download', async (req, res, next) => {
  try {
    const videoUrl = req.body.url;
    if (!videoUrl) {
      return res.status(400).json({ error: 'Video URL is required.' });
    }

    const { filename } = await downloadVideoFromUrl(videoUrl);
    return sendDownload(req, res, { filename, message: 'Video downloaded successfully.' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
