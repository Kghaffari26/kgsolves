"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useFinePointer, useReducedMotion } from "@/lib/motion/useReducedMotion";
import type { ImageAsset } from "@/lib/types";

/**
 * Hovering a row ([data-reveal-index]) shows that row's image, following the cursor.
 * Desktop fine pointers only; the images are decorative (alt="") because each row's link
 * text already says where it goes.
 */
export function CursorImageReveal({
  images,
  className,
  children,
}: {
  images: ImageAsset[];
  className?: string;
  children: React.ReactNode;
}) {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const float = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState<number | null>(null);
  const enabled = fine;

  useEffect(() => {
    if (!enabled) return;
    const el = wrap.current;
    const f = float.current;
    if (!el || !f) return;
    let x = 0,
      y = 0,
      cx = 0,
      cy = 0,
      raf = 0;
    const loop = () => {
      cx += (x - cx) * (reduced ? 1 : 0.14);
      cy += (y - cy) * (reduced ? 1 : 0.14);
      f.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
      raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.2 ? requestAnimationFrame(loop) : 0;
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      x = e.clientX - r.left;
      y = e.clientY - r.top;
      const row = (e.target as Element).closest<HTMLElement>("[data-reveal-index]");
      setIndex(row ? Number(row.dataset.revealIndex) : null);
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onLeave = () => setIndex(null);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled, reduced]);

  return (
    <div ref={wrap} className={`relative ${className ?? ""}`}>
      {children}
      {enabled && (
        <div
          ref={float}
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 z-10 hidden h-[17rem] w-[13rem] overflow-hidden lg:block"
        >
          {images.map((img, i) => (
            <div
              key={img.src + i}
              className="absolute inset-0 transition-[opacity,transform] duration-500 ease-[var(--ease-out)]"
              style={{
                opacity: index === i ? 1 : 0,
                transform: index === i ? "scale(1)" : "scale(1.08)",
              }}
            >
              <Image src={img.src} alt="" fill sizes="208px" className="object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
