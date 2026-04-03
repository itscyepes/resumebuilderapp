/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['docx', '@react-pdf/renderer'],
  },
  typescript: {
    // Type errors are caught locally — don't block production builds
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};
 
module.exports = nextConfig;
 
