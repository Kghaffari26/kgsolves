"use client";

import { useEffect, useRef, useState } from "react";
import { prefersLowData } from "@/lib/motion/useReducedMotion";

/**
 * Muted preview loop that plays while the parent `.group` is hovered or focused.
 * Loads nothing until the first hover (preload="none"), and never on touch, Save-Data or
 * reduced motion.
 */
export function HoverVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const v = ref.current;
    const group = v?.closest(".group");
    if (!v || !group) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced || prefersLowData()) return;
    const play = () => {
      setArmed(true);
      v.play().catch(() => {});
    };
    const stop = () => v.pause();
    group.addEventListener("pointerenter", play);
    group.addEventListener("pointerleave", stop);
    group.addEventListener("focusin", play);
    group.addEventListener("focusout", stop);
    return () => {
      group.removeEventListener("pointerenter", play);
      group.removeEventListener("pointerleave", stop);
      group.removeEventListener("focusin", play);
      group.removeEventListener("focusout", stop);
    };
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden
      tabIndex={-1}
      className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ${armed ? "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100" : "opacity-0"}`}
    />
  );
}
