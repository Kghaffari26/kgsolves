import type { NextConfig } from "next";

/** 301s from the old GoDaddy URLs. "/services" keeps its URL, so it needs no rule. */
const legacyRedirects = [
  { source: "/portfolio", destination: "/work" },
  { source: "/contact-us", destination: "/contact" },
  { source: "/4-fairway-point", destination: "/work/4-fairway-point" },
  { source: "/1418-balboa-blvd", destination: "/work/1418-balboa-blvd" },
  // GoDaddy's comma-encoded slug, in both encoded and decoded forms.
  { source: "/1441%2C-443%2C-445-m", destination: "/work/441-445-m-street" },
  { source: "/1441,-443,-445-m", destination: "/work/441-445-m-street" },
  { source: "/4807-seashore", destination: "/work/4807-seashore" },
  { source: "/2000-east", destination: "/work/2000-east-oceanfront" },
  { source: "/302-kings-road", destination: "/work/302-kings-road" },
];

const nextConfig: NextConfig = {
  async redirects() {
    return legacyRedirects.map((r) => ({ ...r, statusCode: 301 as const }));
  },
  // Cache Components is left off on purpose: this is a content site fed by Sanity
  // with tag-based ISR (see src/lib/sanity/fetch.ts and /api/revalidate).
  turbopack: {
    // Pin the workspace root so a stray lockfile in a parent folder is never picked up.
    root: process.cwd(),
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
