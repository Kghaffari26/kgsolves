"use client";

import { useEffect, useRef, useState } from "react";
import { HouseDrawing } from "./HouseDrawing";
import { loadGsap } from "@/lib/motion/gsap";
import { cn } from "@/lib/utils";

type Stage = { key: string; label: string; body: string };

/**
 * Pinned scroll story (~300vh of scroll). Layers draw in with strokeDashoffset, then the
 * finished photo cross-fades over the line drawing.
 */
export function FoundationUpScroller({
  intro,
  stages,
  finished,
}: {
  intro: React.ReactNode;
  stages: Stage[];
  finished: React.ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;
      const ctx = gsap.context(() => {
        const layers = [1, 2, 3].map((n) =>
          el.querySelectorAll<SVGPathElement>(`[data-layer="${n}"] path`),
        );
        layers.forEach((paths) => gsap.set(paths, { strokeDasharray: 1, strokeDashoffset: 1 }));
        const photo = el.querySelector("[data-finished]");
        const drawing = el.querySelector("[data-drawing]");
        const bar = el.querySelector("[data-progress]");

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "+=200%",
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
            onUpdate: (self) => {
              setActive(
                Math.min(stages.length - 1, Math.floor(self.progress * stages.length * 0.999)),
              );
            },
          },
        });
        // Each stage owns a quarter of the scroll.
        tl.to(layers[0], { strokeDashoffset: 0, duration: 1, stagger: 0.03 }, 0)
          .to(layers[1], { strokeDashoffset: 0, duration: 1, stagger: 0.006 }, 1)
          .to(layers[2], { strokeDashoffset: 0, duration: 1, stagger: 0.02 }, 2)
          .to(photo, { opacity: 1, duration: 0.7 }, 3)
          .to(drawing, { opacity: 0.0, duration: 0.7 }, 3.1)
          .to({}, { duration: 0.3 }, 3.7);
        if (bar)
          gsap.fromTo(
            bar,
            { scaleX: 0 },
            {
              scaleX: 1,
              ease: "none",
              scrollTrigger: { trigger: el, start: "top top", end: "+=200%", scrub: true },
            },
          );
        ScrollTrigger.refresh();
      }, el);
      cleanup = () => ctx.revert();
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [stages.length]);

  return (
    <div ref={root} className="relative flex h-[100svh] min-h-[640px] items-center overflow-hidden">
      <div className="container-site grid w-full items-center gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          {intro}
          <ol className="mt-8 space-y-4 lg:mt-10" aria-label="Construction stages">
            {stages.map((s, i) => (
              <li
                key={s.key}
                aria-current={i === active ? "step" : undefined}
                className={cn(
                  "border-l pl-5 transition-[opacity,border-color] duration-500",
                  i === active ? "border-accent opacity-100" : "border-rule opacity-45",
                )}
              >
                <p className="eyebrow text-accent-text">
                  {String(i + 1).padStart(2, "0")} · {s.label}
                </p>
                <p
                  className={cn(
                    "mt-2 max-w-sm overflow-hidden text-fg transition-[max-height] duration-500",
                    i === active ? "max-h-40" : "max-h-0",
                  )}
                >
                  {s.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
        <div className="relative aspect-[5/3] w-full text-ink lg:col-span-8">
          <div data-drawing className="absolute inset-0">
            <HouseDrawing className="size-full" />
          </div>
          <div data-finished className="absolute inset-0 overflow-hidden opacity-0">
            {finished}
          </div>
          <div className="absolute -bottom-6 left-0 h-px w-full bg-rule">
            <div
              data-progress
              className="h-full origin-left bg-accent"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
