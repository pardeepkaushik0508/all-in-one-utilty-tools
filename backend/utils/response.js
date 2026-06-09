function buildDownloadUrl(_req, filename) {
  return `/downloads/${filename}`;
}

function sendDownload(req, res, { filename, message }) {
  return res.json({
    message: message || 'Processed successfully.',
    downloadUrl: buildDownloadUrl(req, filename),
    filename
  });
}

module.exports = { buildDownloadUrl, sendDownload };
