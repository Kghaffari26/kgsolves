"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ImageAsset } from "@/lib/types";

/**
 * Masonry gallery (CSS columns) with a keyboard-navigable lightbox:
 * Enter/Space opens, ←/→ step, Esc closes, Tab is trapped inside, focus returns to the
 * thumbnail that opened it.
 */
export function Gallery({ images, title }: { images: ImageAsset[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  const dialog = useRef<HTMLDivElement>(null);
  const lastOpened = useRef<number>(0);

  const close = useCallback(() => {
    setOpen(null);
    triggers.current[lastOpened.current]?.focus();
  }, []);
  const step = useCallback(
    (d: number) => setOpen((i) => (i === null ? i : (i + d + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (open === null) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    dialog.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "Tab") {
        const items = Array.from(dialog.current?.querySelectorAll<HTMLElement>("button") ?? []);
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prev;
    };
  }, [open, close, step]);

  const current = open === null ? null : images[open];

  return (
    <>
      <ul className="columns-1 gap-[var(--grid-gap)] sm:columns-2 lg:columns-3">
        {images.map((img, i) => (
          <li key={img.src + i} className="mb-[var(--grid-gap)] break-inside-avoid">
            <button
              ref={(el) => {
                triggers.current[i] = el;
              }}
              type="button"
              data-cursor="View"
              onClick={() => {
                lastOpened.current = i;
                setOpen(i);
              }}
              data-curtain
              className="group block w-full overflow-hidden bg-sand"
              aria-label={`Open image ${i + 1} of ${images.length}: ${img.alt}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={img.width}
                height={img.height}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="h-auto w-full transition-transform duration-[1.1s] ease-[var(--ease-out)] group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
              />
            </button>
          </li>
        ))}
      </ul>

      {current && open !== null && (
        <div
          ref={dialog}
          role="dialog"
          aria-modal="true"
          aria-label={`${title} gallery, image ${open + 1} of ${images.length}`}
          className="theme-dark fixed inset-0 z-[80] flex flex-col bg-ink/97"
          data-lenis-prevent
        >
          <div className="container-site flex h-[var(--header-h)] shrink-0 items-center justify-between">
            <p className="text-small text-fg-muted tabular-nums" aria-live="polite">
              {open + 1} / {images.length}
            </p>
            <button
              type="button"
              data-autofocus
              onClick={close}
              className="inline-flex min-h-11 items-center gap-3 text-fg-strong"
            >
              Close
              <svg
                aria-hidden
                viewBox="0 0 16 16"
                className="size-4"
                stroke="currentColor"
                fill="none"
              >
                <path d="M2 2l12 12M14 2L2 14" />
              </svg>
            </button>
          </div>
          <div className="relative flex-1" onClick={(e) => e.target === e.currentTarget && close()}>
            <Image
              key={current.src}
              src={current.src}
              alt={current.alt}
              fill
              sizes="100vw"
              className="object-contain p-4 md:p-10"
            />
          </div>
          <div className="container-site flex h-20 shrink-0 items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => step(-1)}
              className="inline-flex size-12 items-center justify-center rounded-full border border-rule text-fg-strong hover:border-fg-strong"
              aria-label="Previous image"
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
            <p className="line-clamp-2 text-center text-small text-fg-muted">{current.alt}</p>
            <button
              type="button"
              onClick={() => step(1)}
              className="inline-flex size-12 items-center justify-center rounded-full border border-rule text-fg-strong hover:border-fg-strong"
              aria-label="Next image"
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
          </div>
        </div>
      )}
    </>
  );
}
