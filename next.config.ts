import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static-media.hotmart.com',
      },
      {
        protocol: 'https',
        hostname: 'uploads.teachablecdn.com',
      },
    ],
  },
};

export default nextConfig;
