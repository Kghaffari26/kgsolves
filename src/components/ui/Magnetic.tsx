"use client";

import { useRef } from "react";
import { useFinePointer, useReducedMotion } from "@/lib/motion/useReducedMotion";

/** Pulls its child toward the cursor on desktop pointers. No-op on touch and reduced motion. */
export function Magnetic({
  children,
  strength = 0.25,
}: {
  children: React.ReactNode;
  strength?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const enabled = fine && !reduced;

  return (
    <span
      ref={ref}
      className="inline-block transition-transform duration-300 ease-[var(--ease-out)] will-change-transform"
      onPointerMove={
        enabled
          ? (e) => {
              const el = ref.current;
              if (!el) return;
              const r = el.getBoundingClientRect();
              const x = (e.clientX - (r.left + r.width / 2)) * strength;
              const y = (e.clientY - (r.top + r.height / 2)) * strength;
              el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            }
          : undefined
      }
      onPointerLeave={
        enabled
          ? () => {
              if (ref.current) ref.current.style.transform = "";
            }
          : undefined
      }
    >
      {children}
    </span>
  );
}
