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

const defaultUpload = createUploader(10 * 1024 * 1024);
const mediaUpload = createUploader(50 * 1024 * 1024);

module.exports = defaultUpload;
module.exports.mediaUpload = mediaUpload;
module.exports.uploadDir = uploadDir;
module.exports.processedDir = processedDir;
