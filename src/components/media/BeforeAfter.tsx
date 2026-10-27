"use client";

import Image from "next/image";
import { useState } from "react";
import type { ImageAsset } from "@/lib/types";

/**
 * Before/after comparison. The handle is a native range input, so it is keyboard-operable
 * (arrows, Home/End, PageUp/Down) and announced by screen readers with no extra ARIA work.
 * The input covers the whole image, so clicking or dragging anywhere moves the divider.
 */
export function BeforeAfter({
  before,
  after,
  label = "Framing to finished",
}: {
  before: ImageAsset;
  after: ImageAsset;
  label?: string;
}) {
  const [pos, setPos] = useState(50);
  return (
    <figure>
      <div data-curtain className="relative aspect-[3/2] overflow-hidden bg-sand select-none">
        <Image
          src={after.src}
          alt={after.alt}
          fill
          sizes="(min-width: 1024px) 80vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <Image
            src={before.src}
            alt={before.alt}
            fill
            sizes="(min-width: 1024px) 80vw, 100vw"
            className="object-cover"
          />
        </div>
        <span className="eyebrow absolute top-4 left-4 bg-ink/70 px-3 py-1.5 text-paper">
          Framing
        </span>
        <span className="eyebrow absolute top-4 right-4 bg-ink/70 px-3 py-1.5 text-paper">
          Finished
        </span>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 w-px bg-paper"
          style={{ left: `${pos}%` }}
        >
          <span className="absolute top-1/2 left-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-paper text-ink shadow-lg">
            <svg
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M9 6l-6 6 6 6M15 6l6 6-6 6" />
            </svg>
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={Math.round(pos)}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label={`${label}: drag to compare. Left shows framing, right shows the finished home.`}
          aria-valuetext={`${Math.round(pos)}% framing`}
          className="peer absolute inset-0 size-full cursor-ew-resize opacity-0"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden ring-2 ring-timber ring-inset peer-focus-visible:block"
        />
      </div>
      <figcaption className="mt-3 text-small text-fg-muted">{label}</figcaption>
    </figure>
  );
}
