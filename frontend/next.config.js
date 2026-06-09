/** @type {import('next').NextConfig} */
const backendUrl =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'http://127.0.0.1:5000';

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: `${backendUrl}/api/:path*`
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
