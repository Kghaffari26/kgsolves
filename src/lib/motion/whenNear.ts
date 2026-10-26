"use client";

/**
 * Calls `cb` once, the first time `el` comes within `margin` of the viewport. Used to build
 * scroll choreography lazily: setting up SplitText, DrawSVG and pins for the whole page at once
 * is one long main-thread task; doing it per section as you approach keeps every task short.
 */
export function whenNear(el: Element, cb: () => void, margin = "0px 0px 100% 0px") {
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        cb();
      }
    },
    { rootMargin: margin },
  );
  io.observe(el);
  return () => io.disconnect();
}

/** Run after the page has loaded and the main thread is idle. */
export function afterIdle(cb: () => void) {
  let id = 0;
  const run = () => {
    const ric = window.requestIdleCallback ?? ((f: () => void) => window.setTimeout(f, 200));
    id = ric(cb, { timeout: 2500 }) as number;
  };
  if (document.readyState === "complete") run();
  else window.addEventListener("load", run, { once: true });
  return () => {
    window.removeEventListener("load", run);
    (window.cancelIdleCallback ?? window.clearTimeout)(id);
  };
}
