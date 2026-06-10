const PRODUCTION_BACKEND = 'https://aio-tools-backend-production.up.railway.app';
const LOCAL_BACKEND = 'http://127.0.0.1:5000';

function isLocalhost() {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1';
}

export function getApiBaseUrl() {
  if (typeof window !== 'undefined') {
    // Always call Express directly — Next.js /api proxy breaks large multipart uploads on Railway.
    return isLocalhost() ? LOCAL_BACKEND : PRODUCTION_BACKEND;
  }

  return process.env.NODE_ENV === 'production' ? PRODUCTION_BACKEND : LOCAL_BACKEND;
}

export function resolveApiUrl(path) {
  if (!path || path.startsWith('http')) return path;

  const base = getApiBaseUrl();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

export { PRODUCTION_BACKEND, LOCAL_BACKEND };
