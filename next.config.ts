import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/hodometro-dashboard',
  assetPrefix: '/hodometro-dashboard/',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
