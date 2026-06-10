const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { isCloudinaryEnabled } = require('./utils/cloudinary');
const { apiLimiter, uploadLimiter } = require('./middleware/rateLimit');
const pdfRoutes = require('./api/pdfRoutes');
const imageRoutes = require('./api/imageRoutes');
const mediaRoutes = require('./api/mediaRoutes');
const textRoutes = require('./api/textRoutes');
const developerRoutes = require('./api/developerRoutes');
const socialRoutes = require('./api/socialRoutes');
const utilityRoutes = require('./api/utilityRoutes');
const securityRoutes = require('./api/securityRoutes');
const fileRoutes = require('./api/fileRoutes');
const contentRoutes = require('./api/contentRoutes');
const adminRoutes = require('./api/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

// Railway / reverse-proxy — required for rate limiting and correct client IP
app.set('trust proxy', 1);

const corsOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://aio-tools-frontend-production.up.railway.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, true);
    },
    credentials: true
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(apiLimiter);

app.use('/downloads', express.static(path.join(__dirname, 'processed')));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'All-in-One Utility Tools API running',
    gemini: Boolean(process.env.GEMINI_API_KEY),
    ffmpeg: require('./utils/binaries').resolveFfmpegPath()
  });
});

app.get('/', (_req, res) => {
  res.json({
    service: 'aio-tools-backend',
    status: 'ok',
    health: '/api/health'
  });
});

app.use('/api/pdf', uploadLimiter, pdfRoutes);
app.use('/api/image', uploadLimiter, imageRoutes);
app.use('/api/media', uploadLimiter, mediaRoutes);
app.use('/api/text', textRoutes);
app.use('/api/developer', developerRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/utility', utilityRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Maximum upload size is 100MB.' });
  }

  return res.status(err.status || 500).json({
    error: err.message || 'Something went wrong on the server.'
  });
});

const server = app.listen(PORT, HOST, () => {
  console.log(`[aio-tools-backend] Express API listening on http://${HOST}:${PORT}`);
  console.log(`File storage: ${isCloudinaryEnabled() ? 'Cloudinary' : 'local (/downloads)'}`);
  if (!process.env.GEMINI_API_KEY) {
    console.warn(
      '[aio-tools-backend] GEMINI_API_KEY is not set — AI content/image tools will fail. ' +
        'Add it to backend/.env (local) or Railway backend Variables (production).'
    );
  } else {
    console.log(`Gemini: enabled (${process.env.GEMINI_MODEL || 'gemini-2.5-flash'})`);
  }
});

// Allow time for image/video processing on Railway (default ~2 min proxy timeout).
server.timeout = 300000;
server.keepAliveTimeout = 120000;
server.headersTimeout = 125000;

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(
      `Port ${PORT} is already in use. Another backend instance is running.\n` +
        'Fix: run only one dev server — use "npm run dev" from the project root, or stop the other process:\n' +
        '  fuser -k 5000/tcp'
    );
    process.exit(1);
  }
  throw error;
});
