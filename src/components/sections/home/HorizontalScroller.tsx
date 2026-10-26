"use client";

import { useEffect, useRef } from "react";
import { loadGsap } from "@/lib/motion/gsap";

/**
 * Desktop with motion: the section pins and vertical scroll drives the track sideways.
 * Mobile, tablets and reduced motion: a native horizontal swipe list with scroll snap.
 * Keyboard focus on a card scrolls the page to the point where that card is in view.
 */
export function HorizontalScroller({
  header,
  children,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = root.current;
    const list = track.current;
    if (!el || !list) return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    loadGsap().then(({ gsap }) => {
      if (cancelled) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        list.style.overflowX = "visible";
        const distance = () => Math.max(0, list.scrollWidth - list.clientWidth);
        const tween = gsap.to(list, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        });
        const onFocus = (e: FocusEvent) => {
          const card = (e.target as HTMLElement).closest<HTMLElement>("[data-card]");
          const st = tween.scrollTrigger;
          if (!card || !st) return;
          const target = Math.min(
            1,
            card.offsetLeft / Math.max(1, list.scrollWidth - list.clientWidth),
          );
          window.scrollTo({ top: st.start + (st.end - st.start) * target });
        };
        list.addEventListener("focusin", onFocus);
        return () => {
          list.removeEventListener("focusin", onFocus);
          list.style.overflowX = "";
        };
      });
      cleanup = () => mm.revert();
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return (
    <div ref={root} className="section-y flex min-h-[100svh] flex-col justify-center lg:py-0">
      <div className="container-site">{header}</div>
      <ul
        ref={track}
        className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-[var(--grid-gap)] overflow-x-auto pr-[var(--gutter)] pb-4 pl-[max(var(--gutter),calc((100vw-var(--max-w))/2+var(--gutter)))] scroll-pl-[max(var(--gutter),calc((100vw-var(--max-w))/2+var(--gutter)))] will-change-transform lg:mt-16"
        aria-label="Featured projects"
      >
        {children}
        <li aria-hidden className="w-px shrink-0" />
      </ul>
    </div>
  );
}
