import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days cache for optimized images
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
      {
        protocol: "https",
        hostname: "borneobikers.com",
      },
      {
        protocol: "https",
        hostname: "**.gambarku.my.id",
      },
      {
        protocol: "https",
        hostname: "gambarku.my.id",
      },
      {
        protocol: "https",
        hostname: "**.qardasku.my.id",
      },
      {
        protocol: "https",
        hostname: "qardasku.my.id",
      },
      {
        protocol: "https",
        hostname: "**.my.id",
      },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
