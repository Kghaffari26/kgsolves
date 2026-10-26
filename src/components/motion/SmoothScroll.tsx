"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { setLenis, getLenis } from "@/lib/motion/lenis";
import { useReducedMotion } from "@/lib/motion/useReducedMotion";

/** Lenis smooth scrolling. Off entirely when the user prefers reduced motion. */
export function SmoothScroll() {
  const reduced = useReducedMotion();
  const pathname = usePathname();

  useEffect(() => {
    if (reduced) return;
    let lenis: import("lenis").default | null = null;
    let cancelled = false;
    // Loaded after hydration so it never competes with first paint.
    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      lenis = new Lenis({ autoRaf: true, anchors: true, lerp: 0.11 });
      setLenis(lenis);
    });
    return () => {
      cancelled = true;
      lenis?.destroy();
      setLenis(null);
    };
  }, [reduced]);

  useEffect(() => {
    if (!window.location.hash) getLenis()?.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

  return null;
}
