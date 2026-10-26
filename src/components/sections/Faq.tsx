import { Todo } from "@/components/ui/Todo";
import { showTodos } from "@/lib/env";
import type { Faq as FaqType } from "@/lib/types";

/** Native <details> accordion: keyboard and screen-reader friendly with no JS. */
export function Faq({ items }: { items: FaqType[] }) {
  const visible = items.filter((f) => f.answer || showTodos);
  return (
    <div className="border-t border-rule">
      {visible.map((f) => (
        <details key={f.question} className="group border-b border-rule">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 font-display text-h4 text-fg-strong [&::-webkit-details-marker]:hidden">
            {f.question}
            <span aria-hidden className="relative size-4 shrink-0">
              <span className="absolute top-1/2 left-0 h-px w-4 bg-current" />
              <span className="absolute top-0 left-1/2 h-4 w-px bg-current transition-transform duration-300 group-open:scale-y-0" />
            </span>
          </summary>
          <div className="max-w-2xl pb-7 text-fg">
            {f.answer ? <p>{f.answer}</p> : <Todo>{`answer: ${f.question}`}</Todo>}
          </div>
        </details>
      ))}
    </div>
  );
}
