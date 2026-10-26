import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";
import { getAreas, getPosts, getProjects, getServices } from "@/lib/sanity/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, services, areas, posts] = await Promise.all([
    getProjects(),
    getServices(),
    getAreas(),
    getPosts(),
  ]);
  const url = (p: string) => `${siteUrl}${p}`;
  const staticPages: [string, number][] = [
    ["/", 1],
    ["/work", 0.9],
    ["/services", 0.8],
    ["/for-builders", 0.8],
    ["/process", 0.6],
    ["/about", 0.6],
    ["/contact", 0.8],
    ["/journal", 0.4],
    ["/privacy", 0.1],
  ];
  return [
    ...staticPages.map(([p, priority]) => ({ url: url(p), priority })),
    ...projects.map((p) => ({
      url: url(`/work/${p.slug}`),
      priority: 0.7,
      images: p.heroImage.placeholder ? undefined : [url(p.heroImage.src)],
    })),
    ...services.map((s) => ({ url: url(`/services/${s.slug}`), priority: 0.7 })),
    ...areas.map((a) => ({ url: url(`/areas/${a.slug}`), priority: 0.6 })),
    ...posts.map((p) => ({
      url: url(`/journal/${p.slug}`),
      lastModified: p.publishedAt ?? undefined,
      priority: 0.4,
    })),
  ];
}
