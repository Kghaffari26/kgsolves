"use client";

import Image from "next/image";
import { useState } from "react";
import type { VideoEmbedSource } from "@/lib/types";

/**
 * Long-form video (Mux or Vimeo). Renders a lightweight facade and only loads the third-party
 * player when the visitor presses play, which keeps it out of Lighthouse and LCP.
 */
export function VideoEmbed({ video, poster }: { video: VideoEmbedSource; poster?: string }) {
  const [active, setActive] = useState(false);
  const src =
    video.provider === "vimeo"
      ? `https://player.vimeo.com/video/${encodeURIComponent(video.id)}?autoplay=1&dnt=1&title=0&byline=0&portrait=0`
      : `https://player.mux.com/${encodeURIComponent(video.id)}?autoplay=true`;
  const thumb =
    poster ??
    (video.provider === "mux"
      ? `https://image.mux.com/${video.id}/thumbnail.webp?width=1600`
      : undefined);

  return (
    <div className="relative aspect-video overflow-hidden bg-ink">
      {active ? (
        <iframe
          src={src}
          title={video.title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 size-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          className="group absolute inset-0 flex items-center justify-center"
          aria-label={`Play video: ${video.title}`}
        >
          {thumb && (
            <Image
              src={thumb}
              alt=""
              fill
              sizes="100vw"
              className="object-cover opacity-80"
              unoptimized
            />
          )}
          <span className="relative flex size-20 items-center justify-center bg-paper text-ink transition-transform duration-300 group-hover:scale-110">
            <svg aria-hidden viewBox="0 0 12 12" className="ml-1 size-5" fill="currentColor">
              <path d="M2 1l9 5-9 5z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
