import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealText } from "@/components/motion/RevealText";

/** Standard top-of-page block for pages without a full-bleed hero. */
export function PageHero({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  /** one string per line */
  title: string[];
  lead?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="pt-[calc(var(--header-h)+var(--section-y-sm))] pb-[var(--section-y-sm)]">
      <Container>
        <Eyebrow>{eyebrow}</Eyebrow>
        <RevealText as="h1" className="mt-6 max-w-[18ch] font-display text-h1 text-fg-strong">
          {title}
        </RevealText>
        {lead && <div className="mt-8 max-w-2xl text-lead text-fg-muted">{lead}</div>}
        {children}
      </Container>
    </section>
  );
}
