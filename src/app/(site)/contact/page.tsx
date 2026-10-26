import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealText } from "@/components/motion/RevealText";
import { PhoneLink } from "@/components/layout/PhoneLink";
import { StartProjectSlot } from "./StartProjectSlot";
import { getSiteSettings } from "@/lib/sanity/api";
import { buildMetadata } from "@/lib/seo/metadata";
import { serviceAreas } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Start a project",
  description:
    "Tell JM Kelley Inc. about your custom home, remodel, ADU or development in Newport Beach and coastal Orange County. Call 949-873-0740.",
  path: "/contact",
});

export default async function ContactPage() {
  const settings = await getSiteSettings();
  return (
    <section className="pt-[calc(var(--header-h)+var(--section-y-sm))] pb-[var(--section-y)]">
      <Container>
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Eyebrow>Start a project</Eyebrow>
            <RevealText as="h1" className="mt-6 font-display text-h1 text-fg-strong">
              {["Tell us what", "you're building."]}
            </RevealText>
            <p className="mt-8 max-w-md text-lead text-fg-muted">
              Four short steps. We&rsquo;ll reply with next steps, usually starting with a
              conversation about budget.
            </p>

            <dl className="mt-12 space-y-8">
              <div className="border-t border-rule pt-5">
                <dt className="eyebrow text-fg-muted">Call</dt>
                <dd className="mt-3">
                  <PhoneLink
                    phone={settings.phone}
                    location="contact_page"
                    className="link-underline font-display text-h3 text-fg-strong tabular-nums"
                  />
                </dd>
              </div>
              <div className="border-t border-rule pt-5">
                <dt className="eyebrow text-fg-muted">Hours</dt>
                {settings.hours.map((h) => (
                  <dd key={h.days} className="mt-2">
                    <span className="text-fg-muted">{h.days}:</span> {h.hours}
                  </dd>
                ))}
              </div>
              <div className="border-t border-rule pt-5">
                <dt className="eyebrow text-fg-muted">Service area</dt>
                <dd className="mt-3">{serviceAreas.map((a) => a.name).join(" · ")}</dd>
              </div>
            </dl>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <StartProjectSlot />
          </div>
        </div>

        <figure className="mt-[var(--section-y-sm)]">
          <div className="relative aspect-[16/9] overflow-hidden border border-rule bg-limestone md:aspect-[21/8]">
            <iframe
              title="Map of our service area: Huntington Beach to Newport Coast"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-118.06%2C33.57%2C-117.77%2C33.73&layer=mapnik"
              loading="lazy"
              className="absolute inset-0 size-full grayscale-[0.6]"
            />
          </div>
          <figcaption className="mt-3 text-small text-fg-muted">
            Service area: Newport Beach, Newport Coast, Corona del Mar, Costa Mesa and Huntington
            Beach. Map © OpenStreetMap contributors.
          </figcaption>
        </figure>
      </Container>
    </section>
  );
}
