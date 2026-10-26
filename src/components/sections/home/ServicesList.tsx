import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { CursorImageReveal } from "./CursorImageReveal";
import type { ImageAsset } from "@/lib/types";

export type ServiceGroup = { title: string; summary: string; href: string; image: ImageAsset };

export function ServicesList({ groups }: { groups: ServiceGroup[] }) {
  return (
    <section aria-labelledby="services-title" className="theme-dark section-y">
      <Container>
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Eyebrow>Services</Eyebrow>
            <Heading id="services-title" className="mt-5 max-w-[12ch]">
              One team, ground to roofline.
            </Heading>
          </div>
          <CursorImageReveal images={groups.map((g) => g.image)} className="lg:col-span-8">
            <ol className="border-t border-rule">
              {groups.map((g, i) => (
                <li key={g.href} data-reveal-index={i} className="border-b border-rule">
                  <Link
                    href={g.href}
                    className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-4 py-7 md:grid-cols-[3.5rem_1fr_auto] md:py-9"
                  >
                    <span className="eyebrow text-fg-muted tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <span className="block font-display text-h3 text-fg-strong transition-transform duration-500 ease-[var(--ease-out)] group-hover:translate-x-2 motion-reduce:group-hover:translate-x-0">
                        {g.title}
                      </span>
                      <span className="mt-2 block max-w-xl text-fg-muted">{g.summary}</span>
                    </span>
                    <svg
                      aria-hidden
                      viewBox="0 0 16 16"
                      className="size-5 text-fg-muted transition-[transform,color] duration-500 group-hover:-rotate-45 group-hover:text-accent"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.25"
                    >
                      <path d="M1 8h13M9 3l5 5-5 5" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ol>
          </CursorImageReveal>
        </div>
      </Container>
    </section>
  );
}
