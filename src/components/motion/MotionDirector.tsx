"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { EASE, loadGsap, motionOK, type GsapKit } from "@/lib/motion/gsap";
import { afterIdle } from "@/lib/motion/whenNear";

const belowFold = (el: Element) => el.getBoundingClientRect().top > window.innerHeight * 0.92;

/**
 * Scroll choreography for server-rendered markup, driven by data attributes:
 *
 *  data-split    headings: lines rise out of a mask (GSAP SplitText, re-splits on resize)
 *  data-curtain  image frames: a clip-path wipe opens upward while the image settles
 *                from a slight zoom, like a site hoarding coming down
 *  data-rule     hairlines/borders: draw from the left edge
 *  data-uncover  footer content: rises from beneath the page as it scrolls into view
 *
 * Only elements that start below the fold are animated, so nothing visible on first paint is
 * hidden (no flash, no LCP cost). Each element is set up lazily as it approaches the viewport,
 * which keeps main-thread tasks short. Reduced motion: nothing runs. Re-runs per route.
 */
export function MotionDirector() {
  const pathname = usePathname();

  useEffect(() => {
    if (!motionOK()) return;
    let cancelled = false;
    let teardown: (() => void) | undefined;

    const stopIdle = afterIdle(() => {
      loadGsap().then((kit) => {
        if (cancelled) return;
        teardown = setup(kit);
      });
    });
    return () => {
      cancelled = true;
      stopIdle();
      teardown?.();
    };
  }, [pathname]);

  return null;
}

function setup({ gsap, SplitText }: GsapKit) {
  const ctx = gsap.context(() => {});
  const build: Record<string, (el: HTMLElement) => void> = {
    split: (el) =>
      SplitText.create(el, {
        type: "lines",
        mask: "lines",
        linesClass: "split-line",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 112,
            duration: 1.25,
            stagger: 0.09,
            ease: EASE.out,
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          }),
      }),
    curtain: (el) => {
      const media = el.querySelector("img, video");
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
        defaults: { ease: EASE.inOut, duration: 1.3 },
      });
      tl.fromTo(
        el,
        { clipPath: "inset(100% 0% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", clearProps: "clipPath" },
      );
      if (media)
        tl.fromTo(
          media,
          { scale: 1.18 },
          { scale: 1, duration: 1.8, ease: EASE.out, clearProps: "scale,transform" },
          0,
        );
    },
    rule: (el) =>
      gsap.fromTo(
        el,
        { scaleX: 0, transformOrigin: "0% 50%" },
        {
          scaleX: 1,
          duration: 1.4,
          ease: EASE.draw,
          clearProps: "transform",
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
        },
      ),
    uncover: (el) =>
      gsap.fromTo(
        el,
        { yPercent: -28 },
        {
          yPercent: 0,
          ease: "none",
          scrollTrigger: {
            trigger: el.parentElement,
            start: "top bottom",
            end: "top 20%",
            scrub: true,
          },
        },
      ),
  };

  const targets = Array.from(
    document.querySelectorAll<HTMLElement>(
      "[data-split], [data-curtain], [data-rule], [data-uncover]",
    ),
  ).filter((el) => el.hasAttribute("data-uncover") || belowFold(el));

  // Build each effect while it's still a screen away, one element per observer callback.
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        io.unobserve(entry.target);
        const el = entry.target as HTMLElement;
        const kind = (["split", "curtain", "rule", "uncover"] as const).find((k) =>
          el.hasAttribute(`data-${k}`),
        );
        if (kind) ctx.add(() => build[kind](el));
      }
    },
    { rootMargin: "0px 0px 100% 0px" },
  );
  targets.forEach((el) => io.observe(el));

  return () => {
    io.disconnect();
    ctx.revert();
  };
}
