const { v2: cloudinary } = require('cloudinary');

let configured = false;

const PLACEHOLDER_PATTERNS = [
  'your_api_key',
  'your_api_secret',
  'your_cloud_name',
  'changeme',
  'xxx',
  'example'
];

function isPlaceholder(value) {
  if (!value || typeof value !== 'string') return true;

  const normalized = value.trim().toLowerCase();
  if (!normalized) return true;
  if (normalized.startsWith('<') || normalized.endsWith('>')) return true;

  return PLACEHOLDER_PATTERNS.some((pattern) => normalized.includes(pattern));
}

function configureCloudinary() {
  if (configured) return true;

  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

  if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
    if (
      isPlaceholder(CLOUDINARY_CLOUD_NAME) ||
      isPlaceholder(CLOUDINARY_API_KEY) ||
      isPlaceholder(CLOUDINARY_API_SECRET)
    ) {
      console.error(
        '[Cloudinary] Placeholder credentials detected. Replace CLOUDINARY_CLOUD_NAME, ' +
          'CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET with real values in Railway Variables.'
      );
      return false;
    }

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
    if (isPlaceholder(cloudinaryUrl)) {
      console.error(
        '[Cloudinary] CLOUDINARY_URL contains placeholder values — delete it from Railway Variables ' +
          'and set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET instead.'
      );
      return false;
    }

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
      const apiKey = decodeURIComponent(parsed.username || '');
      const apiSecret = decodeURIComponent(parsed.password || '');

      if (!cloudName || !apiKey || !apiSecret) {
        console.error(
          '[Cloudinary] CLOUDINARY_URL is malformed — could not extract cloud_name, ' +
            'api_key, or api_secret. Expected: cloudinary://<api_key>:<api_secret>@<cloud_name>'
        );
        return false;
      }

      if (isPlaceholder(apiKey) || isPlaceholder(apiSecret) || isPlaceholder(cloudName)) {
        console.error('[Cloudinary] CLOUDINARY_URL contains placeholder credentials.');
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
    '[Cloudinary] No credentials found. Set CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + ' +
      'CLOUDINARY_API_SECRET in Railway Variables (backend service).'
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

module.exports = { configureCloudinary, isCloudinaryEnabled, getCloudinary, isPlaceholder };
