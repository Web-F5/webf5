/** @type {import('next').NextConfig} */
const SITE_SUBDIR = '/demos/webf5';    // ← update this value

const nextConfig = {
  output: 'export',
  basePath: SITE_SUBDIR,
  assetPrefix: `${SITE_SUBDIR}/`,
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

