import type { Stat as StatType } from "@/lib/types";
import { Todo } from "./Todo";

/** Unverified stats never render a value; they show a TODO marker (or nothing in production). */
export function Stat({ stat }: { stat: StatType }) {
  const ok = stat.verified && stat.value;
  if (!ok) {
    return (
      <div className="border-t border-rule pt-5">
        <Todo>{`confirm "${stat.label}"`}</Todo>
      </div>
    );
  }
  return (
    <div className="border-t border-rule pt-5">
      <p className="font-display text-h2 leading-none text-fg-strong">{stat.value}</p>
      <p className="mt-3 text-small text-fg-muted">{stat.label}</p>
    </div>
  );
}
