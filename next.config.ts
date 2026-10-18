import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Standard stable config for Next.js App Router */
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
