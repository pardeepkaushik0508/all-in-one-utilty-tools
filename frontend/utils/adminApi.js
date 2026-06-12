import { resolveApiUrl } from './apiBase';

export async function adminLogin(email, password) {
  const response = await fetch(resolveApiUrl('/api/admin/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function adminFetch(path, { method = 'GET', body, token } = {}) {
  const response = await fetch(resolveApiUrl(path), {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': token || ''
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function adminUpload(path, file, token) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(resolveApiUrl(path), {
    method: 'POST',
    headers: { 'x-admin-token': token || '' },
    body: formData
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Upload failed');
  return data;
}

export async function triggerRevalidate(token, paths) {
  return adminFetch('/api/admin/revalidate', { method: 'POST', body: { paths }, token });
}

export const ADMIN_TOKEN_KEY = 'aio_admin_token';
