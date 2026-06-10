/** @type {import('next').NextConfig} */
const PRODUCTION_BACKEND = 'https://aio-tools-backend-production.up.railway.app';

const backendUrl =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (process.env.NODE_ENV === 'production' ? PRODUCTION_BACKEND : 'http://127.0.0.1:5000');

const nextConfig = {
  reactStrictMode: true,
  // Do NOT proxy /api/* — multipart uploads fail through the Next.js dev/prod proxy (ECONNRESET).
  // The browser calls the backend directly via resolveApiUrl() in utils/apiBase.js.
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [
        {
          source: '/downloads/:path*',
          destination: `${backendUrl}/downloads/:path*`
        }
      ]
    };
  }
};

module.exports = nextConfig;
