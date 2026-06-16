import { resolveApiUrl } from './apiBase';

export async function adminLogin(email, password) {
  const response = await fetch(resolveApiUrl('/api/admin/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await parseResponse(response);
  if (!response.ok) throw new Error(data.error || 'Login failed');
  return data;
}

async function parseResponse(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { error: text.slice(0, 240) || `HTTP ${response.status}` };
  }
}

export async function adminFetch(path, { method = 'GET', body, token } = {}) {
  let response;
  try {
    response = await fetch(resolveApiUrl(path), {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token || ''
      },
      body: body ? JSON.stringify(body) : undefined
    });
  } catch (error) {
    throw new Error(
      error?.message === 'Failed to fetch'
        ? 'Cannot reach the API server. Check that the backend is running and BACKEND_URL is correct.'
        : (error?.message || 'Network error')
    );
  }

  const data = await parseResponse(response);
  if (!response.ok) {
    const message = data.error || data.message || `Request failed (HTTP ${response.status})`;
    throw new Error(message);
  }
  return data;
}

export async function adminUpload(path, file, token) {
  const formData = new FormData();
  formData.append('file', file);
  let response;
  try {
    response = await fetch(resolveApiUrl(path), {
      method: 'POST',
      headers: { 'x-admin-token': token || '' },
      body: formData
    });
  } catch (error) {
    throw new Error(error?.message || 'Upload failed — network error');
  }
  const data = await parseResponse(response);
  if (!response.ok) throw new Error(data.error || 'Upload failed');
  return data;
}

export async function triggerRevalidate(token, paths) {
  return adminFetch('/api/admin/revalidate', { method: 'POST', body: { paths }, token });
}

export const ADMIN_TOKEN_KEY = 'aio_admin_token';
