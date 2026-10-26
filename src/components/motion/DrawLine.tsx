"use client";

import { useEffect, useRef } from "react";

/** Horizontal hairline that draws left-to-right as it scrolls through the viewport. */
export function DrawLine({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const b = bar.current;
    if (!el || !b) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      b.style.transform = "scaleX(1)";
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (vh * 0.5)));
      b.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden className={className}>
      <div className="h-px w-full bg-rule" />
      <div
        ref={bar}
        className="-mt-px h-px w-full origin-left bg-accent"
        style={{ transform: "scaleX(1)" }}
      />
    </div>
  );
}
