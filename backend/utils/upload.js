const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads');
const processedDir = path.join(__dirname, '..', 'processed');

[uploadDir, processedDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeExt = path.extname(file.originalname).toLowerCase().slice(0, 12);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
    cb(null, uniqueName);
  }
});

function createUploader(maxFileSize) {
  return multer({
    storage,
    limits: { fileSize: maxFileSize }
  });
}

const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;

const defaultUpload = createUploader(MAX_UPLOAD_BYTES);
const mediaUpload = createUploader(MAX_UPLOAD_BYTES);

module.exports = defaultUpload;
module.exports.mediaUpload = mediaUpload;
module.exports.uploadDir = uploadDir;
module.exports.processedDir = processedDir;
module.exports.MAX_UPLOAD_BYTES = MAX_UPLOAD_BYTES;
