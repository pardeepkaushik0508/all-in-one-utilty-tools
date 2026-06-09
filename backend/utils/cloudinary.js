const { v2: cloudinary } = require('cloudinary');

let configured = false;

function configureCloudinary() {
  if (configured) return true;

  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET
    });
    configured = true;
    return true;
  }

  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });
    configured = true;
    return true;
  }

  return false;
}

function isCloudinaryEnabled() {
  return configureCloudinary();
}

function getCloudinary() {
  if (!isCloudinaryEnabled()) return null;
  return cloudinary;
}

module.exports = { configureCloudinary, isCloudinaryEnabled, getCloudinary };
