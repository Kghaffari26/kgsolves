"use client";

import { useEffect, type RefObject } from "react";

/**
 * Arms an element for a reveal only if it starts below the fold, then marks it "in" when it
 * scrolls into view. Content is fully visible in the server HTML, without JS, and with
 * reduced motion; nothing above the fold is ever hidden (protects LCP).
 * Styling lives in globals.css under [data-reveal].
 */
export function useReveal(
  ref: RefObject<HTMLElement | null>,
  { margin = "0px 0px -12% 0px" } = {},
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
    el.dataset.reveal = "armed";
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.reveal = "in";
          io.disconnect();
        }
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
}
