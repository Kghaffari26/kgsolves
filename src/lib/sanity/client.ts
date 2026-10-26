import "server-only";
import { createClient, type QueryParams } from "next-sanity";
import { apiVersion, dataset, isSanityConfigured, projectId, readToken } from "./env";

export const client = isSanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
      perspective: "published",
      token: readToken,
    })
  : null;

/** Revalidated hourly as a safety net; the Sanity webhook (/api/revalidate) refreshes tags instantly. */
export async function sanityFetch<T>(
  query: string,
  params: QueryParams = {},
  tags: string[] = [],
): Promise<T> {
  if (!client) throw new Error("Sanity is not configured");
  return client.fetch<T>(query, params, { next: { revalidate: 3600, tags: ["sanity", ...tags] } });
}
