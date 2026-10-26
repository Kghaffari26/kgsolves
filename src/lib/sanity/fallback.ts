import "server-only";
import projects from "@/content/fallback/projects.json";
import services from "@/content/fallback/services.json";
import settings from "@/content/fallback/siteSettings.json";
import testimonials from "@/content/fallback/testimonials.json";
import team from "@/content/fallback/team.json";
import posts from "@/content/fallback/posts.json";
import areas from "@/content/fallback/areas.json";
import type {
  Area,
  Post,
  Project,
  Service,
  SiteSettings,
  TeamMember,
  Testimonial,
} from "@/lib/types";

/** Local seed content used whenever Sanity isn't configured. */
export const fallback = {
  projects: projects as Project[],
  services: services as Service[],
  settings: settings as SiteSettings,
  testimonials: testimonials as Testimonial[],
  team: team as TeamMember[],
  posts: posts as Post[],
  areas: areas as Area[],
};
