"use client";

import { useLayoutEffect, useRef } from "react";

// Client-only flag: flips after the first hydrated page so later navigations animate.
let hydrated = false;

/**
 * Short fade/slide on client-side navigation (350ms) using the Web Animations API, so no
 * animation library ships on every page. The first page load is not animated, so
 * server-rendered content (and LCP) paints immediately. Reduced motion gets a plain fade.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!hydrated) {
      hydrated = true;
      return;
    }
    const el = ref.current;
    if (!el?.animate) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const anim = el.animate(
      reduced
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [
            { opacity: 0, transform: "translate3d(0, 14px, 0)" },
            { opacity: 1, transform: "none" },
          ],
      { duration: reduced ? 200 : 350, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
    return () => anim.cancel();
  }, []);

  return <div ref={ref}>{children}</div>;
}
