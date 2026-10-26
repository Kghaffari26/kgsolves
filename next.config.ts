import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components is left off on purpose: this is a content site fed by Sanity
  // with tag-based ISR (see src/lib/sanity/fetch.ts and /api/revalidate).
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
};

export default nextConfig;
