"use client";

import { useRef, type ElementType, type ComponentPropsWithoutRef } from "react";
import { useReveal } from "@/lib/motion/useReveal";
import { cn } from "@/lib/utils";

type Props<T extends ElementType> = { as?: T; delay?: number } & ComponentPropsWithoutRef<T>;

/** Fades and lifts its content in when it enters the viewport. */
export function FadeUp<T extends ElementType = "div">({
  as,
  delay = 0,
  className,
  style,
  ...rest
}: Props<T>) {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag
      ref={ref}
      className={cn("reveal-fade", className)}
      style={{ ...style, "--reveal-delay": `${delay}ms` } as React.CSSProperties}
      {...rest}
    />
  );
}
