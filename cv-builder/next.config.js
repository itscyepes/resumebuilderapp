/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['docx', '@react-pdf/renderer'],
  },
};

module.exports = nextConfig;
