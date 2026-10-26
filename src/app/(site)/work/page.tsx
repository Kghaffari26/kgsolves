import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealText } from "@/components/motion/RevealText";
import { WorkGrid } from "@/components/work/WorkGrid";
import { CtaBand } from "@/components/sections/CtaBand";
import { getProjects } from "@/lib/sanity/api";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Work",
  description:
    "Custom homes and coastal projects built by JM Kelley Inc. in Newport Beach and Newport Coast, from structural concrete and framing to the finished house.",
  path: "/work",
});

export default async function WorkPage() {
  const projects = await getProjects();
  return (
    <>
      <section className="pt-[calc(var(--header-h)+var(--section-y-sm))] pb-[var(--section-y)]">
        <Container>
          <Eyebrow>Work</Eyebrow>
          <RevealText as="h1" className="mt-6 max-w-[14ch] font-display text-h1 text-fg-strong">
            {["Homes we poured,", "framed and finished."]}
          </RevealText>
          <p className="mt-8 max-w-xl text-lead text-fg-muted">
            A selection of projects in Newport Beach and Newport Coast. Each one started with our
            own concrete and framing crews.
          </p>
          <div className="mt-16">
            <WorkGrid projects={projects} />
          </div>
        </Container>
      </section>
      <CtaBand />
    </>
  );
}
