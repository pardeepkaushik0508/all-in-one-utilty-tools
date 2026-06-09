const express = require('express');
const {
  getThumbnail,
  generateHashtags,
  resolveInstagramMedia
} = require('../services/socialService');

const router = express.Router();

router.post('/instagram', async (req, res, next) => {
  try {
    const url = String(req.body.url || '').trim();
    if (!url) return res.status(400).json({ error: 'Instagram URL is required.' });

    const media = await resolveInstagramMedia(url);
    return res.json({ message: 'Instagram media resolved.', ...media });
  } catch (error) {
    return next(error);
  }
});

router.post('/thumbnail', async (req, res, next) => {
  try {
    const url = String(req.body.url || '').trim();
    if (!url) return res.status(400).json({ error: 'Video URL is required.' });

    const result = await getThumbnail(url, req.body.quality || 'hq');
    return res.json({ message: 'Thumbnail fetched successfully.', ...result });
  } catch (error) {
    return next(error);
  }
});

router.post('/hashtags', (req, res) => {
  const keywords = String(req.body.keywords || '').trim();
  if (!keywords) return res.status(400).json({ error: 'Keywords are required.' });

  const count = Math.min(30, Math.max(3, Number(req.body.count || 12)));
  const result = generateHashtags(keywords, count);
  return res.json({ message: 'Hashtags generated successfully.', ...result });
});

module.exports = router;
