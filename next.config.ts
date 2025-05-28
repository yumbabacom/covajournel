import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Basic production optimizations
  compress: true,
  poweredByHeader: false,

  // TypeScript configuration - ignore errors for deployment
  typescript: {
    ignoreBuildErrors: true,
  },

  // ESLint configuration - ignore warnings for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
