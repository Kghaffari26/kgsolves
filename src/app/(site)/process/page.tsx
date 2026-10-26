import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Todo } from "@/components/ui/Todo";
import { PageHero } from "@/components/sections/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { FadeUp } from "@/components/motion/FadeUp";
import { DrawLine } from "@/components/motion/DrawLine";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Process",
  description:
    "How JM Kelley Inc. builds: Budget, Design, Permit, Build. What you do, what we do, and what to expect in Newport Beach's coastal zone.",
  path: "/process",
});

const phases = [
  {
    name: "Budget",
    summary: "Know what it will cost before design gets expensive.",
    you: [
      "Share your goals, the lot and any existing plans or surveys",
      "Tell us your target budget and timing",
    ],
    we: [
      "Feasibility review of the site and the idea",
      "Quantity take-offs and a working line-item budget",
      "Flag the big risks early: site, structure, permitting",
    ],
  },
  {
    name: "Design",
    summary: "Plans that are buildable, and buildable for the budget.",
    you: [
      "Work with your architect, or with us through design-build",
      "Make the key selections and decisions",
    ],
    we: [
      "Plan review for cost and constructability",
      "Consultant management: engineers and specialists",
      "Value engineering that protects the design intent",
      "Update the budget as the design develops",
    ],
  },
  {
    name: "Permit",
    summary: "Submittal, plan check and approvals.",
    you: [
      "Sign applications and owner forms",
      "Approve any design responses to plan-check comments",
    ],
    we: [
      "Help assemble the submittal package",
      "Track plan check and coordinate responses",
      "Bid and contract management for every trade",
      "Build the construction schedule",
    ],
  },
  {
    name: "Build",
    summary: "Our own concrete and framing crews, and one accountable team.",
    you: ["Attend the weekly meeting", "Review and approve change orders before work changes"],
    we: [
      "Pour the foundation and frame the structure with our own crews",
      "Manage every trade, the schedule and budget compliance",
      "Weekly meetings and full job documentation",
      "Walk the finished home with you",
    ],
  },
];

export default function ProcessPage() {
  return (
    <>
      <PageHero
        eyebrow="Process"
        title={["Budget. Design.", "Permit. Build."]}
        lead="Four phases, in that order, with the same team accountable from the first number to the final walkthrough."
      />

      <section aria-label="Process timeline" className="pb-[var(--section-y)]">
        <Container>
          <div className="relative">
            <DrawLine className="absolute top-0 left-0 w-full" />
            <ol>
              {phases.map((p, i) => (
                <FadeUp
                  as="li"
                  key={p.name}
                  className="grid gap-8 border-b border-rule py-14 lg:grid-cols-12"
                >
                  <div className="lg:col-span-4">
                    <p className="eyebrow text-accent-text tabular-nums">
                      Phase {String(i + 1).padStart(2, "0")}
                    </p>
                    <h2 className="mt-4 font-display text-h1">{p.name}</h2>
                    <p className="mt-4 max-w-xs text-lead text-fg-muted">{p.summary}</p>
                  </div>
                  <div className="lg:col-span-3">
                    <h3 className="eyebrow text-fg-muted">What you do</h3>
                    <ul className="mt-4 space-y-3">
                      {p.you.map((t) => (
                        <li key={t} className="flex gap-3">
                          <span aria-hidden className="mt-3 h-px w-3 shrink-0 bg-fg-muted" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="lg:col-span-3">
                    <h3 className="eyebrow text-fg-muted">What we do</h3>
                    <ul className="mt-4 space-y-3">
                      {p.we.map((t) => (
                        <li key={t} className="flex gap-3">
                          <span aria-hidden className="mt-3 h-px w-3 shrink-0 bg-accent" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="lg:col-span-2">
                    <h3 className="eyebrow text-fg-muted">Typical duration</h3>
                    <p className="mt-4">
                      <Todo>{`${p.name} duration`}</Todo>
                    </p>
                  </div>
                </FadeUp>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      <section aria-labelledby="coastal-title" className="theme-dark section-y">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Eyebrow>A note on Newport Beach</Eyebrow>
              <h2 id="coastal-title" className="mt-5 font-display text-h2">
                Building in the coastal zone.
              </h2>
            </div>
            <div className="prose-site text-lead text-fg-muted lg:col-span-7">
              <p>
                Much of Newport Beach lies within the California coastal zone. Depending on the
                property and the scope, a project there may need a coastal development permit in
                addition to a building permit, and that review is part of the schedule.
              </p>
              <p>
                We plan for it during the Budget phase, not after design is finished, so the
                timeline you hear at the start is one that already accounts for it. Requirements are
                specific to each address, so we confirm them with the city for every project.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <CtaBand
        title="Start with the budget."
        body="The first phase is a conversation and a number. Tell us about the project."
      />
    </>
  );
}
