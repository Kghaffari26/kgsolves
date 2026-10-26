"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { ImageAsset } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Image that drifts slower than the page inside a clipping frame. The image is scaled up by
 * `amount` so the drift never exposes the frame edge. Static under reduced motion.
 */
export function ParallaxImage({
  image,
  className,
  sizes = "100vw",
  priority,
  amount = 0.12,
}: {
  image: ImageAsset;
  className?: string;
  sizes?: string;
  priority?: boolean;
  amount?: number;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const inner = innerRef.current;
    if (!frame || !inner || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let visible = false;
    const update = () => {
      raf = 0;
      const r = frame.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2); // -1..1
      inner.style.transform = `translate3d(0, ${(-p * amount * 50).toFixed(2)}%, 0) scale(${1 + amount})`;
    };
    const onScroll = () => {
      if (visible && !raf) raf = requestAnimationFrame(update);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) onScroll();
    });
    io.observe(frame);
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [amount]);

  return (
    <div ref={frameRef} data-curtain className={cn("relative overflow-hidden", className)}>
      <div ref={innerRef} className="absolute inset-0 will-change-transform">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          placeholder={image.lqip ? "blur" : "empty"}
          blurDataURL={image.lqip}
        />
      </div>
    </div>
  );
}
