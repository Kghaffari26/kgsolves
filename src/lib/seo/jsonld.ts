import { siteUrl } from "@/lib/env";
import { serviceAreas } from "@/lib/site";
import type { Faq, Post, Project, Service, SiteSettings } from "@/lib/types";

const abs = (path: string) => (path.startsWith("http") ? path : `${siteUrl}${path}`);
const ORG_ID = `${siteUrl}/#organization`;

/** GeneralContractor + HomeAndConstructionBusiness, rendered on every page. */
export function organizationLd(s: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": ["GeneralContractor", "HomeAndConstructionBusiness"],
    "@id": ORG_ID,
    name: s.companyName,
    legalName: s.legalName,
    url: siteUrl,
    telephone: `+1-${s.phone}`,
    logo: abs("/icon"),
    image: abs("/images/projects/4-fairway-point/hero.jpg"),
    address: {
      "@type": "PostalAddress",
      addressLocality: s.city,
      addressRegion: s.region,
      addressCountry: "US",
      ...(s.streetAddress ? { streetAddress: s.streetAddress } : {}),
      ...(s.postalCode ? { postalCode: s.postalCode } : {}),
    },
    openingHours: s.openingHours,
    areaServed: serviceAreas.map((a) => ({ "@type": "City", name: `${a.name}, CA` })),
    identifier: {
      "@type": "PropertyValue",
      propertyID: "California CSLB License",
      value: s.license.number,
    },
    sameAs: s.social.map((x) => x.url).filter(Boolean),
  };
}

/** Case studies: a CreativeWork describing the built project. */
export function projectLd(p: Project) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${abs(`/work/${p.slug}`)}#project`,
    name: p.title,
    description: p.summary,
    url: abs(`/work/${p.slug}`),
    image: [p.heroImage, ...p.gallery].filter((i) => !i.placeholder).map((i) => abs(i.src)),
    creator: { "@id": ORG_ID },
    locationCreated: { "@type": "Place", name: `${p.location}, CA` },
    ...(p.year ? { dateCreated: p.year } : {}),
    about:
      p.type === "multi-unit" ? "Multi-unit residential construction" : "Residential construction",
  };
}

/** FAQPage. Questions without a confirmed answer are left out. */
export function faqLd(faqs: Faq[]) {
  const answered = faqs.filter((f) => f.answer);
  if (!answered.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: answered.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function serviceLd(s: Service) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.title,
    description: s.summary,
    url: abs(`/services/${s.slug}`),
    provider: { "@id": ORG_ID },
    areaServed: serviceAreas.map((a) => `${a.name}, CA`),
  };
}

export function articleLd(p: Post) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: p.title,
    description: p.excerpt,
    url: abs(`/journal/${p.slug}`),
    ...(p.publishedAt ? { datePublished: p.publishedAt } : {}),
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...items].map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  };
}
