/** @type {import('next').NextConfig} */

const nextConfig = {

  basePath: '',
  assetPrefix: '',

  trailingSlash: true,

  async redirects() {
    return [
      {
        source: '/sitemap.xml/',
        destination: '/sitemap.xml',
        permanent: true,
      },
      {
        source: '/robots.txt/',
        destination: '/robots.txt',
        permanent: true,
      },
    ]
  },

  images: {
    unoptimized: true,
  },

  reactStrictMode: false,

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;

