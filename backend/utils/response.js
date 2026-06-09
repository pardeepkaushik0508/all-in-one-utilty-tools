const { publishProcessedFile } = require('./storage');

async function buildDownloadResponse(filename, message, extra = {}) {
  let published;

  try {
    published = await publishProcessedFile(filename);
  } catch (error) {
    console.error('[response] buildDownloadResponse failed for', filename, '—', error.message);
    throw error;
  }

  return {
    message: message || 'Processed successfully.',
    downloadUrl: published.downloadUrl,
    filename: published.filename,
    storage: published.storage,
    ...(published.cloudinaryError && { cloudinaryError: published.cloudinaryError }),
    ...extra
  };
}

async function sendDownload(req, res, { filename, message, ...extra }) {
  try {
    const payload = await buildDownloadResponse(filename, message, extra);
    return res.json(payload);
  } catch (error) {
    console.error('[response] sendDownload error for', filename, '—', error.message);
    return res.status(500).json({
      error: 'Failed to prepare the download.',
      detail: error.message
    });
  }
}

module.exports = { buildDownloadResponse, sendDownload };
