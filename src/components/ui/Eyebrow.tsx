import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

/** Tiny letter-spaced label. The only place all caps is allowed. */
export function Eyebrow({ className, children, ...rest }: ComponentPropsWithoutRef<"p">) {
  return (
    <p className={cn("eyebrow flex items-center gap-3 text-fg-muted", className)} {...rest}>
      <span aria-hidden className="h-px w-8 bg-accent" />
      {children}
    </p>
  );
}
