import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";
import { Magnetic } from "./Magnetic";

type Variant = "primary" | "ghost" | "text";

type Common = { variant?: Variant; magnetic?: boolean; arrow?: boolean; className?: string };
type AsLink = Common & { href: string } & Omit<
    ComponentPropsWithoutRef<typeof Link>,
    "href" | "className"
  >;
type AsButton = Common & { href?: undefined } & Omit<
    ComponentPropsWithoutRef<"button">,
    "className"
  >;

const base =
  "group/btn inline-flex items-center justify-center gap-3 font-sans text-[0.9375rem] font-medium leading-none transition-[color,border-color] duration-500 ease-[var(--ease-out)] disabled:opacity-50 disabled:pointer-events-none";

// Primary and ghost fill with a wipe from the bottom edge (see .btn-wipe in globals.css);
// the label rolls up to a fresh copy of itself.
const variants: Record<Variant, string> = {
  primary:
    "btn-wipe min-h-12 rounded-full bg-fg-strong px-7 text-bg [--wipe:var(--accent)] hover:text-ink",
  ghost:
    "btn-wipe min-h-12 rounded-full border border-current/35 px-7 text-fg-strong [--wipe:var(--fg-strong)] hover:border-fg-strong hover:text-bg",
  text: "min-h-11 px-0 text-fg-strong link-underline pb-1 rounded-none",
};

function Arrow() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
    >
      <path d="M1 8h13M9 3l5 5-5 5" />
    </svg>
  );
}

export function Button(props: AsLink | AsButton) {
  const {
    variant = "primary",
    magnetic = variant !== "text",
    arrow,
    className,
    children,
    ...rest
  } = props;
  const classes = cn(base, variants[variant], className);
  const content = (
    <>
      {variant === "text" || typeof children !== "string" ? (
        <span>{children}</span>
      ) : (
        <span className="roll" data-text={children}>
          <span>{children}</span>
        </span>
      )}
      {arrow && <Arrow />}
    </>
  );
  const el =
    "href" in rest && rest.href !== undefined ? (
      <Link className={classes} {...(rest as Omit<AsLink, keyof Common>)}>
        {content}
      </Link>
    ) : (
      <button className={classes} type="button" {...(rest as Omit<AsButton, keyof Common>)}>
        {content}
      </button>
    );
  return magnetic ? <Magnetic>{el}</Magnetic> : el;
}
