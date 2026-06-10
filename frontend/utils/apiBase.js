const PRODUCTION_BACKEND = 'https://aio-tools-backend-production.up.railway.app';
const LOCAL_BACKEND = 'http://127.0.0.1:5000';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

function normalizeBaseUrl(url) {
  return url ? String(url).replace(/\/$/, '') : '';
}

function resolveProductionBackend() {
  const fromEnv = normalizeBaseUrl(process.env.NEXT_PUBLIC_BACKEND_URL);
  const siteUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL);

  // Never use the frontend URL as the API base — that forces requests through the Next.js proxy.
  if (fromEnv && fromEnv !== siteUrl) return fromEnv;

  return PRODUCTION_BACKEND;
}

export function getApiBaseUrl() {
  if (IS_PRODUCTION) {
    return resolveProductionBackend();
  }

  const fromEnv = normalizeBaseUrl(process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL);
  if (fromEnv) return fromEnv;

  return LOCAL_BACKEND;
}

export function resolveApiUrl(path) {
  if (!path || path.startsWith('http')) return path;

  let base = getApiBaseUrl();
  const normalized = path.startsWith('/') ? path : `/${path}`;

  // Safety net: never same-origin API calls in the browser (Next.js proxy breaks file uploads).
  if (typeof window !== 'undefined' && base === window.location.origin) {
    base = IS_PRODUCTION ? PRODUCTION_BACKEND : LOCAL_BACKEND;
  }

  return `${base}${normalized}`;
}
