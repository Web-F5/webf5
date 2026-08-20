/** @type {import('next').NextConfig} */

const nextConfig = {

  basePath: '',
  assetPrefix: '',

  images: {
    formats: ['image/webp'],
  },

  reactStrictMode: false,

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;

