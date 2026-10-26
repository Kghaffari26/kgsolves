import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/sections/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { FadeUp } from "@/components/motion/FadeUp";
import { Button } from "@/components/ui/Button";
import { getServices } from "@/lib/sanity/api";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Services",
  description:
    "Custom homes, remodels, ADUs, structural concrete and framing, project management and owner's representation from JM Kelley Inc. in Newport Beach.",
  path: "/services",
});

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <>
      <PageHero
        eyebrow="Services"
        title={["General contracting,", "with the structure in-house."]}
        lead="We build custom homes, remodels and ADUs, and we self-perform the structural concrete and framing. We also manage projects and represent owners on builds run by others."
      />
      <section aria-label="All services" className="pb-[var(--section-y)]">
        <Container>
          <ul className="divide-y divide-rule border-y border-rule">
            {services.map((s, i) => (
              <FadeUp as="li" key={s.slug}>
                <Link
                  href={`/services/${s.slug}`}
                  className="group grid items-center gap-6 py-10 md:grid-cols-12"
                  data-cursor="View"
                >
                  <span className="eyebrow text-fg-muted tabular-nums md:col-span-1">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="md:col-span-6">
                    <h2 className="font-display text-h2 transition-transform duration-500 ease-[var(--ease-out)] group-hover:translate-x-2 motion-reduce:group-hover:translate-x-0">
                      {s.title}
                    </h2>
                    <p className="mt-3 max-w-lg text-fg-muted">{s.summary}</p>
                  </div>
                  <div className="relative aspect-[4/3] overflow-hidden bg-sand md:col-span-4 md:col-start-9">
                    <Image
                      src={s.heroImage.src}
                      alt={s.heroImage.alt}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out)] group-hover:scale-105 motion-reduce:group-hover:scale-100"
                    />
                  </div>
                </Link>
              </FadeUp>
            ))}
          </ul>
          <div className="mt-16 flex flex-wrap items-center justify-between gap-6 border border-rule p-8 md:p-12">
            <div>
              <h2 className="font-display text-h3">Builder, framer or lumber yard?</h2>
              <p className="mt-2 max-w-xl text-fg-muted">
                Lumber take-offs with a 48-hour turnaround, quantity take-offs and pre-fab framing.
              </p>
            </div>
            <Button href="/for-builders" variant="ghost" arrow>
              For builders
            </Button>
          </div>
        </Container>
      </section>
      <CtaBand />
    </>
  );
}
