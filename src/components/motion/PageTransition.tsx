import { ViewTransition } from "react";

/**
 * Route transition via React <ViewTransition> (browser View Transitions API): the old page
 * leaves quickly, the new one rises into place. The header is pinned (see globals.css) and
 * project images morph separately into their case-study hero. Browsers without the API, and
 * reduced-motion users, get an instant swap. The first page load never animates.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page-in" exit="page-out" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
