const PRODUCTION_BACKEND = 'https://aio-tools-backend-production.up.railway.app';

function isRailwayHost() {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.endsWith('.railway.app');
}

export function getApiBaseUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  if (typeof window !== 'undefined') {
    return isRailwayHost() ? PRODUCTION_BACKEND : '';
  }

  return process.env.NODE_ENV === 'production' ? PRODUCTION_BACKEND : 'http://127.0.0.1:5000';
}

export function resolveApiUrl(path) {
  if (!path || path.startsWith('http')) return path;
  const base = getApiBaseUrl();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${normalized}` : normalized;
}
