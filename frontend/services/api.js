import { resolveApiUrl } from '../utils/apiBase';

async function parseResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  let data;

  try {
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      if (!res.ok) {
        throw new Error(text.slice(0, 200) || `Request failed (${res.status})`);
      }
      throw new Error('Unexpected response from server. Please try again.');
    }
  } catch (error) {
    if (error.message && !error.message.includes('Unexpected response')) {
      throw error;
    }
    throw new Error(
      res.ok
        ? 'Unexpected response from server. Please try again.'
        : `API request failed (${res.status}). Check that the backend service is running.`
    );
  }

  if (!res.ok) {
    throw new Error(data.error || data.message || 'Request failed');
  }
  return data;
}

async function request(path, options) {
  try {
    const res = await fetch(resolveApiUrl(path), options);
    return parseResponse(res);
  } catch (error) {
    if (error.name === 'TypeError' || error.message === 'Failed to fetch') {
      throw new Error(
        process.env.NODE_ENV === 'production'
          ? 'Cannot reach the API server. The backend may be down or still deploying.'
          : 'Cannot reach the API server. Start the backend with: npm run dev:backend (or npm run dev:all)'
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

function appendFiles(formData, files, key = 'files') {
  files.forEach((file) => formData.append(key, file));
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

export const splitPdfBatch = (files, range) => {
  const formData = new FormData();
  appendFiles(formData, files);
  formData.append('range', range || '');
  return postForm('/api/pdf/split/batch', formData);
};

export const compressPdf = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return postForm('/api/pdf/compress', formData);
};

export const compressPdfBatch = (files) => {
  const formData = new FormData();
  appendFiles(formData, files);
  return postForm('/api/pdf/compress/batch', formData);
};

export const createPdfFromText = ({ text, pageSize, orientation, fontSize, compression }) =>
  postJson('/api/pdf/create/text', { text, pageSize, orientation, fontSize, compression });

export const createPdfFromImages = (files, options = {}) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, String(value));
  });
  return postForm('/api/pdf/create/images', formData);
};

export const createPdfFromMixed = (files, options = {}) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, String(value));
  });
  return postForm('/api/pdf/create/mixed', formData);
};

export const deletePdfPages = (file, range) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('range', range);
  return postForm('/api/pdf/delete-pages', formData);
};

export const reorderPdfPages = (file, order, rotations) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('order', order);
  formData.append('rotations', rotations);
  return postForm('/api/pdf/reorder', formData);
};

export const editPdf = (file, annotations, overlayFiles = []) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('annotations', JSON.stringify(annotations));
  overlayFiles.forEach((overlay) => formData.append('overlays', overlay));
  return postForm('/api/pdf/edit', formData);
};

export const scanToPdf = (files, options = {}) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, String(value));
  });
  return postForm('/api/pdf/scan', formData);
};

// Image
export const compressImage = (file, quality, width) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('quality', String(quality));
  if (width) formData.append('width', String(width));
  return postForm('/api/image/compress', formData);
};

export const compressImageBatch = (files, quality, width) => {
  const formData = new FormData();
  appendFiles(formData, files);
  formData.append('quality', String(quality));
  if (width) formData.append('width', String(width));
  return postForm('/api/image/compress/batch', formData);
};

export const resizeImage = (file, width, height) => {
  const formData = new FormData();
  formData.append('file', file);
  if (width) formData.append('width', String(width));
  if (height) formData.append('height', String(height));
  return postForm('/api/image/resize', formData);
};

export const resizeImageBatch = (files, width, height) => {
  const formData = new FormData();
  appendFiles(formData, files);
  if (width) formData.append('width', String(width));
  if (height) formData.append('height', String(height));
  return postForm('/api/image/resize/batch', formData);
};

export const convertImage = (file, format) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('format', format);
  return postForm('/api/image/convert', formData);
};

export const convertImageBatch = (files, format) => {
  const formData = new FormData();
  appendFiles(formData, files);
  formData.append('format', format);
  return postForm('/api/image/convert/batch', formData);
};

export const processImage = (file, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, String(value));
    }
  });
  return postForm('/api/image/process', formData);
};

export const processImageBatch = (files, options = {}) => {
  const formData = new FormData();
  appendFiles(formData, files);
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, String(value));
    }
  });
  return postForm('/api/image/process/batch', formData);
};

export const imageToText = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return postForm('/api/image/ocr', formData);
};

