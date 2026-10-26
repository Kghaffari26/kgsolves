"use client";

import { useEffect, useRef, useState } from "react";
import { HouseDrawing } from "./HouseDrawing";
import { EASE, loadGsap } from "@/lib/motion/gsap";
import { afterIdle, whenNear } from "@/lib/motion/whenNear";
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

    // Built lazily: once the page is idle and this section is within a screen of view, so the
    // measuring (paths, pins) never lands in one long task during load.
    let stopNear: (() => void) | undefined;
    const stopIdle = afterIdle(() => {
      stopNear = whenNear(el, () => {
        void loadGsap().then(({ gsap, ScrollTrigger }) => {
          if (cancelled) return;
          const ctx = gsap.context(() => {
            const layers = [1, 2, 3].map((n) =>
              el.querySelectorAll<SVGPathElement>(`[data-layer="${n}"] path`),
            );
            layers.forEach((paths) => gsap.set(paths, { drawSVG: "0%" }));
            const photo = el.querySelector("[data-finished]");
            const photoImg = photo?.querySelector("img");
            const drawing = el.querySelector("[data-drawing]");
            const bar = el.querySelector("[data-progress]");
            const counter = el.querySelector("[data-counter]");

            const tl = gsap.timeline({
              defaults: { ease: EASE.draw },
              scrollTrigger: {
                trigger: el,
                start: "top top",
                end: "+=220%",
                pin: true,
                scrub: 0.8,
                anticipatePin: 1,
                onUpdate: (self) => {
                  const i = Math.min(
                    stages.length - 1,
                    Math.floor(self.progress * stages.length * 0.999),
                  );
                  setActive(i);
                  if (counter) counter.textContent = String(i + 1).padStart(2, "0");
                },
              },
            });
            // Each stage owns a quarter of the scroll. Footings draw from the centre out, studs
            // go up left to right, the envelope wraps last, then the photograph is uncovered from
            // the ground up like a hoarding being taken down.
            tl.to(
              layers[0],
              { drawSVG: "100%", duration: 1, stagger: { each: 0.025, from: "center" } },
              0,
            )
              .to(layers[1], { drawSVG: "100%", duration: 1, stagger: 0.008 }, 1)
              .to(layers[2], { drawSVG: "100%", duration: 1, stagger: 0.03 }, 2)
              .fromTo(
                photo,
                { clipPath: "inset(100% 0% 0% 0%)" },
                { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: EASE.inOut },
                3,
              )
              .fromTo(photoImg ?? {}, { scale: 1.15 }, { scale: 1, duration: 1, ease: EASE.out }, 3)
              .to(drawing, { opacity: 0.15, duration: 0.6 }, 3.2);
            if (bar) {
              gsap.fromTo(
                bar,
                { scaleX: 0 },
                {
                  scaleX: 1,
                  ease: "none",
                  scrollTrigger: { trigger: el, start: "top top", end: "+=220%", scrub: true },
                },
              );
            }
            ScrollTrigger.refresh();
          }, el);
          cleanup = () => ctx.revert();
        });
      });
    });

    return () => {
      cancelled = true;
      stopIdle();
      stopNear?.();
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
                  "border-l pl-5 transition-[border-color] duration-500",
                  i === active ? "border-accent" : "border-rule",
                )}
              >
                <p
                  className={cn(
                    "eyebrow transition-colors duration-500",
                    i === active ? "text-accent-text" : "text-fg-muted",
                  )}
                >
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
          <div
            data-finished
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: "inset(100% 0% 0% 0%)" }}
          >
            {finished}
          </div>
          <p className="eyebrow absolute -bottom-12 left-0 text-fg-muted tabular-nums">
            <span data-counter>01</span> / {String(stages.length).padStart(2, "0")}
          </p>
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
