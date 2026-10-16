import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16 defaults: Partial Prerendering via Cache Components.
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Required allowlist in Next.js 16.
    qualities: [75],
    formats: ["image/avif", "image/webp"],
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
