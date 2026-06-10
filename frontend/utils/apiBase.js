const PRODUCTION_BACKEND = 'https://aio-tools-backend-production.up.railway.app';
const PRODUCTION_FRONTEND = 'https://aio-tools-frontend-production.up.railway.app';
const LOCAL_BACKEND = 'http://127.0.0.1:5000';

function isLocalhost() {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1';
}

function isFrontendHost() {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host.includes('frontend') || host === PRODUCTION_FRONTEND.replace('https://', '');
}

export function getApiBaseUrl() {
  if (typeof window !== 'undefined') {
    if (isLocalhost()) return LOCAL_BACKEND;
    // Frontend domain → same-origin /api/* (Next.js streaming proxy handles uploads)
    if (isFrontendHost()) return '';
    // Any other hosted domain (e.g. custom domain) → same-origin proxy
    if (!window.location.hostname.includes('backend')) return '';
    return PRODUCTION_BACKEND;
  }

  return process.env.NODE_ENV === 'production' ? PRODUCTION_BACKEND : LOCAL_BACKEND;
}

export function resolveApiUrl(path) {
  if (!path || path.startsWith('http')) return path;

  const base = getApiBaseUrl();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${normalized}` : normalized;
}

export { PRODUCTION_BACKEND, PRODUCTION_FRONTEND, LOCAL_BACKEND };
