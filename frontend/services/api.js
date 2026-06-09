// Browser: use the public Railway domain (NEXT_PUBLIC_BACKEND_URL) so the
//   browser can reach the backend directly without relying on Next.js rewrites.
// Server: use the private Railway internal domain (BACKEND_URL) for low-latency
//   server-side calls that never leave the Railway private network.
const BACKEND_URL =
  typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_BACKEND_URL || 'https://aio-tools-backend-production.up.railway.app'
    : process.env.BACKEND_URL || 'http://aio-tools-backend.railway.internal:8080';

async function parseResponse(res) {
  let data;
  try {
    data = await res.json();
  } catch (_error) {
    throw new Error('Invalid response from server. Is the backend running?');
  }

  if (!res.ok) {
    throw new Error(data.error || data.message || 'Request failed');
  }
  return data;
}

async function request(path, options) {
  try {
    const res = await fetch(`${BACKEND_URL}${path}`, options);
    return parseResponse(res);
  } catch (error) {
    if (error.name === 'TypeError' || error.message === 'Failed to fetch') {
      throw new Error(
        'Cannot reach the API server. Start the backend with: npm run dev:backend (or npm run dev:all)'
      );
    }
    throw error;
  }
}

async function postJson(path, body) {
  return request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

async function postForm(path, formData) {
  return request(path, {
    method: 'POST',
    body: formData
  });
}

// PDF
export const mergePdf = (files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  return postForm('/api/pdf/merge', formData);
};

export const splitPdf = (file, range) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('range', range || '');
  return postForm('/api/pdf/split', formData);
};

export const compressPdf = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return postForm('/api/pdf/compress', formData);
};

// Image
export const compressImage = (file, quality, width) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('quality', String(quality));
  if (width) formData.append('width', String(width));
  return postForm('/api/image/compress', formData);
};

export const resizeImage = (file, width, height) => {
  const formData = new FormData();
  formData.append('file', file);
  if (width) formData.append('width', String(width));
  if (height) formData.append('height', String(height));
  return postForm('/api/image/resize', formData);
};

export const convertImage = (file, format) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('format', format);
  return postForm('/api/image/convert', formData);
};

export const imageToText = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return postForm('/api/image/ocr', formData);
};

// Media
export const videoToMp3 = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return postForm('/api/media/video-to-mp3', formData);
};

export const compressVideo = (file, crf) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('crf', String(crf));
  return postForm('/api/media/compress', formData);
};

export const cutAudio = (file, start, duration) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('start', String(start));
  formData.append('duration', String(duration));
  return postForm('/api/media/audio-cut', formData);
};

export const downloadVideo = (url) => postJson('/api/media/download', { url });

// Text
export const checkGrammar = (text) => postJson('/api/text/grammar', { text });
export const paraphraseText = (text) => postJson('/api/text/paraphrase', { text });
export const checkPlagiarism = (sourceText, compareText) =>
  postJson('/api/text/plagiarism', { sourceText, compareText });
export const generateAiContent = (prompt) => postJson('/api/text/generate', { prompt });

// Developer
export const minifyCode = (code, type) => postJson('/api/developer/minify', { code, type });
export const htmlToText = (html) => postJson('/api/developer/html-to-text', { html });
export const beautifyCss = (css) => postJson('/api/developer/css-beautify', { css });

// Social
export const downloadInstagram = (url) => postJson('/api/social/instagram', { url });
export const downloadThumbnail = (url, quality) => postJson('/api/social/thumbnail', { url, quality });
export const generateHashtags = (keywords, count) => postJson('/api/social/hashtags', { keywords, count });

// Security
export const generatePassword = (length, useSymbols) =>
  postJson('/api/security/password-generator', { length, useSymbols });
export const checkPasswordStrength = (password) => postJson('/api/security/password-strength', { password });
export const generateHash = (text) => postJson('/api/security/hash', { text });

// Utility
export const convertUnit = (payload) => postJson('/api/utility/unit-convert', payload);
export const calculateAge = (birthDate) => postJson('/api/utility/age', { birthDate });
export const calculateEmi = (principal, annualRate, tenureMonths) =>
  postJson('/api/utility/emi', { principal, annualRate, tenureMonths });
export const convertCurrency = (amount, fromCurrency, toCurrency) =>
  postJson('/api/utility/currency', { amount, fromCurrency, toCurrency });
