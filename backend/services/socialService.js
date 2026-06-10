const axios = require('axios');
const { fetchYtDlpJson } = require('../utils/ytDlp');

function extractYoutubeId(url) {
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{6,})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{6,})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function isInstagramUrl(url) {
  try {
    const { hostname } = new URL(url);
    const host = hostname.replace(/^www\./, '');
    return host === 'instagram.com' || host.endsWith('.instagram.com');
  } catch {
    return false;
  }
}

function normalizeInstagramUrl(url) {
  const trimmed = String(url || '').trim();
  if (!trimmed) return trimmed;
  const withProtocol = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
  const parsed = new URL(withProtocol);
  parsed.hash = '';
  return parsed.toString();
}

function pickBestFormat(formats = []) {
  const videoFormats = formats
    .filter((format) => format.url && (format.vcodec !== 'none' || format.ext === 'mp4'))
    .sort((a, b) => (Number(b.height) || 0) - (Number(a.height) || 0));

  return videoFormats[0] || null;
}

async function getThumbnail(url, quality = 'hq') {
  const youtubeId = extractYoutubeId(url);
  if (!youtubeId) {
    throw new Error('Provide a valid YouTube URL for thumbnail download.');
  }

  const qualityMap = {
    default: 'default.jpg',
    mq: 'mqdefault.jpg',
    hq: 'hqdefault.jpg',
    maxres: 'maxresdefault.jpg'
  };

  const fileName = qualityMap[quality] || qualityMap.hq;
  const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/${fileName}`;

  const response = await axios.get(thumbnailUrl, {
    responseType: 'arraybuffer',
    timeout: 20000
  });

  return {
    thumbnailUrl,
    imageBase64: Buffer.from(response.data).toString('base64'),
    contentType: response.headers['content-type'] || 'image/jpeg'
  };
}

function generateHashtags(keywords, count = 12) {
  const base = String(keywords || '')
    .split(/[,\s]+/)
    .map((word) => word.trim().replace(/^#/, ''))
    .filter(Boolean);

  const tags = new Set();
  base.forEach((word) => {
    tags.add(`#${word.toLowerCase()}`);
    tags.add(`#${word.toLowerCase()}tips`);
    tags.add(`#${word.toLowerCase()}daily`);
  });

  const popular = ['#trending', '#viral', '#contentcreator', '#socialmedia', '#marketing', '#growth'];
  popular.forEach((tag) => {
    if (tags.size < count) tags.add(tag);
  });

  return { hashtags: [...tags].slice(0, count) };
}

async function resolveInstagramWithYtDlp(url) {
  const normalizedUrl = normalizeInstagramUrl(url);
  const info = await fetchYtDlpJson(normalizedUrl);
  const bestFormat = pickBestFormat(info.formats || []);
  const videoUrl = bestFormat?.url || info.url || null;
  const imageUrl = info.thumbnail || bestFormat?.thumbnail || null;

  if (!videoUrl && !imageUrl) {
    throw new Error('Could not extract public media from this Instagram URL.');
  }

  return {
    title: info.title || info.description || 'Instagram media',
    imageUrl,
    videoUrl,
    duration: info.duration || null,
    provider: 'yt-dlp'
  };
}

async function resolveInstagramFromHtml(url) {
  const normalizedUrl = normalizeInstagramUrl(url);
  const response = await axios.get(normalizedUrl, {
    timeout: 20000,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9'
    }
  });

  const html = String(response.data || '');
  const patterns = [
    /property="og:video" content="([^"]+)"/i,
    /property="og:video:secure_url" content="([^"]+)"/i,
    /property="og:image" content="([^"]+)"/i
  ];

  let videoUrl = null;
  let imageUrl = null;

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (!match) continue;
    const value = match[1].replace(/&amp;/g, '&');
    if (pattern.source.includes('video') && !videoUrl) videoUrl = value;
    if (pattern.source.includes('image') && !imageUrl) imageUrl = value;
  }

  if (!videoUrl && !imageUrl) {
    throw new Error('Could not extract public media from this Instagram URL.');
  }

  return {
    imageUrl,
    videoUrl,
    provider: 'html-meta'
  };
}

async function resolveInstagramMedia(url) {
  const normalizedUrl = normalizeInstagramUrl(url);
  if (!isInstagramUrl(normalizedUrl)) {
    throw new Error('Provide a valid Instagram post or reel URL.');
  }

  try {
    return await resolveInstagramWithYtDlp(normalizedUrl);
  } catch (primaryError) {
    try {
      return await resolveInstagramFromHtml(normalizedUrl);
    } catch {
      throw primaryError;
    }
  }
}

module.exports = {
  getThumbnail,
  generateHashtags,
  resolveInstagramMedia
};
