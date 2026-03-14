import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  turbopack: {
    root: process.cwd(),
    resolveAlias: {
      'tailwindcss': require.resolve('tailwindcss'),
    },
  },
};

export default nextConfig;
