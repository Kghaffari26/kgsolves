import type { CitySlug, ProjectType } from "./types";

export const mainNav = [
  { label: "Work", href: "/work" },
  { label: "Services", href: "/services" },
  { label: "For Builders", href: "/for-builders" },
  { label: "Process", href: "/process" },
  { label: "About", href: "/about" },
] as const;

export const serviceAreas: { slug: CitySlug; name: string }[] = [
  { slug: "newport-beach", name: "Newport Beach" },
  { slug: "newport-coast", name: "Newport Coast" },
  { slug: "corona-del-mar", name: "Corona del Mar" },
  { slug: "costa-mesa", name: "Costa Mesa" },
  { slug: "huntington-beach", name: "Huntington Beach" },
];

export const projectTypeLabels: Record<ProjectType, string> = {
  "new-home": "New home",
  remodel: "Remodel",
  adu: "ADU",
  "multi-unit": "Multi-unit",
  commercial: "Commercial",
};

export const projectFilters: { value: ProjectType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new-home", label: "New homes" },
  { value: "remodel", label: "Remodels" },
  { value: "adu", label: "ADUs" },
  { value: "multi-unit", label: "Multi-unit" },
  { value: "commercial", label: "Commercial" },
];

export function cityName(slug: CitySlug) {
  return serviceAreas.find((a) => a.slug === slug)?.name ?? slug;
}
