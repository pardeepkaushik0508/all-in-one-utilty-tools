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
    console.log(`[Cloudinary] Configured via individual credentials (cloud: ${CLOUDINARY_CLOUD_NAME})`);
    return true;
  }

  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  if (cloudinaryUrl) {
    if (!cloudinaryUrl.startsWith('cloudinary://')) {
      console.error(
        '[Cloudinary] CLOUDINARY_URL is set but does not start with "cloudinary://" — ' +
        'expected format: cloudinary://<api_key>:<api_secret>@<cloud_name>'
      );
      return false;
    }

    try {
      const parsed = new URL(cloudinaryUrl);
      const cloudName = parsed.hostname;
      const apiKey = parsed.username;

      if (!cloudName || !apiKey || !parsed.password) {
        console.error(
          '[Cloudinary] CLOUDINARY_URL is malformed — could not extract cloud_name, ' +
          'api_key, or api_secret. Expected: cloudinary://<api_key>:<api_secret>@<cloud_name>'
        );
        return false;
      }

      cloudinary.config({ cloudinary_url: cloudinaryUrl });
      configured = true;
      console.log(`[Cloudinary] Configured via CLOUDINARY_URL (cloud: ${cloudName})`);
      return true;
    } catch (err) {
      console.error('[Cloudinary] Failed to parse CLOUDINARY_URL:', err.message);
      return false;
    }
  }

  console.warn(
    '[Cloudinary] No credentials found. Set CLOUDINARY_URL or ' +
    'CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET to enable cloud storage.'
  );
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
