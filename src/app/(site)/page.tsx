import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { VideoHero } from "@/components/sections/home/VideoHero";
import { Positioning } from "@/components/sections/home/Positioning";
import { FoundationUp } from "@/components/sections/home/FoundationUp";
import { FeaturedWork } from "@/components/sections/home/FeaturedWork";
import { ServicesList, type ServiceGroup } from "@/components/sections/home/ServicesList";
import { AudienceSplit } from "@/components/sections/home/AudienceSplit";
import { ProcessTeaser } from "@/components/sections/home/ProcessTeaser";
import { Testimonials } from "@/components/sections/home/Testimonials";
import { CtaBand } from "@/components/sections/CtaBand";
import {
  getFeaturedProjects,
  getProject,
  getServices,
  getSiteSettings,
  getTestimonials,
} from "@/lib/sanity/api";

export const metadata: Metadata = buildMetadata({
  title: "Coastal Homes, Built From the Foundation Up",
  description:
    "JM Kelley Inc. is a Newport Beach general contractor that pours and frames its own projects: custom homes, remodels, ADUs, structural concrete and framing across coastal Orange County.",
  path: "/",
  image: "/images/projects/4-fairway-point/hero.jpg",
});

export default async function HomePage() {
  const [settings, featured, services, testimonials, fairway] = await Promise.all([
    getSiteSettings(),
    getFeaturedProjects(),
    getServices(),
    getTestimonials(),
    getProject("4-fairway-point"),
  ]);
  const hero = fairway?.heroImage ?? featured[0].heroImage;
  const svc = (slug: string) => services.find((s) => s.slug === slug)!;

  const groups: ServiceGroup[] = [
    {
      title: "Custom homes & design-build",
      summary: svc("custom-homes").summary,
      href: "/services/custom-homes",
      image: svc("custom-homes").heroImage,
    },
    {
      title: "Remodels, additions & ADUs",
      summary: "Remodels, additions and accessory dwelling units, structure included.",
      href: "/services/remodels-additions",
      image: svc("remodels-additions").heroImage,
    },
    {
      title: "Structural concrete & framing",
      summary: svc("concrete-framing").summary,
      href: "/services/concrete-framing",
      image: svc("concrete-framing").heroImage,
    },
    {
      title: "Project management & owner's rep",
      summary: "Feasibility to job documentation, or on your side of another builder's table.",
      href: "/services/project-management",
      image: svc("project-management").heroImage,
    },
    {
      title: "Take-offs for the trade",
      summary:
        "Lumber take-offs in 48 hours, quantity take-offs and budgets for builders and framers.",
      href: "/for-builders",
      image: svc("owners-representation").heroImage,
    },
  ];

  return (
    <>
      <VideoHero poster={hero} />
      <Positioning stats={settings.stats} />
      <FoundationUp finished={hero} />
      <FeaturedWork projects={featured.slice(0, 4)} />
      <ServicesList groups={groups} />
      <AudienceSplit
        panels={[
          {
            eyebrow: "Homeowners & developers",
            title: "Building a home?",
            body: "New homes, remodels and ADUs, from first budget to final walkthrough.",
            cta: "Start a project",
            href: "/contact",
            image: featured[1]?.heroImage ?? hero,
          },
          {
            eyebrow: "Builders, framers & lumber yards",
            title: "Builder or framer?",
            body: "Send plans for a lumber take-off with a 48-hour turnaround.",
            cta: "Upload plans",
            href: "/for-builders#upload",
            image: svc("concrete-framing").heroImage,
          },
        ]}
      />
      <ProcessTeaser />
      <Testimonials items={testimonials} />
      <CtaBand />
    </>
  );
}
