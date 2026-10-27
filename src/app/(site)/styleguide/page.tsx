import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { Button } from "@/components/ui/Button";
import { Tag, Chip } from "@/components/ui/Tag";
import { Stat } from "@/components/ui/Stat";
import { Divider } from "@/components/ui/Divider";
import { Logo, Monogram } from "@/components/ui/Logo";
import { Todo } from "@/components/ui/Todo";

export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

const colors = [
  ["--ink", "#171917", "Near-black: headings, dark sections."],
  ["--limestone", "#ECE8E0", "Stone ground for alternate sections."],
  ["--sand", "#D6D0C5", "Image backdrops, secondary neutral."],
  ["--timber", "#756452", "The single accent (muted taupe). Use sparingly."],
  ["--timber-deep", "#756452", "Accent for text on light grounds (AA)."],
  ["--timber-light", "#B9A894", "Accent for text on near-black (AA)."],
  ["--paper", "#FAF9F6", "Page background."],
  ["--charcoal", "#252724", "Body text."],
  ["--line", "#E4DFD6", "Rules and borders."],
];

const type = [
  ["display", "text-display", "Coastal homes"],
  ["h1", "text-h1", "Built from the foundation up"],
  ["h2", "text-h2", "We pour, frame and build"],
  ["h3", "text-h3", "Structural concrete"],
  ["h4", "text-h4", "Weekly owner meetings"],
] as const;

function Primitives() {
  return (
    <div className="mt-10 flex flex-wrap items-center gap-6">
      <Button href="/contact" arrow>
        Start a project
      </Button>
      <Button href="/work" variant="ghost">
        See our work
      </Button>
      <Button href="/process" variant="text" arrow>
        How we work
      </Button>
      <Tag>New home</Tag>
      <Tag active>Active tag</Tag>
      <Chip>Chip</Chip>
      <Chip active>Chip (pressed)</Chip>
    </div>
  );
}

export default function StyleguidePage() {
  return (
    <>
      <Section spacing="small" className="pt-[calc(var(--header-h)+4rem)]">
        <Container>
          <Eyebrow>Design system · Raw to refined</Eyebrow>
          <Heading as="h1" className="mt-6">
            Styleguide
          </Heading>
          <p className="mt-6 max-w-2xl text-lead text-fg-muted">
            Every token and primitive in one place. This page is not indexed.
          </p>
        </Container>
      </Section>

      <Section spacing="small">
        <Container>
          <Heading size="h3">Colour</Heading>
          <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {colors.map(([name, value, use]) => (
              <li key={name} className="border border-rule">
                <div className="h-24" style={{ background: `var(${name})` }} />
                <div className="p-3 text-small">
                  <p className="font-medium text-fg-strong">{name}</p>
                  <p className="text-fg-muted">{value}</p>
                  <p className="mt-1 text-fg-muted">{use}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section spacing="small">
        <Container>
          <Heading size="h3">Type</Heading>
          <p className="mt-3 text-fg-muted">
            Instrument Serif (display) and DM Sans (body/UI). Fluid clamp() sizes. Square corners
            throughout.
          </p>
          <div className="mt-10 space-y-8">
            {type.map(([name, cls, sample]) => (
              <div
                key={name}
                className="grid gap-2 border-t border-rule pt-4 md:grid-cols-[8rem_1fr]"
              >
                <p className="eyebrow text-fg-muted">{name}</p>
                <p className={`font-display text-fg-strong ${cls}`}>{sample}</p>
              </div>
            ))}
            <div className="grid gap-2 border-t border-rule pt-4 md:grid-cols-[8rem_1fr]">
              <p className="eyebrow text-fg-muted">lead</p>
              <p className="text-lead">We pour, frame, and build every project ourselves.</p>
            </div>
            <div className="grid gap-2 border-t border-rule pt-4 md:grid-cols-[8rem_1fr]">
              <p className="eyebrow text-fg-muted">body</p>
              <p className="max-w-2xl">
                Body copy sits at 17px with a 1.65 line height and a comfortable measure of about 70
                characters.
              </p>
            </div>
            <div className="grid gap-2 border-t border-rule pt-4 md:grid-cols-[8rem_1fr]">
              <p className="eyebrow text-fg-muted">eyebrow</p>
              <Eyebrow>Tiny labels only</Eyebrow>
            </div>
          </div>
        </Container>
      </Section>

      <Section spacing="small">
        <Container>
          <Heading size="h3">Primitives</Heading>
          <Primitives />
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <Stat stat={{ label: "Verified example", value: "48 hr", verified: true }} />
            <Stat stat={{ label: "Years in business", value: null, verified: false }} />
            <div className="border-t border-rule pt-5">
              <Todo>example placeholder marker</Todo>
            </div>
          </div>
          <div className="mt-12 space-y-8">
            <Divider />
            <Divider variant="blueprint" label="Blueprint divider" />
            <Divider variant="blueprint" />
          </div>
        </Container>
      </Section>

      <Section tone="dark" spacing="small">
        <Container>
          <Heading size="h3">Dark section</Heading>
          <p className="mt-3 max-w-xl text-fg-muted">
            Sections re-map the semantic tokens, so every primitive adapts.
          </p>
          <Primitives />
          <div className="mt-12 flex items-center gap-10">
            <Logo className="h-10 text-fg-strong" />
            <Monogram className="size-16 text-fg-strong" title="JMK monogram" />
          </div>
          <Divider variant="blueprint" label="12'-0&quot;" className="mt-12" />
        </Container>
      </Section>

      <Section tone="stone" spacing="small">
        <Container>
          <Heading size="h3">Stone section · grid</Heading>
          <div className="grid-editorial mt-8">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="h-16 bg-sand/60 text-center text-small leading-[4rem]">
                {i + 1}
              </div>
            ))}
          </div>
          <div className="mt-12 flex items-center gap-10 text-ink">
            <Logo className="h-10" />
            <Monogram className="size-16" title="JMK monogram" />
          </div>
        </Container>
      </Section>
    </>
  );
}
