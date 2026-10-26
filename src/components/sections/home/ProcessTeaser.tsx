import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { Button } from "@/components/ui/Button";
import { DrawLine } from "@/components/motion/DrawLine";

const steps = [
  {
    title: "Budget",
    body: "A working budget from quantity take-offs, before design gets expensive.",
  },
  { title: "Design", body: "Plans reviewed for cost and constructability as they develop." },
  { title: "Permit", body: "Submittal, plan check and coastal review handled with you." },
  {
    title: "Build",
    body: "Our own concrete and framing crews, weekly meetings, full documentation.",
  },
];

export function ProcessTeaser() {
  return (
    <section aria-labelledby="process-title" className="section-y">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Process</Eyebrow>
            <Heading id="process-title" className="mt-5 max-w-[16ch]">
              Four phases, one accountable team.
            </Heading>
          </div>
          <Button href="/process" variant="text" arrow>
            How we work
          </Button>
        </div>
        <div className="relative mt-16 md:mt-24">
          <DrawLine className="absolute top-[0.4rem] left-0 hidden w-full md:block" />
          <ol className="grid gap-10 md:grid-cols-4 md:gap-[var(--grid-gap)]">
            {steps.map((s, i) => (
              <li
                key={s.title}
                className="relative border-l border-rule pl-5 md:border-0 md:pt-10 md:pl-0"
              >
                <span
                  aria-hidden
                  className="absolute top-0 left-0 hidden size-3.5 rounded-full border border-fg-strong bg-bg md:block"
                />
                <p className="eyebrow text-accent-text tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 font-display text-h3">{s.title}</h3>
                <p className="mt-3 max-w-xs text-fg-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
