import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { Todo } from "@/components/ui/Todo";
import { PageHero } from "@/components/sections/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { FadeUp } from "@/components/motion/FadeUp";
import { getSiteSettings, getTeam } from "@/lib/sanity/api";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description:
    "JM Kelley Inc. is a Newport Beach general contractor that self-performs its structural concrete and framing. CSLB license #1065986.",
  path: "/about",
});

const principles = [
  {
    title: "We build the bones ourselves",
    body: "Structural concrete and rough framing are done by our own crews, not subcontracted.",
  },
  {
    title: "Numbers first",
    body: "Quantity take-offs and budgets come before commitments, and they're revisited as the design develops.",
  },
  {
    title: "One accountable team",
    body: "From feasibility to job documentation, one team answers for the budget, the schedule and the work.",
  },
  { title: "Wherever the client is", body: "For owner's representation, we travel worldwide." },
];

export default async function AboutPage() {
  const [settings, team] = await Promise.all([getSiteSettings(), getTeam()]);
  const founder = team.find((m) => m.founder);
  const crew = team.filter((m) => !m.founder);

  return (
    <>
      <PageHero
        eyebrow="About"
        title={["A general contractor", "that pours and frames."]}
        lead="JM Kelley Inc. is a Newport Beach builder. We run projects as a general contractor and do our own structural concrete and framing, so the foundation of every home we build is ours."
      />

      <section aria-labelledby="story-title" className="section-y pt-0">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Eyebrow>Our story</Eyebrow>
              <Heading id="story-title" size="h2" className="mt-5">
                How we got here.
              </Heading>
            </div>
            <div className="lg:col-span-8">
              <Todo block>
                company story: founding, years in business (current site says 15, 30+ and 35), how
                the concrete and framing crews came to be
              </Todo>
            </div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="principles-title" className="theme-stone section-y">
        <Container>
          <Eyebrow>How we work</Eyebrow>
          <h2 id="principles-title" className="mt-5 font-display text-h2">
            What stays the same on every job.
          </h2>
          <ul className="mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {principles.map((p, i) => (
              <FadeUp as="li" key={p.title} delay={i * 70} className="border-t border-rule pt-5">
                <h3 className="font-display text-h4">{p.title}</h3>
                <p className="mt-3 text-fg-muted">{p.body}</p>
              </FadeUp>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="founder-title" className="section-y">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Eyebrow>Founder</Eyebrow>
              <Heading id="founder-title" size="h2" className="mt-5">
                {founder?.name ?? "The founder"}
              </Heading>
              {founder?.bio ? (
                <p className="mt-6 text-lead text-fg-muted">{founder.bio}</p>
              ) : (
                <Todo block className="mt-6">
                  founder name, photo and bio
                </Todo>
              )}
            </div>
            <div className="lg:col-span-7">
              <div className="flex aspect-video items-center justify-center border border-dashed border-rule p-8 text-center">
                <Todo>founder video (Mux or Vimeo)</Todo>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="crew-title" className="section-y pt-0">
        <Container>
          <Eyebrow>The crew</Eyebrow>
          <Heading id="crew-title" size="h2" className="mt-5">
            The people on site.
          </Heading>
          {crew.length ? (
            <ul className="mt-12 grid grid-cols-2 gap-[var(--grid-gap)] md:grid-cols-3 lg:grid-cols-4">
              {crew.map((m) => (
                <li key={m.id}>
                  <div className="relative aspect-[4/5] overflow-hidden bg-sand">
                    {m.photo && (
                      <Image
                        src={m.photo.src}
                        alt={m.photo.alt}
                        fill
                        sizes="25vw"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <p className="mt-4 font-display text-h4">{m.name}</p>
                  <p className="text-small text-fg-muted">{m.role}</p>
                </li>
              ))}
            </ul>
          ) : (
            <Todo block className="mt-10">
              crew names, roles and photos (added in Sanity → Team)
            </Todo>
          )}
        </Container>
      </section>

      <section aria-labelledby="license-title" className="theme-dark section-y-sm">
        <Container>
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-5">
              <Eyebrow>Licensed</Eyebrow>
              <h2 id="license-title" className="mt-5 font-display text-h2">
                License & insurance
              </h2>
            </div>
            <dl className="grid gap-8 sm:grid-cols-2 md:col-span-7">
              <div className="border-t border-rule pt-5">
                <dt className="eyebrow text-fg-muted">California CSLB license</dt>
                <dd className="mt-3 font-display text-h3 text-fg-strong">
                  #{settings.license.number}
                </dd>
                <dd className="mt-3 text-small">
                  <a
                    className="link-underline"
                    href="https://www.cslb.ca.gov/OnlineServices/CheckLicenseII/CheckLicense.aspx"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Verify with the CSLB
                  </a>
                  {!settings.license.verified && (
                    <>
                      {" "}
                      <Todo>verify license #</Todo>
                    </>
                  )}
                </dd>
              </div>
              <div className="border-t border-rule pt-5">
                <dt className="eyebrow text-fg-muted">Insurance & bonding</dt>
                <dd className="mt-3">
                  {settings.insuranceStatement ?? <Todo>insurance/bonding statement</Todo>}
                </dd>
              </div>
            </dl>
          </div>
        </Container>
      </section>

      <section aria-labelledby="partners-title" className="section-y-sm">
        <Container>
          <Eyebrow>Partners</Eyebrow>
          <h2 id="partners-title" className="mt-5 font-display text-h3">
            Architects and partners we build with
          </h2>
          <Todo block className="mt-8">
            architects and partners (names, and permission to list them)
          </Todo>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
