/** Public, build-safe environment helpers. Every value has a working default. */

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
).replace(/\/$/, "");

/** TODO(client) markers are visible until NEXT_PUBLIC_HIDE_TODOS=true. */
export const showTodos = process.env.NEXT_PUBLIC_HIDE_TODOS !== "true";
