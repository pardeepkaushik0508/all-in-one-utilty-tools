const fs = require('fs/promises');
const path = require('path');
const { processedDir } = require('./upload');
const { removeFile } = require('./fileCleanup');
const { getCloudinary, isCloudinaryEnabled } = require('./cloudinary');

const PROCESSED_FOLDER = 'utility-tools/processed';

function isProduction() {
  return process.env.NODE_ENV === 'production' || Boolean(process.env.RAILWAY_ENVIRONMENT_NAME);
}

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

  try {
    await fs.access(filePath);
  } catch {
    const msg = `Processed file not found on disk: ${localFilename}`;
    console.error(`[storage] ${msg} (expected path: ${filePath})`);
    throw new Error(msg);
  }

  if (!isCloudinaryEnabled()) {
    if (isProduction()) {
      throw new Error(
        'Cloudinary is not configured on the server. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your backend environment (Railway variables).'
      );
    }

    console.log(`[storage] Cloudinary not configured — serving "${localFilename}" from local /downloads/`);
    return {
      downloadUrl: `/downloads/${localFilename}`,
      downloadFilename: localFilename,
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

    // Use secure_url as-is (e.g. .../image/upload/v1234567/folder/file.jpg).
    // Do not add fl_attachment — it causes HTTP 400. Frontend handles direct download via blob fetch.
    const downloadUrl = result.secure_url;

    console.log(`[storage] Cloudinary upload succeeded: ${downloadUrl}`);
    await removeFile(filePath);

    return {
      cloudinaryUrl: downloadUrl,
      downloadFilename: localFilename,
      filename: result.public_id,
      publicId: result.public_id,
      resourceType: result.resource_type,
      format: result.format,
      storage: 'cloudinary'
    };
  } catch (error) {
    console.error(
      `[storage] Cloudinary upload failed for "${localFilename}":`,
      error.message,
      error.http_code ? `(HTTP ${error.http_code})` : '',
      error.error ? JSON.stringify(error.error) : ''
    );

    throw new Error(`Failed to upload result to Cloudinary: ${error.message}`);
  }
}

module.exports = { publishProcessedFile, getResourceType };
