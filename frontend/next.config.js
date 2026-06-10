/** @type {import('next').NextConfig} */
const PRODUCTION_BACKEND = 'https://aio-tools-backend-production.up.railway.app';

const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BACKEND_URL: PRODUCTION_BACKEND,
    NEXT_PUBLIC_SITE_URL: 'https://aio-tools-frontend-production.up.railway.app'
  },
  // Do NOT proxy /api/* — browser calls backend directly via utils/apiBase.js (runtime hostname check).
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [
        {
          source: '/downloads/:path*',
          destination: `${PRODUCTION_BACKEND}/downloads/:path*`
        }
      ]
    };
  }
};

module.exports = nextConfig;
