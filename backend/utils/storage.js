const path = require('path');
const { processedDir } = require('./upload');
const { removeFile } = require('./fileCleanup');
const { getCloudinary, isCloudinaryEnabled } = require('./cloudinary');

const PROCESSED_FOLDER = 'utility-tools/processed';

function getResourceType(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (['.mp4', '.mov', '.avi', '.webm', '.mkv', '.mp3', '.wav', '.m4a', '.aac', '.ogg'].includes(ext)) {
    return 'video';
  }
  if (['.pdf', '.zip', '.doc', '.docx', '.txt', '.json'].includes(ext)) {
    return 'raw';
  }
  return 'image';
}

async function publishProcessedFile(filename) {
  const localFilename = path.basename(filename);
  const filePath = path.join(processedDir, localFilename);

  if (!isCloudinaryEnabled()) {
    return {
      downloadUrl: `/downloads/${localFilename}`,
      filename: localFilename,
      storage: 'local'
    };
  }

  const cloudinary = getCloudinary();

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: PROCESSED_FOLDER,
      resource_type: getResourceType(localFilename),
      use_filename: true,
      unique_filename: true,
      overwrite: false
    });

    await removeFile(filePath);

    return {
      downloadUrl: result.secure_url,
      filename: result.public_id,
      publicId: result.public_id,
      storage: 'cloudinary'
    };
  } catch (error) {
    console.error('Cloudinary upload failed:', error.message);
    return {
      downloadUrl: `/downloads/${localFilename}`,
      filename: localFilename,
      storage: 'local'
    };
  }
}

module.exports = { publishProcessedFile, getResourceType };
