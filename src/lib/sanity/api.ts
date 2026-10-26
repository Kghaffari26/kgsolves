import "server-only";
import { cache } from "react";
import { fallback } from "./fallback";
import { sanityFetch } from "./client";
import { isSanityConfigured } from "./env";
import { mapPost, mapProject, mapService, mapTeam } from "./mappers";
import {
  postsQuery,
  projectsQuery,
  servicesQuery,
  settingsQuery,
  teamQuery,
  testimonialsQuery,
} from "./queries";
import type {
  Area,
  CitySlug,
  Post,
  Project,
  Service,
  SiteSettings,
  TeamMember,
  Testimonial,
} from "@/lib/types";

/**
 * Data layer. Reads Sanity when NEXT_PUBLIC_SANITY_PROJECT_ID is set, otherwise (or if a
 * request fails) the local JSON in src/content/fallback. Pages never talk to Sanity directly.
 */
async function load<T>(
  label: string,
  fromSanity: () => Promise<T | null | undefined>,
  local: T,
): Promise<T> {
  if (!isSanityConfigured) return local;
  try {
    const data = await fromSanity();
    // An empty dataset (before seeding) shouldn't blank the site.
    if (
      data == null ||
      (Array.isArray(data) && data.length === 0 && Array.isArray(local) && local.length > 0)
    )
      return local;
    return data;
  } catch (err) {
    console.error(`[sanity] ${label} failed, using fallback JSON:`, (err as Error).message);
    return local;
  }
}

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const s = await load(
    "settings",
    () => sanityFetch<SiteSettings | null>(settingsQuery, {}, ["siteSettings"]),
    fallback.settings,
  );
  return { ...fallback.settings, ...s, license: { ...fallback.settings.license, ...s.license } };
});

export const getProjects = cache(async (): Promise<Project[]> =>
  load(
    "projects",
    async () =>
      (await sanityFetch<Parameters<typeof mapProject>[0][]>(projectsQuery, {}, ["project"])).map(
        mapProject,
      ),
    [...fallback.projects].sort(byOrder),
  ),
);

export async function getProject(slug: string): Promise<Project | null> {
  return (await getProjects()).find((p) => p.slug === slug) ?? null;
}

export async function getFeaturedProjects(): Promise<Project[]> {
  return (await getProjects()).filter((p) => p.featured);
}

export async function getProjectsByCity(city: CitySlug): Promise<Project[]> {
  return (await getProjects()).filter((p) => p.city === city);
}

export const getServices = cache(async (): Promise<Service[]> =>
  load(
    "services",
    async () =>
      (await sanityFetch<Parameters<typeof mapService>[0][]>(servicesQuery, {}, ["service"])).map(
        mapService,
      ),
    [...fallback.services].sort(byOrder),
  ),
);

export async function getService(slug: string): Promise<Service | null> {
  return (await getServices()).find((s) => s.slug === slug) ?? null;
}

/** Testimonials never fall back: if Sanity has none, the section hides. */
export const getTestimonials = cache(async (): Promise<Testimonial[]> => {
  if (!isSanityConfigured) return fallback.testimonials;
  return sanityFetch<Testimonial[]>(testimonialsQuery, {}, ["testimonial"]).catch(() => []);
});

export const getTeam = cache(async (): Promise<TeamMember[]> => {
  if (!isSanityConfigured) return fallback.team;
  return sanityFetch<Parameters<typeof mapTeam>[0][]>(teamQuery, {}, ["teamMember"])
    .then((list) => list.map(mapTeam))
    .catch(() => []);
});

/** Published posts only. Fallback drafts are never listed on public routes. */
export const getPosts = cache(async (): Promise<Post[]> => {
  if (!isSanityConfigured) return fallback.posts.filter((p) => !p.draft);
  return sanityFetch<Parameters<typeof mapPost>[0][]>(postsQuery, {}, ["post"])
    .then((list) => list.map(mapPost))
    .catch(() => []);
});

export async function getPost(slug: string): Promise<Post | null> {
  return (await getPosts()).find((p) => p.slug === slug) ?? null;
}

/** Service-area copy lives in code/JSON (it rarely changes and must stay unique per city). */
export async function getAreas(): Promise<Area[]> {
  return fallback.areas;
}

export async function getArea(slug: string): Promise<Area | null> {
  return fallback.areas.find((a) => a.slug === slug) ?? null;
}
