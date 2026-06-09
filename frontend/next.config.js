/** @type {import('next').NextConfig} */
const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:5000';

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: 'https://aio-tools-backend-production.up.railway.app/api/:path*'
        }
      ],
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
