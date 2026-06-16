const LOCAL_BACKEND = 'http://127.0.0.1:5000';

// Render backend — set via NEXT_PUBLIC_BACKEND_URL / BACKEND_URL at build time on Render
const DEFAULT_PRODUCTION_BACKEND = 'https://aio-tools-backend.onrender.com';

function normalizeBase(url = '') {
  return String(url).trim().replace(/\/$/, '');
}

function isLocalhost() {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1';
}

function resolveConfiguredBackend() {
  const fromEnv = normalizeBase(
    process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || ''
  );
  return fromEnv || DEFAULT_PRODUCTION_BACKEND;
}

export function getApiBaseUrl() {
  if (typeof window !== 'undefined') {
    return isLocalhost() ? LOCAL_BACKEND : resolveConfiguredBackend();
  }
  return process.env.NODE_ENV === 'production' ? resolveConfiguredBackend() : LOCAL_BACKEND;
}

export function resolveApiUrl(path) {
  if (!path || path.startsWith('http')) return path;

  const base = getApiBaseUrl();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

export const PRODUCTION_BACKEND = DEFAULT_PRODUCTION_BACKEND;
export const LOCAL_BACKEND_URL = LOCAL_BACKEND;
