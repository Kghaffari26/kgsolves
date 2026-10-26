import { cn } from "@/lib/utils";

/**
 * Placeholder wordmark. TODO(client): vector logo files (the current logo reads
 * "JM Kelley Builders Inc"; we use "JM Kelley Inc." per the brief).
 * Inline SVG text inherits the page's display font; textLength pins the width so the
 * mark never reflows while fonts load.
 */
export function Logo({
  className,
  title = "JM Kelley Inc.",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 220 40"
      role="img"
      aria-label={title}
      className={cn("h-8 w-auto fill-current", className)}
    >
      <text
        x="0"
        y="29"
        textLength="166"
        lengthAdjust="spacingAndGlyphs"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 32,
          fontWeight: 400,
          letterSpacing: "-0.01em",
        }}
      >
        JM Kelley
      </text>
      <rect x="174" y="9" width="1" height="22" opacity="0.4" />
      <text
        x="183"
        y="26"
        textLength="34"
        lengthAdjust="spacingAndGlyphs"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: "0.2em",
        }}
      >
        INC.
      </text>
    </svg>
  );
}

/** "JMK" monogram for the favicon, OG images and the video watermark. */
export function Monogram({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={cn("size-10", className)}
    >
      <rect
        x="1.5"
        y="1.5"
        width="61"
        height="61"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <text
        x="32"
        y="41"
        textAnchor="middle"
        textLength="44"
        lengthAdjust="spacingAndGlyphs"
        fill="currentColor"
        style={{ fontFamily: "var(--font-display)", fontSize: 26 }}
      >
        JMK
      </text>
    </svg>
  );
}
