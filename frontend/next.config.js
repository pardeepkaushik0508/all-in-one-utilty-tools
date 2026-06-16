/** @type {import('next').NextConfig} */
const PRODUCTION_FRONTEND = process.env.NEXT_PUBLIC_SITE_URL || 'https://utilitytools.in';
const PRODUCTION_BACKEND = (
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'https://aio-tools-backend.onrender.com'
).replace(/\/$/, '');

const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BACKEND_URL: PRODUCTION_BACKEND,
    NEXT_PUBLIC_SITE_URL: PRODUCTION_FRONTEND
  },
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
