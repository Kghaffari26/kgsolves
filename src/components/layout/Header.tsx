"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { PhoneLink } from "./PhoneLink";
import { mainNav } from "@/lib/site";
import { getLenis } from "@/lib/motion/lenis";
import { cn } from "@/lib/utils";

/**
 * Site header.
 * - Transparent with light type over pages that render a [data-header-overlay] hero (pure CSS
 *   via :has, so there is no flash before hydration), solid once the page scrolls.
 * - Hides on scroll down, returns on scroll up.
 * - Below lg: full-screen menu dialog with focus trap and staggered links.
 */
export function Header({ phone }: { phone: string }) {
  const pathname = usePathname();
  const [atTop, setAtTop] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let last = window.scrollY;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      setAtTop(y < 24);
      const focusInside = headerRef.current?.contains(document.activeElement);
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 160 && !focusInside);
        last = y;
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  // Close the menu when the route changes. Adjusting state during render on a changed
  // value avoids an extra effect pass.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
    setHidden(false);
  }

  useEffect(() => {
    if (!open) return;
    const lenis = getLenis();
    lenis?.stop();
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const dialog = dialogRef.current;
    const focusables = () =>
      Array.from(dialog?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      const first = items[0];
      const lastItem = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        lastItem?.focus();
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prevOverflow;
      lenis?.start();
    };
  }, [open, close]);

  return (
    <>
      <header
        ref={headerRef}
        data-top={atTop}
        data-hidden={hidden && !open}
        style={{ viewTransitionName: "site-header" }}
        className="site-header fixed inset-x-0 top-0 z-50 h-[var(--header-h)] transition-[transform,background-color,color,border-color] duration-500 ease-[var(--ease-out)]"
      >
        <div className="container-site flex h-full items-center justify-between gap-6">
          <Link href="/" className="relative z-10 shrink-0" aria-label="JM Kelley Inc. — home">
            <Logo className="h-7 md:h-8" title="JM Kelley Inc." />
          </Link>

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {mainNav.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group/nav relative inline-flex py-2 text-[0.9375rem]",
                        active && "nav-active",
                      )}
                    >
                      <span className="roll" data-text={item.label}>
                        <span>{item.label}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-5">
            <PhoneLink
              phone={phone}
              location="header"
              className="link-underline hidden text-[0.9375rem] tabular-nums md:inline"
            />
            <span className="header-cta hidden sm:inline-flex">
              <Button href="/contact" variant="ghost">
                Start a project
              </Button>
            </span>
            <button
              ref={menuButtonRef}
              type="button"
              className="inline-flex min-h-11 items-center gap-3 lg:hidden"
              aria-expanded={open}
              aria-controls="site-menu"
              onClick={() => setOpen(true)}
            >
              <span className="text-[0.9375rem]">Menu</span>
              <span aria-hidden className="flex w-6 flex-col gap-1.5">
                <span className="h-px w-full bg-current" />
                <span className="h-px w-2/3 self-end bg-current" />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div
        id="site-menu"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        data-open={open}
        inert={!open}
        className="site-menu theme-dark fixed inset-0 z-[60] flex flex-col overflow-y-auto lg:hidden"
      >
        <div className="container-site flex h-[var(--header-h)] shrink-0 items-center justify-between">
          <Link href="/" aria-label="JM Kelley Inc. — home" onClick={() => setOpen(false)}>
            <Logo className="h-7 text-fg-strong" />
          </Link>
          <button type="button" onClick={close} className="inline-flex min-h-11 items-center gap-3">
            <span className="text-[0.9375rem]">Close</span>
            <svg
              aria-hidden
              viewBox="0 0 16 16"
              className="size-4"
              stroke="currentColor"
              fill="none"
            >
              <path d="M2 2l12 12M14 2L2 14" />
            </svg>
          </button>
        </div>
        <nav
          aria-label="Mobile"
          className="container-site flex flex-1 flex-col justify-center py-10"
        >
          <ul className="space-y-2">
            {[
              { label: "Home", href: "/" },
              ...mainNav,
              { label: "Start a project", href: "/contact" },
            ].map((item, i) => (
              <li
                key={item.href}
                className="menu-item overflow-hidden"
                style={{ "--i": i } as React.CSSProperties}
              >
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className="block py-1 font-display text-[clamp(2.25rem,9vw,3.5rem)] leading-[1.1] text-fg-strong"
                >
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div
            className="menu-item mt-12 space-y-1 text-fg-muted"
            style={{ "--i": 8 } as React.CSSProperties}
          >
            <PhoneLink phone={phone} location="mobile_menu" className="text-lead text-fg-strong" />
            <p className="text-small">Mon–Fri 8am–5pm</p>
          </div>
        </nav>
      </div>
    </>
  );
}
