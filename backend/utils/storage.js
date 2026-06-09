const fs = require('fs/promises');
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

  // Verify the processed file actually exists before attempting anything.
  try {
    await fs.access(filePath);
  } catch {
    const msg = `Processed file not found on disk: ${localFilename}`;
    console.error(`[storage] ${msg} (expected path: ${filePath})`);
    throw new Error(msg);
  }

  if (!isCloudinaryEnabled()) {
    console.log(`[storage] Cloudinary not configured — serving "${localFilename}" from local storage`);
    return {
      downloadUrl: `/downloads/${localFilename}`,
      filename: localFilename,
      storage: 'local'
    };
  }

  const cloudinary = getCloudinary();
  const resourceType = getResourceType(localFilename);
  console.log(`[storage] Uploading "${localFilename}" to Cloudinary (resource_type: ${resourceType})`);

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: PROCESSED_FOLDER,
      resource_type: resourceType,
      use_filename: true,
      unique_filename: true,
      overwrite: false
    });

    console.log(`[storage] Cloudinary upload succeeded: ${result.secure_url}`);
    await removeFile(filePath);

    return {
      downloadUrl: result.secure_url,
      filename: result.public_id,
      publicId: result.public_id,
      storage: 'cloudinary'
    };
  } catch (error) {
    // Log the full error so it appears in Railway's log stream.
    console.error(
      `[storage] Cloudinary upload failed for "${localFilename}":`,
      error.message,
      error.http_code ? `(HTTP ${error.http_code})` : '',
      error.error ? JSON.stringify(error.error) : ''
    );

    // Fall back to local delivery so the user still gets their file.
    console.warn(`[storage] Falling back to local delivery for "${localFilename}"`);
    return {
      downloadUrl: `/downloads/${localFilename}`,
      filename: localFilename,
      storage: 'local',
      cloudinaryError: error.message
    };
  }
}

module.exports = { publishProcessedFile, getResourceType };
