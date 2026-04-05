import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    domains: [
      'solomon-lawrence-media.s3.eu-north-1.amazonaws.com',
      'd3o8u8o2i2q94t.cloudfront.net',
    ],
  },
};

export default nextConfig;