import type { NextConfig } from "next";

const VPS = "http://5.129.221.75";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '5.129.221.75',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${VPS}/api/:path*`,
      },
      {
        source: '/media/:path*',
        destination: `${VPS}/media/:path*`,
      },
    ];
  },
};

export default nextConfig;
