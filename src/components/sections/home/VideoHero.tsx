import Image from "next/image";
import { HeroVideo } from "@/components/media/HeroVideo";
import { Button } from "@/components/ui/Button";
import { Monogram } from "@/components/ui/Logo";
import type { ImageAsset } from "@/lib/types";

export function VideoHero({ poster }: { poster: ImageAsset }) {
  return (
    <section
      data-header-overlay
      aria-labelledby="hero-title"
      className="theme-dark relative isolate flex min-h-[100svh] items-end overflow-hidden"
    >
      <div className="absolute inset-0 -z-10">
        <Image
          src={poster.src}
          alt={poster.alt}
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="hero-kenburns object-cover"
        />
        <HeroVideo mp4="/video/hero-placeholder.mp4" webm="/video/hero-placeholder.webm" />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,27,45,0.6)_0%,rgba(15,27,45,0.35)_30%,rgba(15,27,45,0.5)_60%,rgba(15,27,45,0.92)_100%)]"
        />
        <div className="absolute top-[calc(var(--header-h)+1.5rem)] right-[var(--gutter)] flex flex-col items-end gap-4 text-paper/60">
          <Monogram className="size-12" />
          {/* Survey mark: Newport Beach, to the nearest minute. */}
          <p
            className="hero-in eyebrow hidden text-[0.6875rem] tabular-nums md:block"
            style={{ "--d": "600ms" } as React.CSSProperties}
          >
            33°37′ N · 117°56′ W
          </p>
        </div>
      </div>

      <div className="container-site pt-[calc(var(--header-h)+4rem)] pb-28 md:pb-32">
        <p
          className="hero-in eyebrow text-paper/80"
          style={{ "--d": "0ms" } as React.CSSProperties}
        >
          Newport Beach · Coastal Orange County
        </p>
        <h1
          id="hero-title"
          className="mt-6 max-w-[12ch] font-display text-display text-paper md:max-w-[14ch]"
        >
          <span className="hero-line">
            <span style={{ "--d": "80ms" } as React.CSSProperties}>Coastal homes,</span>
          </span>{" "}
          <span className="hero-line">
            <span style={{ "--d": "180ms" } as React.CSSProperties}>
              built from the foundation up.
            </span>
          </span>
        </h1>
        <p
          className="hero-in mt-8 max-w-xl text-lead text-paper/85"
          style={{ "--d": "320ms" } as React.CSSProperties}
        >
          We pour, frame, and build every project ourselves — Newport Beach and coastal Orange
          County.
        </p>
        <div
          className="hero-in mt-10 flex flex-wrap items-center gap-4"
          style={{ "--d": "420ms" } as React.CSSProperties}
        >
          <Button href="/contact" arrow>
            Start your project
          </Button>
          <Button href="/work" variant="ghost">
            See our work
          </Button>
        </div>
      </div>

      <a
        href="#positioning"
        className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 text-paper/80 md:flex"
        aria-label="Scroll to the next section"
      >
        <span className="eyebrow text-[0.6875rem]">Scroll</span>
        <span
          aria-hidden
          className="scroll-cue relative block h-12 w-px overflow-hidden bg-paper/25"
        />
      </a>
    </section>
  );
}
