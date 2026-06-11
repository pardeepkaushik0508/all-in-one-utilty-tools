/** @type {import('next').NextConfig} */
const PRODUCTION_BACKEND = 'https://aio-tools-backend-production.up.railway.app';
const PRODUCTION_FRONTEND = 'https://utilitytools.in';

const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BACKEND_URL: PRODUCTION_BACKEND,
    NEXT_PUBLIC_SITE_URL: PRODUCTION_FRONTEND
  },
  // Browser calls Express directly (see utils/apiBase.js). Only /downloads is proxied here.
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