export const imageToTextBatch = (files) => {
  const formData = new FormData();
  appendFiles(formData, files);
  return postForm('/api/image/ocr/batch', formData);
};

export const generateAiImage = (prompt, options = {}) => {
  const formData = new FormData();
  formData.append('prompt', prompt);
  if (options.aspectRatio) formData.append('aspectRatio', options.aspectRatio);
  if (options.referenceImage) formData.append('referenceImage', options.referenceImage);
  return postForm('/api/image/ai-generate', formData);
};

// Media
export const videoToMp3 = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return postForm('/api/media/video-to-mp3', formData);
};

export const videoToMp3Batch = (files) => {
  const formData = new FormData();
  appendFiles(formData, files);
  return postForm('/api/media/video-to-mp3/batch', formData);
};

export const compressVideo = (file, crf) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('crf', String(crf));
  return postForm('/api/media/compress', formData);
};

export const compressVideoBatch = (files, crf) => {
  const formData = new FormData();
  appendFiles(formData, files);
  formData.append('crf', String(crf));
  return postForm('/api/media/compress/batch', formData);
};

export const cutAudio = (file, start, duration) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('start', String(start));
  formData.append('duration', String(duration));
  return postForm('/api/media/audio-cut', formData);
};

export const cutAudioBatch = (files, start, duration) => {
  const formData = new FormData();
  appendFiles(formData, files);
  formData.append('start', String(start));
  formData.append('duration', String(duration));
  return postForm('/api/media/audio-cut/batch', formData);
};

export const downloadVideo = (url) => postJson('/api/media/download', { url });

// Text
export const checkGrammar = (text) => postJson('/api/text/grammar', { text });
export const paraphraseText = (text) => postJson('/api/text/paraphrase', { text });
export const checkPlagiarism = (sourceText, compareText) =>
  postJson('/api/text/plagiarism', { sourceText, compareText });
export const generateAiContent = (prompt, imageFile) => {
  const formData = new FormData();
  formData.append('prompt', prompt);
  if (imageFile) formData.append('image', imageFile);
  return postForm('/api/text/generate', formData);
};

// Developer
export const minifyCode = (code, type) => postJson('/api/developer/minify', { code, type });
export const htmlToText = (html) => postJson('/api/developer/html-to-text', { html });
export const beautifyCss = (css) => postJson('/api/developer/css-beautify', { css });
export const apiRequestTest = (url, method, body) => postJson('/api/developer/api-test', { url, method, body });
export const httpHeaderCheck = (url) => postJson('/api/developer/http-headers', { url });

// Social
export const downloadInstagram = (url) => postJson('/api/social/instagram', { url });
export const downloadThumbnail = (url, quality) => postJson('/api/social/thumbnail', { url, quality });
export const generateHashtags = (keywords, count) => postJson('/api/social/hashtags', { keywords, count });

// Security
export const generatePassword = (length, useSymbols) =>
  postJson('/api/security/password-generator', { length, useSymbols });
export const checkPasswordStrength = (password) => postJson('/api/security/password-strength', { password });
export const generateHash = (text) => postJson('/api/security/hash', { text });
export const hashVerify = (text, hash, algorithm) =>
  postJson('/api/security/hash-verify', { text, hash, algorithm });
export const dnsLookup = (domain) => postJson('/api/security/dns-lookup', { domain });
export const sslCertificateCheck = (domain) => postJson('/api/security/ssl-check', { domain });
export const securityHeadersCheck = (url) => postJson('/api/security/security-headers', { url });
export const robotsTxtCheck = (url) => postJson('/api/security/robots-txt', { url });
export const portScan = (domain) => postJson('/api/security/port-scan', { domain });
export const ipLookup = (domain) => postJson('/api/security/ip-lookup', { domain });
export const urlSafetyCheck = (url) => postJson('/api/security/url-safety', { url });

// Utility
export const convertUnit = (payload) => postJson('/api/utility/unit-convert', payload);
export const calculateAge = (birthDate) => postJson('/api/utility/age', { birthDate });
export const calculateEmi = (principal, annualRate, tenureMonths) =>
  postJson('/api/utility/emi', { principal, annualRate, tenureMonths });
export const convertCurrency = (amount, fromCurrency, toCurrency) =>
  postJson('/api/utility/currency', { amount, fromCurrency, toCurrency });
