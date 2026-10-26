"use client";

import type Lenis from "lenis";

/** Module-level handle so GSAP code can sync with the active Lenis instance without a context. */
let instance: Lenis | null = null;
const listeners = new Set<(l: Lenis | null) => void>();

export function setLenis(l: Lenis | null) {
  instance = l;
  listeners.forEach((fn) => fn(l));
}

export function getLenis() {
  return instance;
}

export function onLenis(fn: (l: Lenis | null) => void) {
  listeners.add(fn);
  fn(instance);
  return () => {
    listeners.delete(fn);
  };
}
