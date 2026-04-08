/** @type {import('next').NextConfig} */

const nextConfig = {
  
  basePath: '',
  assetPrefix: '',

  trailingSlash: true,

  images: {
    unoptimized: true,
  },

  reactStrictMode: false,

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;

