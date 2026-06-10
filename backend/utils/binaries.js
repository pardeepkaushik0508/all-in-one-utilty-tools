const fs = require('fs');
const path = require('path');

const YT_DLP_CANDIDATES = [
  process.env.YT_DLP_PATH,
  path.join(__dirname, '../../node_modules/youtube-dl-exec/bin/yt-dlp'),
  path.join(__dirname, '../../../node_modules/youtube-dl-exec/bin/yt-dlp')
].filter(Boolean);

function resolveYtDlpPath() {
  for (const candidate of YT_DLP_CANDIDATES) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

function resolveFfmpegPath() {
  if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) {
    return process.env.FFMPEG_PATH;
  }

  try {
    const bundled = require('ffmpeg-static');
    if (bundled && fs.existsSync(bundled)) {
      return bundled;
    }
  } catch {
    // ffmpeg-static optional until installed
  }

  return 'ffmpeg';
}

module.exports = {
  resolveYtDlpPath,
  resolveFfmpegPath
};
