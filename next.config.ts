import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable Turbopack for production builds to avoid lightningcss issues
  experimental: {
    turbo: undefined,
  },
};

export default nextConfig;
