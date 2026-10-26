import Image from "next/image";
import Link from "next/link";
import type { ImageAsset } from "@/lib/types";

type Panel = {
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  image: ImageAsset;
};

export function AudienceSplit({ panels }: { panels: [Panel, Panel] }) {
  return (
    <section aria-label="Choose your path" className="grid md:grid-cols-2">
      {panels.map((p, i) => (
        <Link
          key={p.href}
          href={p.href}
          className="group theme-dark relative isolate flex min-h-[70svh] flex-col justify-end overflow-hidden p-[var(--gutter)] md:min-h-[88svh]"
        >
          <Image
            src={p.image.src}
            alt={p.image.alt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="-z-10 object-cover transition-transform duration-[1.4s] ease-[var(--ease-out)] group-hover:scale-105 motion-reduce:group-hover:scale-100"
          />
          <div
            aria-hidden
            className={`absolute inset-0 -z-10 ${i === 0 ? "bg-ink/55" : "bg-ink/70"} transition-colors duration-700 group-hover:bg-ink/45`}
          />
          <p className="eyebrow text-paper/80">{p.eyebrow}</p>
          <h2 className="mt-4 max-w-[12ch] font-display text-h1 text-paper">{p.title}</h2>
          <p className="mt-5 max-w-md text-lead text-paper/85">{p.body}</p>
          <span className="mt-8 inline-flex items-center gap-3 text-paper">
            <span className="link-underline pb-1 group-hover:bg-[length:100%_1px]">{p.cta}</span>
            <svg
              aria-hidden
              viewBox="0 0 16 16"
              className="size-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
            >
              <path d="M1 8h13M9 3l5 5-5 5" />
            </svg>
          </span>
        </Link>
      ))}
    </section>
  );
}
