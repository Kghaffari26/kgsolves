"use client";

import { useRef, type ElementType } from "react";
import { useReveal } from "@/lib/motion/useReveal";

/**
 * Line-by-line mask reveal. Pass lines explicitly (array) for exact control over breaks;
 * a plain string is treated as one line per "\n". Screen readers read the sr-only copy once.
 */
export function RevealText({
  as,
  children,
  className,
}: {
  as?: ElementType;
  children: string | string[];
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const Tag = (as ?? "p") as ElementType;
  const lines = Array.isArray(children) ? children : children.split("\n");
  return (
    <Tag ref={ref} className={className}>
      <span className="sr-only">{lines.join(" ")}</span>
      {lines.map((line, i) => (
        <span
          key={i}
          className="reveal-line"
          aria-hidden
          style={{ "--line": i } as React.CSSProperties}
        >
          <span>{line}</span>
        </span>
      ))}
    </Tag>
  );
}
