"use client";

/**
 * Provider-agnostic analytics. Events go to window.dataLayer (GTM/GA4 pick them up when
 * installed) and are re-dispatched as a DOM event so tests and future tools can listen.
 * No third-party script is loaded here.
 */
export type AnalyticsEvent =
  | { name: "lead_submit"; type: string; form: "start_project" | "plan_upload" }
  | { name: "phone_click"; location: string }
  | { name: "cta_click"; label: string; href: string };

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function track(event: AnalyticsEvent) {
  if (typeof window === "undefined") return;
  const { name, ...props } = event;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event: name, ...props });
  window.dispatchEvent(new CustomEvent("jmk:analytics", { detail: event }));
  if (process.env.NODE_ENV !== "production") console.info("[analytics]", name, props);
}
