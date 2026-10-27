import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

type Props = ComponentPropsWithoutRef<"span"> & { active?: boolean };

/** Small rounded label. Use <button> + Tag styling for interactive chips (see Chip). */
export function Tag({ active, className, ...rest }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-3 py-1 text-small leading-none",
        active ? "border-fg-strong bg-fg-strong text-bg" : "border-rule text-fg",
        className,
      )}
      {...rest}
    />
  );
}

export function Chip({
  active,
  className,
  ...rest
}: ComponentPropsWithoutRef<"button"> & { active?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "inline-flex min-h-11 items-center border px-4 text-small transition-colors duration-200",
        active
          ? "border-fg-strong bg-fg-strong text-bg"
          : "border-rule text-fg hover:border-fg-strong",
        className,
      )}
      {...rest}
    />
  );
}
