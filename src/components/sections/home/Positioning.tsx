import { WordReveal } from "@/components/motion/WordReveal";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Stat } from "@/components/ui/Stat";
import { FadeUp } from "@/components/motion/FadeUp";
import type { Stat as StatType } from "@/lib/types";

export function Positioning({ stats }: { stats: StatType[] }) {
  return (
    <section
      id="positioning"
      aria-labelledby="positioning-label"
      className="section-y scroll-mt-16"
    >
      <Container>
        <Eyebrow id="positioning-label">General contractor · Concrete · Framing</Eyebrow>
        <WordReveal
          className="mt-8 max-w-[22ch] font-display text-h2 text-fg-strong md:text-[clamp(2.5rem,1.5rem+3.4vw,5rem)] md:leading-[1.05]"
          text="Most builders subcontract the structure. We pour the foundation and frame the house with our own crews, so everything that follows has something true to stand on."
        />
        <div className="mt-16 grid gap-8 md:mt-24 md:grid-cols-3">
          {stats.map((s, i) => (
            <FadeUp key={s.label} delay={i * 90}>
              <Stat stat={s} />
            </FadeUp>
          ))}
        </div>
      </Container>
    </section>
  );
}
