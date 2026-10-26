"use client";

import { onLenis } from "./lenis";

type Gsap = typeof import("gsap").gsap;
type ST = typeof import("gsap/ScrollTrigger").ScrollTrigger;

let loading: Promise<{ gsap: Gsap; ScrollTrigger: ST }> | null = null;

/**
 * Loads GSAP + ScrollTrigger on demand (code-split; only components that need scroll
 * choreography call this) and keeps ScrollTrigger in sync with Lenis smooth scrolling.
 */
export function loadGsap() {
  loading ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([g, st]) => {
    const gsap = g.gsap;
    const ScrollTrigger = st.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);
    let off: (() => void) | undefined;
    onLenis((lenis) => {
      off?.();
      off = undefined;
      if (!lenis) return;
      const update = () => ScrollTrigger.update();
      lenis.on("scroll", update);
      off = () => lenis.off("scroll", update);
    });
    return { gsap, ScrollTrigger };
  });
  return loading;
}
