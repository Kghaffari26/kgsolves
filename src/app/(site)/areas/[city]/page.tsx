import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { PageHero } from "@/components/sections/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { FadeUp } from "@/components/motion/FadeUp";
import { ProjectCard } from "@/components/work/ProjectCard";
import { Button } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { getArea, getAreas, getProjectsByCity } from "@/lib/sanity/api";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbLd } from "@/lib/seo/jsonld";

export async function generateStaticParams() {
  return (await getAreas()).map((a) => ({ city: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/areas/[city]">): Promise<Metadata> {
  const { city } = await params;
  const area = await getArea(city);
  if (!area) return {};
  return buildMetadata({
    title: `${area.name} General Contractor`,
    description: `${area.intro[0]} JM Kelley Inc. builds custom homes, remodels and ADUs in ${area.name}.`,
    path: `/areas/${area.slug}`,
  });
}

export default async function AreaPage({ params }: PageProps<"/areas/[city]">) {
  const { city } = await params;
  const area = await getArea(city);
  if (!area) notFound();
  const projects = await getProjectsByCity(area.slug);

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Service areas", path: "/services" },
          { name: area.name, path: `/areas/${area.slug}` },
        ])}
      />
      <PageHero
        eyebrow={`Service area · ${area.name}`}
        title={[`Building in ${area.name}.`]}
        lead={
          <div className="space-y-5">
            {area.intro.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        }
      />

      <section aria-labelledby="considerations-title" className="theme-stone section-y">
        <Container>
          <Eyebrow>What to plan for</Eyebrow>
          <Heading id="considerations-title" size="h2" className="mt-5">
            {area.name}, specifically.
          </Heading>
          <ul className="mt-14 grid gap-10 md:grid-cols-3">
            {area.considerations.map((c, i) => (
              <FadeUp as="li" key={c.title} delay={i * 80} className="border-t border-rule pt-5">
                <h3 className="font-display text-h4">{c.title}</h3>
                <p className="mt-3 text-fg-muted">{c.body}</p>
              </FadeUp>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="local-work-title" className="section-y">
        <Container>
          <Eyebrow>Local work</Eyebrow>
          <Heading id="local-work-title" size="h2" className="mt-5">
            {projects.length ? `Our projects in ${area.name}.` : `Projects in ${area.name}.`}
          </Heading>
          {projects.length ? (
            <div className="mt-12 grid gap-x-[var(--grid-gap)] gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <ProjectCard key={p.slug} project={p} aspect="aspect-[4/3]" />
              ))}
            </div>
          ) : (
            <div className="mt-8 max-w-xl">
              <p className="text-lead text-fg-muted">
                We haven&rsquo;t published a {area.name} project here yet. Our portfolio covers
                nearby Newport Beach and Newport Coast.
              </p>
              <Button href="/work" variant="text" arrow className="mt-6">
                See all work
              </Button>
            </div>
          )}
        </Container>
      </section>

      <CtaBand title={`Planning a project in ${area.name}?`} />
    </>
  );
}
