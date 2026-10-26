"use client";

import { onLenis } from "./lenis";

type Gsap = typeof import("gsap").gsap;
type ST = typeof import("gsap/ScrollTrigger").ScrollTrigger;
type Split = typeof import("gsap/SplitText").SplitText;
type FlipT = typeof import("gsap/Flip").Flip;

export type GsapKit = { gsap: Gsap; ScrollTrigger: ST; SplitText: Split; Flip: FlipT };

let loading: Promise<GsapKit> | null = null;

/**
 * Motion vocabulary, one set of curves for the whole site:
 *  - "jmk.out"   long, settling deceleration (reveals, curtains, line masks)
 *  - "jmk.inOut" measured in-out (wipes, pinned scrubs, morphs)
 *  - "jmk.draw"  near-linear with a soft landing (hairlines and SVG drawing)
 * Nothing bounces or overshoots: things are placed, not thrown.
 */
export const EASE = { out: "jmk.out", inOut: "jmk.inOut", draw: "jmk.draw" } as const;

/**
 * Loads GSAP + plugins on demand (code-split; only components that need choreography call
 * this) and keeps ScrollTrigger in sync with Lenis smooth scrolling.
 */
export function loadGsap() {
  loading ??= Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
    import("gsap/SplitText"),
    import("gsap/Flip"),
    import("gsap/DrawSVGPlugin"),
    import("gsap/CustomEase"),
  ]).then(([g, st, split, flip, draw, custom]) => {
    const gsap = g.gsap;
    const { ScrollTrigger } = st;
    const { SplitText } = split;
    const { Flip } = flip;
    const { CustomEase } = custom;
    gsap.registerPlugin(ScrollTrigger, SplitText, Flip, draw.DrawSVGPlugin, CustomEase);
    CustomEase.create(EASE.out, "0.16, 1, 0.3, 1");
    CustomEase.create(EASE.inOut, "0.76, 0, 0.24, 1");
    CustomEase.create(EASE.draw, "0.45, 0.05, 0.25, 1");
    gsap.defaults({ ease: EASE.out, duration: 1.1 });
    ScrollTrigger.config({ ignoreMobileResize: true });

    let off: (() => void) | undefined;
    onLenis((lenis) => {
      off?.();
      off = undefined;
      if (!lenis) return;
      const update = () => ScrollTrigger.update();
      lenis.on("scroll", update);
      off = () => lenis.off("scroll", update);
    });
    return { gsap, ScrollTrigger, SplitText, Flip };
  });
  return loading;
}

/** True when motion is allowed (checked at call time, client only). */
export function motionOK() {
  return (
    typeof window !== "undefined" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
