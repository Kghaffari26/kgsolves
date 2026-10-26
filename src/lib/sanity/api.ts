import "server-only";
import settingsJson from "@/content/fallback/siteSettings.json";
import type { SiteSettings } from "@/lib/types";

export async function getSiteSettings(): Promise<SiteSettings> {
  return settingsJson as SiteSettings;
}
