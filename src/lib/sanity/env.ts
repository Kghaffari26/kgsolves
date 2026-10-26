/** Sanity configuration. Missing values are fine: the site falls back to local JSON. */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = "2025-10-01";
export const readToken = process.env.SANITY_API_READ_TOKEN;

export const isSanityConfigured = /^[a-z0-9-]+$/.test(projectId);
