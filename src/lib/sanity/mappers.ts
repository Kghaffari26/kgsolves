import { toImageAsset, type SanityImage } from "./image";
import type { Post, Project, Service, TeamMember } from "@/lib/types";

/* Raw query results: same shape as our types, except images. */
type Raw<T, K extends keyof T> = Omit<T, K> & { [P in K]: unknown };

const img = (i: unknown) => toImageAsset(i as SanityImage);
const imgs = (list: unknown) =>
  ((list as SanityImage[] | null) ?? []).map(toImageAsset).filter((x) => x !== null);

export function mapProject(p: Raw<Project, "heroImage" | "gallery" | "beforeAfter">): Project {
  const pairs = (
    (p.beforeAfter as { label?: string; before: SanityImage; after: SanityImage }[] | null) ?? []
  )
    .map((b) => ({
      label: b.label ?? "Framing to finished",
      before: toImageAsset(b.before),
      after: toImageAsset(b.after),
    }))
    .filter((b): b is Project["beforeAfter"][number] => Boolean(b.before && b.after));
  return {
    ...p,
    specs: p.specs ?? { beds: null, baths: null, sqft: null },
    story: p.story ?? { brief: null, build: null, result: null },
    typeConfirmed: p.typeConfirmed ?? false,
    heroVideo: p.heroVideo?.mp4 ? p.heroVideo : null,
    heroImage: img(p.heroImage) ?? {
      src: "/images/projects/4-fairway-point/hero.jpg",
      alt: `${p.title}`,
      width: 2400,
      height: 1500,
      placeholder: true,
    },
    gallery: imgs(p.gallery),
    beforeAfter: pairs,
  };
}

export function mapService(s: Raw<Service, "heroImage">): Service {
  return {
    ...s,
    included: s.included ?? [],
    process: s.process ?? [],
    faqs: s.faqs ?? [],
    relatedTypes: s.relatedTypes ?? [],
    heroImage: img(s.heroImage) ?? {
      src: "/images/projects/4-fairway-point/hero.jpg",
      alt: s.title,
      width: 2400,
      height: 1500,
      placeholder: true,
    },
  };
}

export function mapTeam(m: Raw<TeamMember, "photo">): TeamMember {
  return { ...m, photo: img(m.photo) };
}

export function mapPost(
  p: Omit<Post, "heroImage" | "draft" | "bodyFormat"> & { heroImage: unknown },
): Post {
  return {
    ...p,
    heroImage: img(p.heroImage),
    draft: false,
    bodyFormat: "portableText",
    body: p.body ?? [],
  };
}
