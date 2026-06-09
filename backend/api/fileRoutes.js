const express = require('express');
const path = require('path');
const axios = require('axios');
const { processedDir } = require('../utils/upload');
const { getCloudinary, isCloudinaryEnabled } = require('../utils/cloudinary');

const router = express.Router();

function sanitizeFilename(name) {
  const base = path.basename(String(name || 'download'));
  return base.replace(/[^\w.\-() ]+/g, '_') || 'download';
}

router.get('/download', async (req, res, next) => {
  try {
    const filename = sanitizeFilename(req.query.filename);
    const publicId = req.query.publicId ? String(req.query.publicId) : '';
    const resourceType = req.query.resourceType ? String(req.query.resourceType) : 'raw';
    const format =
      (req.query.format ? String(req.query.format) : '') ||
      path.extname(filename).slice(1) ||
      'bin';

    if (publicId) {
      if (!isCloudinaryEnabled()) {
        return res.status(503).json({ error: 'Cloudinary is not configured.' });
      }

      const cloudinary = getCloudinary();
      const downloadApiUrl = cloudinary.utils.private_download_url(publicId, format, {
        resource_type: resourceType,
        type: 'upload'
      });

      try {
        const remote = await axios.get(downloadApiUrl, {
          responseType: 'stream',
          timeout: 120000,
          maxRedirects: 5
        });

        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', remote.headers['content-type'] || 'application/octet-stream');

        remote.data.on('error', next);
        return remote.data.pipe(res);
      } catch (privateError) {
        const resource = await cloudinary.api.resource(publicId, {
          resource_type: resourceType,
          type: 'upload'
        });
        const secureUrl = resource.secure_url;
        if (!secureUrl) throw privateError;

        const remote = await axios.get(secureUrl, {
          responseType: 'stream',
          timeout: 120000,
          maxRedirects: 5
        });

        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', remote.headers['content-type'] || 'application/octet-stream');

        remote.data.on('error', next);
        return remote.data.pipe(res);
      }
    }

    const localPath = path.join(processedDir, filename);
    return res.download(localPath, filename, (error) => {
      if (error) next(error);
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
