const { publishProcessedFile } = require('./storage');

function buildProxyDownloadUrl(published) {
  const filename = published.downloadFilename;

  if (published.storage === 'cloudinary' && published.publicId) {
    const params = new URLSearchParams({
      publicId: published.publicId,
      resourceType: published.resourceType || 'raw',
      filename
    });
    if (published.format) params.set('format', published.format);
    return `/api/files/download?${params.toString()}`;
  }

  return `/api/files/download?${new URLSearchParams({ filename }).toString()}`;
}

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
    downloadUrl: buildProxyDownloadUrl(published),
    downloadFilename: published.downloadFilename || filename,
    filename: published.filename,
    storage: published.storage,
    ...(published.cloudinaryUrl && { cloudinaryUrl: published.cloudinaryUrl }),
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
