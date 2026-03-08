import type { NextConfig } from "next";

const VPS = "http://168.222.192.21";

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
        hostname: '168.222.192.21',
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
