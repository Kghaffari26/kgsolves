import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

/** Tiny letter-spaced label. The only place all caps is allowed. */
export function Eyebrow({ className, children, ...rest }: ComponentPropsWithoutRef<"p">) {
  return (
    <p className={cn("eyebrow text-accent-text", className)} {...rest}>
      {children}
    </p>
  );
}
