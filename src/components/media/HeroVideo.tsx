"use client";

import { useEffect, useRef, useState } from "react";
import { prefersLowData } from "@/lib/motion/useReducedMotion";

/**
 * Background loop for the hero. The poster (a next/image rendered by the server) is the LCP
 * element; the <video> is only created after the page has loaded and the browser is idle.
 * Never loads under reduced motion or Save-Data. Pauses when scrolled offscreen.
 * Includes a pause control (WCAG 2.2.2 for moving content longer than 5 seconds).
 */
export function HeroVideo({ mp4, webm }: { mp4: string; webm?: string }) {
  const [enabled, setEnabled] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || prefersLowData()) return;
    let idle = 0;
    const start = () => {
      const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
      idle = ric(() => setEnabled(true)) as number;
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.removeEventListener("load", start);
      (window.cancelIdleCallback ?? window.clearTimeout)(idle);
    };
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!enabled || !v) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !userPaused) v.play().catch(() => {});
      else v.pause();
    });
    io.observe(v);
    return () => io.disconnect();
  }, [enabled, userPaused]);

  if (!enabled) return null;
  return (
    <>
      <video
        ref={ref}
        className="absolute inset-0 size-full object-cover transition-opacity duration-1000"
        style={{ opacity: playing ? 1 : 0 }}
        muted
        loop
        playsInline
        autoPlay
        preload="auto"
        aria-hidden
        tabIndex={-1}
        onPlaying={() => setPlaying(true)}
      >
        {webm && <source src={webm} type="video/webm" />}
        <source src={mp4} type="video/mp4" />
      </video>
      <button
        type="button"
        onClick={() => {
          const v = ref.current;
          if (!v) return;
          if (v.paused) {
            setUserPaused(false);
            v.play().catch(() => {});
          } else {
            setUserPaused(true);
            v.pause();
          }
        }}
        className="absolute right-[var(--gutter)] bottom-8 z-20 inline-flex min-h-11 items-center gap-2 border border-paper/30 px-4 text-small text-paper/90 backdrop-blur-sm transition-colors hover:border-paper"
        aria-label={userPaused ? "Play background video" : "Pause background video"}
      >
        <svg aria-hidden viewBox="0 0 12 12" className="size-3" fill="currentColor">
          {userPaused ? <path d="M2 1l9 5-9 5z" /> : <path d="M2 1h3v10H2zM7 1h3v10H7z" />}
        </svg>
        {userPaused ? "Play" : "Pause"}
      </button>
    </>
  );
}
