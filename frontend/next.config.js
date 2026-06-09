/** @type {import('next').NextConfig} */
const backendUrl = process.env.BACKEND_URL || 'http://aio-tools-backend.railway.internal:8080';

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`
      },
      {
        source: '/downloads/:path*',
        destination: `${backendUrl}/downloads/:path*`
      }
    ];
  }
};

module.exports = nextConfig;
