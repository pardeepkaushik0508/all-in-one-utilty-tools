const axios = require('axios');

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

async function resolveInstagramMedia(url) {
  const response = await axios.get(url, {
    timeout: 20000,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
    }
  });

  const html = String(response.data || '');
  const ogImage = html.match(/property="og:image" content="([^"]+)"/i);
  const ogVideo = html.match(/property="og:video" content="([^"]+)"/i);

  if (!ogImage && !ogVideo) {
    throw new Error('Could not extract public media from this Instagram URL.');
  }

  return {
    imageUrl: ogImage ? ogImage[1].replace(/&amp;/g, '&') : null,
    videoUrl: ogVideo ? ogVideo[1].replace(/&amp;/g, '&') : null
  };
}

module.exports = {
  getThumbnail,
  generateHashtags,
  resolveInstagramMedia
};
