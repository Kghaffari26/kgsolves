"use client";

import { useEffect, useRef, useState } from "react";
import { prefersLowData } from "@/lib/motion/useReducedMotion";
import type { VideoSource } from "@/lib/types";

/**
 * Muted background loop for non-hero placements. preload="none"; it only starts loading once
 * it scrolls into view, pauses when offscreen, and never plays under reduced motion or
 * Save-Data (the poster image underneath stays visible instead).
 */
export function LoopVideo({ source, className }: { source: VideoSource; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const ok = !window.matchMedia("(prefers-reduced-motion: reduce)").matches && !prefersLowData();
    if (!ok) return;
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setAllowed(true);
        v.play().catch(() => {});
      } else v.pause();
    });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      style={{ opacity: allowed ? 1 : 0, transition: "opacity 0.8s" }}
      muted
      loop
      playsInline
      preload="none"
      poster={source.poster}
      aria-hidden
      tabIndex={-1}
    >
      {source.webm && <source src={source.webm} type="video/webm" />}
      {source.mp4 && <source src={source.mp4} type="video/mp4" />}
    </video>
  );
}
