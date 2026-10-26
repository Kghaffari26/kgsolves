"use client";

import { useState } from "react";
import { LazyMotion, domAnimation, m } from "motion/react";
import { useReducedMotion } from "@/lib/motion/useReducedMotion";

// Client-only flag: flips after the first hydrated page so later navigations animate.
let hydrated = false;

/**
 * Short fade/slide on client-side navigation (~350ms). The very first page load is not
 * animated so server-rendered content (and LCP) paints immediately.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const [animateIn] = useState(() => {
    if (typeof window === "undefined") return false;
    const was = hydrated;
    hydrated = true;
    return was;
  });
  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        initial={animateIn ? { opacity: 0, y: reduced ? 0 : 14 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}
