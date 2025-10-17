/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flagcdn.com'
      }
    ]
  },
  // Add any other Next.js configuration options here
};

module.exports = nextConfig;