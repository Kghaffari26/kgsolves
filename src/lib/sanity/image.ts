import { createImageUrlBuilder } from "@sanity/image-url";
import { dataset, projectId } from "./env";
import type { ImageAsset } from "@/lib/types";

const builder = createImageUrlBuilder({ projectId: projectId || "missing", dataset });

/** Shape returned by the `imageFields` GROQ projection. */
export type SanityImage = {
  alt?: string;
  kind?: "finished" | "jobsite";
  asset?: {
    _id: string;
    url: string;
    metadata?: { lqip?: string; dimensions?: { width: number; height: number } };
  };
  hotspot?: unknown;
  crop?: unknown;
};

export function toImageAsset(img: SanityImage | null | undefined): ImageAsset | null {
  if (!img?.asset) return null;
  const dims = img.asset.metadata?.dimensions;
  return {
    src: builder.image(img).auto("format").width(2400).fit("max").url(),
    alt: img.alt ?? "",
    width: dims?.width ?? 2400,
    height: dims?.height ?? 1600,
    kind: img.kind,
    lqip: img.asset.metadata?.lqip,
  };
}
