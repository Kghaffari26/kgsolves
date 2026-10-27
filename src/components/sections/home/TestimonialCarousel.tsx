"use client";

import { useState } from "react";
import type { Testimonial } from "@/lib/types";

export function TestimonialCarousel({ items }: { items: Testimonial[] }) {
  const [i, setI] = useState(0);
  const t = items[i];
  const go = (d: number) => setI((n) => (n + d + items.length) % items.length);
  return (
    <div
      className="mt-10"
      role="group"
      aria-roledescription="carousel"
      aria-label="Client testimonials"
    >
      <figure aria-live="polite" key={t.id} className="min-h-[16rem]">
        <blockquote className="max-w-[30ch] font-display text-h2 text-fg-strong">
          <p>&ldquo;{t.quote}&rdquo;</p>
        </blockquote>
        <figcaption className="mt-8 text-fg-muted">
          <span className="text-fg-strong">{t.name}</span>
          {t.context && <span> · {t.context}</span>}
        </figcaption>
      </figure>
      {items.length > 1 && (
        <div className="mt-10 flex items-center gap-4">
          <button
            type="button"
            onClick={() => go(-1)}
            className="inline-flex size-12 items-center justify-center border border-rule hover:border-fg-strong"
            aria-label="Previous testimonial"
          >
            <svg
              aria-hidden
              viewBox="0 0 16 16"
              className="size-4 rotate-180"
              fill="none"
              stroke="currentColor"
            >
              <path d="M1 8h13M9 3l5 5-5 5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="inline-flex size-12 items-center justify-center border border-rule hover:border-fg-strong"
            aria-label="Next testimonial"
          >
            <svg
              aria-hidden
              viewBox="0 0 16 16"
              className="size-4"
              fill="none"
              stroke="currentColor"
            >
              <path d="M1 8h13M9 3l5 5-5 5" />
            </svg>
          </button>
          <p className="text-small text-fg-muted tabular-nums">
            {i + 1} / {items.length}
          </p>
        </div>
      )}
    </div>
  );
}
