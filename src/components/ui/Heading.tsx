import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

const sizes = {
  display: "text-display",
  h1: "text-h1",
  h2: "text-h2",
  h3: "text-h3",
  h4: "text-h4",
} as const;

type Props = ComponentPropsWithoutRef<"h2"> & {
  as?: "h1" | "h2" | "h3" | "h4" | "p";
  size?: keyof typeof sizes;
  /** line-mask reveal on scroll (MotionDirector); on by default */
  split?: boolean;
};

export function Heading({ as: Tag = "h2", size, split = true, className, ...rest }: Props) {
  const resolved = size ?? (Tag === "p" ? "h2" : Tag);
  return (
    <Tag
      data-split={split || undefined}
      className={cn("font-display text-fg-strong", sizes[resolved], className)}
      {...rest}
    />
  );
}
