import type { Metadata } from "next";

const SUFFIX = "JM Kelley Inc. — Newport Beach Builder";

/**
 * Per-page metadata: unique title ("{Page} | JM Kelley Inc. — Newport Beach Builder"),
 * description, canonical URL, and Open Graph/Twitter cards with a generated OG image.
 */
export function buildMetadata({
  title,
  description,
  path,
  image,
  noindex,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  /** a site-relative image to feature in the generated OG card */
  image?: string;
  noindex?: boolean;
  type?: "website" | "article";
}): Metadata {
  const fullTitle = `${title} | ${SUFFIX}`;
  const og = `/api/og?${new URLSearchParams({ title, ...(image ? { image } : {}) })}`;
  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: "JM Kelley Inc.",
      locale: "en_US",
      type,
      images: [{ url: og, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [og] },
    robots: noindex ? { index: false, follow: false } : undefined,
  };
}
