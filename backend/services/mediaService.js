const fs = require('fs/promises');
const path = require('path');
const { spawn } = require('child_process');
const axios = require('axios');
const { processedDir } = require('../utils/upload');
const { removeFiles } = require('../utils/fileCleanup');
const { resolveFfmpegPath } = require('../utils/binaries');
const { runYtDlp } = require('../utils/ytDlp');

function isYouTubeUrl(videoUrl) {
  try {
    const { hostname, pathname } = new URL(videoUrl);
    const host = hostname.replace(/^www\./, '');
    return (
      host === 'youtu.be' ||
      host === 'youtube.com' ||
      host === 'm.youtube.com' ||
      host === 'music.youtube.com' ||
      (host.endsWith('youtube.com') &&
        (pathname.startsWith('/watch') || pathname.startsWith('/shorts') || pathname.startsWith('/embed')))
    );
  } catch {
    return false;
  }
}

function runFfmpeg(args) {
  const ffmpegPath = resolveFfmpegPath();

  return new Promise((resolve, reject) => {
    const processRef = spawn(ffmpegPath, ['-y', ...args], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';

    processRef.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    processRef.on('error', (error) => {
      if (error.code === 'ENOENT') {
        reject(new Error('ffmpeg is not installed on the server. Install ffmpeg to use media tools.'));
        return;
      }
      reject(error);
    });

    processRef.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(stderr || 'ffmpeg processing failed.'));
    });
  });
}

async function videoToMp3(file) {
  const outputName = `audio-${Date.now()}.mp3`;
  const outputPath = path.join(processedDir, outputName);

  await runFfmpeg(['-i', file.path, '-vn', '-acodec', 'libmp3lame', '-q:a', '2', outputPath]);
  await removeFiles([file]);
  return { filename: outputName };
}

async function compressVideo(file, options = {}) {
  const crf = Math.min(35, Math.max(18, Number(options.crf || 28)));
  const outputName = `video-compressed-${Date.now()}.mp4`;
  const outputPath = path.join(processedDir, outputName);

  await runFfmpeg([
    '-i',
    file.path,
    '-vcodec',
    'libx264',
    '-crf',
    String(crf),
    '-preset',
    'fast',
    '-acodec',
    'aac',
    outputPath
  ]);

  await removeFiles([file]);
  return { filename: outputName };
}

async function cutAudio(file, options = {}) {
  const start = String(options.start || '0');
  const duration = String(options.duration || '30');
  const outputName = `audio-cut-${Date.now()}.mp3`;
  const outputPath = path.join(processedDir, outputName);

  await runFfmpeg([
    '-ss',
    start,
    '-i',
    file.path,
    '-t',
    duration,
    '-acodec',
    'libmp3lame',
    '-q:a',
    '2',
    outputPath
  ]);

  await removeFiles([file]);
  return { filename: outputName };
}

async function downloadYouTubeVideo(videoUrl) {
  const outputStem = `youtube-${Date.now()}`;
  const outputTemplate = path.join(processedDir, `${outputStem}.%(ext)s`);

  await runYtDlp([
    '--no-playlist',
    '--no-warnings',
    '-f',
    'best[ext=mp4]/best',
    '--merge-output-format',
    'mp4',
    '-o',
    outputTemplate,
    videoUrl
  ]);

  const files = await fs.readdir(processedDir);
  const downloaded = files.filter((name) => name.startsWith(outputStem)).sort((a, b) => b.localeCompare(a));

  if (!downloaded.length) {
    throw new Error('YouTube video could not be saved. The video may be private, age-restricted, or unavailable.');
  }

  return { filename: downloaded[0] };
}

async function downloadDirectVideo(videoUrl) {
  const response = await axios.get(videoUrl, {
    responseType: 'arraybuffer',
    timeout: 45000,
    maxContentLength: 100 * 1024 * 1024,
    headers: { 'User-Agent': 'All-in-One-Utility-Tools/1.0' },
    maxRedirects: 5,
    validateStatus: (status) => status >= 200 && status < 400
  });

  const contentType = response.headers['content-type'] || '';
  if (!contentType.includes('video') && !contentType.includes('octet-stream')) {
    throw new Error(
      'URL does not point to a direct downloadable video file. For YouTube links, paste the full youtu.be or youtube.com URL.'
    );
  }

  const ext = contentType.includes('mp4') ? 'mp4' : contentType.includes('webm') ? 'webm' : 'video';
  const outputName = `downloaded-${Date.now()}.${ext}`;
  await fs.writeFile(path.join(processedDir, outputName), response.data);
  return { filename: outputName };
}

async function downloadVideoFromUrl(videoUrl) {
  const trimmedUrl = String(videoUrl || '').trim();
  if (!trimmedUrl) {
    throw new Error('Video URL is required.');
  }

  if (isYouTubeUrl(trimmedUrl)) {
    return downloadYouTubeVideo(trimmedUrl);
  }

  return downloadDirectVideo(trimmedUrl);
}

module.exports = {
  videoToMp3,
  compressVideo,
  cutAudio,
  downloadVideoFromUrl
};
