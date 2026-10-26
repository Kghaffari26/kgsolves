import "server-only";
import { fallback } from "./fallback";
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

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;

export async function getSiteSettings(): Promise<SiteSettings> {
  return fallback.settings;
}

export async function getProjects(): Promise<Project[]> {
  return [...fallback.projects].sort(byOrder);
}

export async function getProject(slug: string): Promise<Project | null> {
  return (await getProjects()).find((p) => p.slug === slug) ?? null;
}

export async function getFeaturedProjects(): Promise<Project[]> {
  return (await getProjects()).filter((p) => p.featured);
}

export async function getProjectsByCity(city: CitySlug): Promise<Project[]> {
  return (await getProjects()).filter((p) => p.city === city);
}

export async function getServices(): Promise<Service[]> {
  return [...fallback.services].sort(byOrder);
}

export async function getService(slug: string): Promise<Service | null> {
  return (await getServices()).find((s) => s.slug === slug) ?? null;
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return fallback.testimonials;
}

export async function getTeam(): Promise<TeamMember[]> {
  return fallback.team;
}

/** Drafts are excluded unless explicitly requested (never on public routes). */
export async function getPosts({ includeDrafts = false } = {}): Promise<Post[]> {
  return fallback.posts.filter((p) => includeDrafts || !p.draft);
}

export async function getPost(slug: string): Promise<Post | null> {
  return (await getPosts()).find((p) => p.slug === slug) ?? null;
}

export async function getAreas(): Promise<Area[]> {
  return fallback.areas;
}

export async function getArea(slug: string): Promise<Area | null> {
  return fallback.areas.find((a) => a.slug === slug) ?? null;
}
