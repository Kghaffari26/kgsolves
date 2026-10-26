import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { Todo } from "@/components/ui/Todo";
import { Divider } from "@/components/ui/Divider";
import { PageHero } from "@/components/sections/PageHero";
import { FadeUp } from "@/components/motion/FadeUp";
import { Button } from "@/components/ui/Button";
import { PhoneLink } from "@/components/layout/PhoneLink";
import { PlanUploadSlot } from "./PlanUploadSlot";
import { getSiteSettings } from "@/lib/sanity/api";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "For Builders",
  description:
    "Lumber take-offs with a 48-hour turnaround, quantity take-offs and budgets, and pre-fab and modular framing for builders, framers and lumber yards.",
  path: "/for-builders",
});

const send = [
  "Complete plan set as PDF or DWG (architectural and structural)",
  "Project address or city",
  "The date you need the take-off by",
  "Anything specific: framing package only, sheathing, hardware, species or grade notes",
];

export default async function ForBuildersPage() {
  const settings = await getSiteSettings();
  return (
    <>
      <PageHero
        eyebrow="For builders, framers & lumber yards"
        title={["Take-offs from people", "who frame for a living."]}
        lead="We frame our own projects, so our take-offs are written by people who actually stand the walls. Send plans, get a lumber take-off back in 48 hours."
      >
        <div className="mt-10 flex flex-wrap gap-4">
          <Button href="#upload" arrow>
            Upload plans
          </Button>
          <PhoneLink
            phone={settings.phone}
            location="for_builders_hero"
            className="link-underline inline-flex min-h-12 items-center px-2 text-fg-strong"
          />
        </div>
      </PageHero>

      <section aria-labelledby="takeoff-title" className="theme-dark section-y">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Eyebrow>Lumber take-off service</Eyebrow>
              <Heading id="takeoff-title" size="h2" className="mt-5">
                48-hour turnaround.
              </Heading>
              <p className="mt-6 max-w-md text-lead text-fg-muted">
                Some rules apply. Pricing is based on the complexity of the plans.
              </p>
            </div>
            <dl className="grid gap-x-[var(--grid-gap)] gap-y-10 sm:grid-cols-2 lg:col-span-7">
              <div className="border-t border-rule pt-5">
                <dt className="font-display text-h4 text-fg-strong">Turnaround</dt>
                <dd className="mt-3 text-fg-muted">
                  48 hours from receiving a complete plan set.{" "}
                  <Todo>
                    the &ldquo;some rules apply&rdquo; conditions (business days? plan size limits?)
                  </Todo>
                </dd>
              </div>
              <div className="border-t border-rule pt-5">
                <dt className="font-display text-h4 text-fg-strong">Pricing basis</dt>
                <dd className="mt-3 text-fg-muted">
                  Quoted on complexity: plan size, number of levels, roof geometry and structural
                  detail. <Todo>pricing tiers or starting price, if any</Todo>
                </dd>
              </div>
              <div className="border-t border-rule pt-5 sm:col-span-2">
                <dt className="font-display text-h4 text-fg-strong">What to send</dt>
                <dd className="mt-3">
                  <ul className="space-y-2 text-fg-muted">
                    {send.map((s) => (
                      <li key={s} className="flex gap-3">
                        <span aria-hidden className="mt-3 h-px w-4 shrink-0 bg-accent" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
          </div>
        </Container>
      </section>

      <section aria-label="Other trade services" className="section-y">
        <Container>
          <div className="grid gap-[var(--grid-gap)] md:grid-cols-2">
            <FadeUp className="border-t border-rule pt-6">
              <Eyebrow>Pre-fab & modular framing</Eyebrow>
              <h2 className="mt-5 font-display text-h3">Framing built off site, stood on site.</h2>
              <p className="mt-4 max-w-lg text-fg-muted">
                We offer pre-fab and modular framing alongside conventional rough framing, where
                panelizing saves time on site.
              </p>
              <p className="mt-4">
                <Todo>relationship with socalprefab.com</Todo>
              </p>
            </FadeUp>
            <FadeUp delay={90} className="border-t border-rule pt-6">
              <Eyebrow>Quantity take-offs & budgets</Eyebrow>
              <h2 className="mt-5 font-display text-h3">Numbers before commitments.</h2>
              <p className="mt-4 max-w-lg text-fg-muted">
                Quantity take-offs and construction budgets for builders, developers and owners,
                built from the plans rather than square-foot rules of thumb.
              </p>
            </FadeUp>
          </div>
        </Container>
      </section>

      <section
        id="upload"
        aria-labelledby="upload-title"
        className="theme-stone section-y scroll-mt-20"
      >
        <Container width="narrow">
          <Divider variant="blueprint" label="Upload" className="mb-12" />
          <Eyebrow>Send plans</Eyebrow>
          <Heading id="upload-title" size="h2" className="mt-5">
            Upload your plan set.
          </Heading>
          <p className="mt-5 max-w-xl text-fg-muted">
            PDF or DWG, multiple files, 50 MB total. We&rsquo;ll confirm receipt and the quote.
          </p>
          <div className="mt-12">
            <PlanUploadSlot />
          </div>
        </Container>
      </section>
    </>
  );
}
