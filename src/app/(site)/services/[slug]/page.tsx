import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { Todo } from "@/components/ui/Todo";
import { PageHero } from "@/components/sections/PageHero";
import { Faq } from "@/components/sections/Faq";
import { CtaBand } from "@/components/sections/CtaBand";
import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { FadeUp } from "@/components/motion/FadeUp";
import { ProjectCard } from "@/components/work/ProjectCard";
import { VideoEmbed } from "@/components/media/VideoEmbed";
import { JsonLd } from "@/components/seo/JsonLd";
import { getProjects, getService, getServices } from "@/lib/sanity/api";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbLd, faqLd, serviceLd } from "@/lib/seo/jsonld";

export async function generateStaticParams() {
  return (await getServices()).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const s = await getService(slug);
  if (!s) return {};
  return buildMetadata({
    title: s.title,
    description: s.summary,
    path: `/services/${s.slug}`,
    image: s.heroImage.src,
  });
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const [service, projects] = await Promise.all([getService(slug), getProjects()]);
  if (!service) notFound();
  const flagship = service.slug === "concrete-framing";
  const related = (() => {
    const matches = projects.filter((p) => service.relatedTypes.includes(p.type));
    return (matches.length ? matches : projects.filter((p) => p.featured)).slice(0, 3);
  })();
  const faq = faqLd(service.faqs);

  return (
    <>
      <JsonLd
        data={[
          serviceLd(service),
          breadcrumbLd([
            { name: "Services", path: "/services" },
            { name: service.title, path: `/services/${service.slug}` },
          ]),
          ...(faq ? [faq] : []),
        ]}
      />
      <PageHero
        eyebrow={flagship ? "Services · Self-performed" : "Services"}
        title={[service.title]}
        lead={service.intro}
      />

      <ParallaxImage
        image={service.heroImage}
        priority
        className="aspect-[16/9] max-h-[85svh] w-full bg-sand md:aspect-[21/9]"
      />

      {flagship && (
        <section aria-labelledby="timelapse-title" className="theme-dark section-y-sm">
          <Container>
            <div className="grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <Eyebrow>Time-lapse</Eyebrow>
                <Heading id="timelapse-title" size="h3" className="mt-5">
                  Slab to frame, in minutes.
                </Heading>
              </div>
              <div className="lg:col-span-8">
                {service.video ? (
                  <VideoEmbed video={service.video} />
                ) : (
                  <div className="flex aspect-video items-center justify-center border border-dashed border-rule p-8 text-center">
                    <Todo>time-lapse video of a pour and frame (Mux or Vimeo)</Todo>
                  </div>
                )}
              </div>
            </div>
          </Container>
        </section>
      )}

      <section aria-labelledby="included-title" className="section-y">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Eyebrow>What&rsquo;s included</Eyebrow>
              <Heading id="included-title" size="h2" className="mt-5">
                The scope.
              </Heading>
            </div>
            <ul className="grid gap-x-[var(--grid-gap)] gap-y-10 sm:grid-cols-2 lg:col-span-8">
              {service.included.map((item, i) => (
                <FadeUp
                  as="li"
                  key={item.title}
                  delay={(i % 2) * 80}
                  className="border-t border-rule pt-5"
                >
                  <h3 className="font-display text-h4">{item.title}</h3>
                  <p className="mt-3 text-fg-muted">{item.body}</p>
                </FadeUp>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section aria-labelledby="svc-process-title" className="theme-stone section-y">
        <Container>
          <Eyebrow>Process</Eyebrow>
          <Heading id="svc-process-title" size="h2" className="mt-5">
            How it runs.
          </Heading>
          <ol className="mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {service.process.map((step, i) => (
              <FadeUp as="li" key={step.title} delay={i * 80} className="border-t border-rule pt-5">
                <p className="eyebrow text-accent-text tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 font-display text-h3">{step.title}</h3>
                <p className="mt-3 text-fg-muted">{step.body}</p>
              </FadeUp>
            ))}
          </ol>
        </Container>
      </section>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="section-y">
          <Container>
            <Eyebrow>Related work</Eyebrow>
            <Heading id="related-title" size="h2" className="mt-5">
              Built by us.
            </Heading>
            <div className="mt-12 grid gap-x-[var(--grid-gap)] gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProjectCard key={p.slug} project={p} aspect="aspect-[4/3]" />
              ))}
            </div>
          </Container>
        </section>
      )}

      <section aria-labelledby="faq-title" className="section-y pt-0">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Eyebrow>FAQ</Eyebrow>
              <Heading id="faq-title" size="h2" className="mt-5">
                Questions.
              </Heading>
            </div>
            <div className="lg:col-span-8">
              <Faq items={service.faqs} />
            </div>
          </div>
        </Container>
      </section>

      <CtaBand title={`Talk to us about ${service.title.toLowerCase()}.`} />
    </>
  );
}
