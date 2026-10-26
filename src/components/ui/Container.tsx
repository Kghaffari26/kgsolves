import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/lib/utils";

type Props<T extends ElementType> = {
  as?: T;
  /** narrow = reading width (~860px) */
  width?: "default" | "narrow" | "wide";
} & ComponentPropsWithoutRef<T>;

export function Container<T extends ElementType = "div">({
  as,
  width = "default",
  className,
  ...rest
}: Props<T>) {
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag
      className={cn(
        "container-site",
        width === "narrow" && "max-w-[calc(54rem+2*var(--gutter))]",
        width === "wide" && "max-w-[120rem]",
        className,
      )}
      {...rest}
    />
  );
}
