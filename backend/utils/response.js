const { publishProcessedFile } = require('./storage');

async function buildDownloadResponse(filename, message, extra = {}) {
  const published = await publishProcessedFile(filename);

  return {
    message: message || 'Processed successfully.',
    downloadUrl: published.downloadUrl,
    filename: published.filename,
    storage: published.storage,
    ...extra
  };
}

async function sendDownload(req, res, { filename, message, ...extra }) {
  const payload = await buildDownloadResponse(filename, message, extra);
  return res.json(payload);
}

module.exports = { buildDownloadResponse, sendDownload };
