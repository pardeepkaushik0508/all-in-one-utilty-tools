# All-in-One Utility Tools

A dashboard of 29 utility tools (PDF, image, media, text, developer, social, security, and calculators) with the existing Tailwind UI preserved.

## Stack

- **Frontend:** Next.js 14 (Pages Router), React 18, Tailwind CSS
- **Backend:** Express API with file processing services

## Prerequisites

- Node.js 18+
- **ffmpeg** (required for video/audio tools)

```bash
# Ubuntu/Debian
sudo apt-get install -y ffmpeg
```

## Setup

```bash
# Install dependencies (root workspaces)
npm install

# Backend environment
cp backend/.env.example backend/.env

# Frontend environment
cp frontend/.env.local.example frontend/.env.local
```

Optional: set `OPENAI_API_KEY` in `backend/.env` for AI Content Generator and enhanced Paraphrasing. Without it, those tools use local fallback behavior.

## Run locally

**Recommended — one command (starts backend + frontend):**

```bash
npm run dev
# or: npm run dev:all
```

If you see *"Cannot reach the API server"*, the backend is not running. Use `npm run dev` (both services) instead of `npm run dev:frontend` alone.

**Two terminals (optional):**

```bash
# Terminal 1 - API
npm run dev:backend

# Terminal 2 - Web app
npm run dev:frontend
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Health check: http://localhost:5000/api/health

## Project structure

```
backend/
  api/           # Route handlers by domain
  services/      # Processing logic (pdf, image, media, text, etc.)
  middleware/    # Rate limiting
  uploads/       # Temporary uploads
  processed/     # Generated download files

frontend/
  components/tools/   # One module per tool category
  hooks/useToolRequest.js
  pages/tool/[slug].js
  services/api.js
```

## Tool coverage

| Category | Tools |
|----------|-------|
| PDF | Merge, Split, Compress |
| Image | Compress, Resize, Convert, OCR |
| Video/Audio | Video→MP3, Compress, Audio Cutter, Direct URL Downloader |
| Text | Grammar (LanguageTool), Paraphrase, Plagiarism, AI Generator |
| Developer | JSON Formatter (client), Code Minifier, HTML→Text, CSS Beautifier |
| Social | Instagram media resolve, YouTube Thumbnail, Hashtag Generator |
| Security | Password Generator, Strength Checker, Hash Generator |
| Utility | Unit Converter, Age, EMI, Currency (Frankfurter API) |

## Notes

- Upload limits: 10MB (default), 50MB (media tools)
- API rate limits: 120 requests / 15 min (general), 40 uploads / 15 min
- Video downloader supports **direct video file URLs** only (not YouTube watch pages)
- Instagram downloader resolves public Open Graph media links when available
- Currency converter uses https://api.frankfurter.app (no API key required)

## Production build & start

You must **build before start**. `next start` only serves an existing `.next` folder.

```bash
npm install
npm run build
npm run start
```

Backend (separate process):

```bash
npm run start:backend
```

### Railway (two services)

| Service | URL |
|---------|-----|
| Frontend | https://aio-tools-frontend-production.up.railway.app |
| Backend | https://aio-tools-backend-production.up.railway.app |

**Frontend (`aio-tools-frontend`)**

| Setting | Value |
|---------|--------|
| Root Directory | `/` (repo root) |
| Config file | `railway.toml` |
| Build Command | `npm install && npm run build` |
| Start Command | `npm run start` |

**Backend (`aio-tools-backend`)**

| Setting | Value |
|---------|--------|
| Root Directory | `/` (repo root) |
| Config file | `railway.backend.toml` |
| Build Command | `npm install` |
| Start Command | `npm run start:backend` |

**Backend env vars (Railway Variables tab)**

```
FRONTEND_URL=https://aio-tools-frontend-production.up.railway.app
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
GEMINI_API_KEY=...
```

Frontend production URLs are in `frontend/.env.production` (used at build time for API proxy).

**Verify after deploy**

```bash
curl https://aio-tools-backend-production.up.railway.app/api/health
curl https://aio-tools-frontend-production.up.railway.app/api/health
```

Both should return `{"status":"ok",...}`.

**Important:** Railway Start Command must be exactly `npm run start` or `npm run start:backend` — no comments.

### Other notes

1. Set `FRONTEND_URL` on the backend to your frontend domain.
2. Ensure `ffmpeg` is installed on the backend server (Nixpacks/Railway may need a `nixpacks.toml` for ffmpeg).
3. `.next` is gitignored — the build step must run on the server during deploy.
