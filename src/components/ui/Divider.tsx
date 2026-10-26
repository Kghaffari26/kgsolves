import { cn } from "@/lib/utils";

/**
 * Horizontal rule. `blueprint` draws a dimension line: end ticks, a hairline, and an
 * optional centred label, like a measurement on a construction drawing.
 */
export function Divider({
  variant = "plain",
  label,
  className,
}: {
  variant?: "plain" | "blueprint";
  label?: string;
  className?: string;
}) {
  if (variant === "plain") return <hr className={cn("border-0 border-t border-rule", className)} />;
  return (
    <div role="separator" className={cn("relative flex items-center text-fg-muted", className)}>
      <span aria-hidden className="h-3 w-px bg-current opacity-50" />
      <span aria-hidden className="h-px flex-1 bg-current opacity-30" />
      {label && (
        <span className="eyebrow px-4 text-[0.6875rem] tracking-[0.2em] opacity-80">{label}</span>
      )}
      {label && <span aria-hidden className="h-px flex-1 bg-current opacity-30" />}
      <span aria-hidden className="h-3 w-px bg-current opacity-50" />
    </div>
  );
}
