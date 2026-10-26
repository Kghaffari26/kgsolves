import type { ElementType } from "react";

/**
 * Page-title intro: each line rises out of its own mask on first paint. Pure CSS (no JS, no
 * waiting on hydration), so titles at the top of a page never delay LCP. Pass one string per
 * line for exact breaks. Screen readers read the sr-only copy once. Static under reduced motion.
 * (Headings further down the page use the SplitText scroll reveal instead; see MotionDirector.)
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
  const Tag = (as ?? "p") as ElementType;
  const lines = Array.isArray(children) ? children : children.split("\n");
  return (
    <Tag className={className}>
      <span className="sr-only">{lines.join(" ")}</span>
      {lines.map((line, i) => (
        <span
          key={i}
          className="intro-line"
          aria-hidden
          style={{ "--line": i } as React.CSSProperties}
        >
          <span>{line}</span>
        </span>
      ))}
    </Tag>
  );
}
