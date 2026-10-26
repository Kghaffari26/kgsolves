"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** Renders the visitor's current year so a statically built footer never goes stale. */
export function CurrentYear({ fallback }: { fallback: number }) {
  const year = useSyncExternalStore(
    noop,
    () => new Date().getFullYear(),
    () => fallback,
  );
  return <>{year}</>;
}
