import { showTodos } from "@/lib/env";
import { cn } from "@/lib/utils";

/**
 * Visible placeholder for a fact the client hasn't supplied yet. Renders nothing once
 * NEXT_PUBLIC_HIDE_TODOS=true, so unknowns are never shown as invented values.
 * Every use must also be listed in CONTENT_TODO.md.
 */
export function Todo({
  children,
  className,
  block,
}: {
  children: React.ReactNode;
  className?: string;
  block?: boolean;
}) {
  if (!showTodos) return null;
  const Tag = block ? "div" : "span";
  return (
    <Tag
      className={cn(
        "border border-dashed border-current/40 px-2 py-0.5 font-sans text-small text-fg-muted not-italic",
        block ? "block p-4" : "inline-block align-middle",
        className,
      )}
    >
      TODO(client): {children}
    </Tag>
  );
}
