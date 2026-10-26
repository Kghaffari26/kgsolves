import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

type Props = ComponentPropsWithoutRef<"section"> & {
  tone?: "paper" | "stone" | "dark";
  spacing?: "default" | "small" | "none";
};

export function Section({ tone = "paper", spacing = "default", className, ...rest }: Props) {
  return (
    <section
      className={cn(
        tone === "dark" && "theme-dark",
        tone === "stone" && "theme-stone",
        spacing === "default" && "section-y",
        spacing === "small" && "section-y-sm",
        "relative",
        className,
      )}
      {...rest}
    />
  );
}
