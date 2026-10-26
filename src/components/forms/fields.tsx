"use client";

import { useId, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p
      id={id}
      className="mt-2 flex items-center gap-2 text-small text-[#A1361F] [.theme-dark_&]:text-[#F2A38F]"
    >
      <svg aria-hidden viewBox="0 0 16 16" className="size-4 shrink-0" fill="currentColor">
        <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.5h1.5v5h-1.5v-5zm0 6.25h1.5v1.5h-1.5v-1.5z" />
      </svg>
      {message}
    </p>
  );
}

const inputBase =
  "mt-2 block w-full rounded-none border-0 border-b border-current/30 bg-transparent px-0 py-3 text-body text-fg-strong placeholder:text-fg-muted/70 transition-colors focus:border-fg-strong focus:ring-0 focus-visible:outline-2 focus-visible:outline-offset-4 aria-[invalid=true]:border-[#A1361F]";

type TextFieldProps = ComponentPropsWithoutRef<"input"> & {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
};

export function TextField({
  label,
  error,
  hint,
  optional,
  className,
  id: idProp,
  ...rest
}: TextFieldProps) {
  const auto = useId();
  const id = idProp ?? auto;
  const describedBy =
    [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="text-small font-medium text-fg-strong">
        {label}
        {optional && <span className="ml-2 font-normal text-fg-muted">(optional)</span>}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={inputBase}
        {...rest}
      />
      {hint && (
        <p id={`${id}-hint`} className="mt-2 text-small text-fg-muted">
          {hint}
        </p>
      )}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

type TextAreaProps = ComponentPropsWithoutRef<"textarea"> & {
  label: string;
  error?: string;
  optional?: boolean;
};

export function TextArea({
  label,
  error,
  optional,
  className,
  id: idProp,
  ...rest
}: TextAreaProps) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <div className={className}>
      <label htmlFor={id} className="text-small font-medium text-fg-strong">
        {label}
        {optional && <span className="ml-2 font-normal text-fg-muted">(optional)</span>}
      </label>
      <textarea
        id={id}
        rows={4}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(inputBase, "resize-y")}
        {...rest}
      />
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

/** Radio group styled as selectable cards. Pass register(...) props via `inputProps`. */
export function ChoiceCards({
  legend,
  name,
  options,
  error,
  inputProps,
  columns = 2,
  value,
}: {
  legend: ReactNode;
  name: string;
  options: readonly { value: string; label: string }[];
  error?: string;
  inputProps: ComponentPropsWithoutRef<"input">;
  columns?: 2 | 3;
  value?: string;
}) {
  const id = useId();
  return (
    <fieldset aria-describedby={error ? `${id}-error` : undefined}>
      <legend className="text-small font-medium text-fg-strong">{legend}</legend>
      <div className={cn("mt-4 grid gap-3", columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
        {options.map((o) => {
          const checked = value === o.value;
          return (
            <label
              key={o.value}
              className={cn(
                "relative flex min-h-14 cursor-pointer items-center gap-3 border px-4 py-3 transition-colors duration-200",
                checked
                  ? "border-fg-strong bg-fg-strong text-bg"
                  : "border-rule hover:border-fg-strong",
                "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--focus)]",
              )}
            >
              <input type="radio" name={name} value={o.value} className="sr-only" {...inputProps} />
              <span
                aria-hidden
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded-full border",
                  checked ? "border-bg" : "border-current/50",
                )}
              >
                {checked && <span className="size-2 rounded-full bg-bg" />}
              </span>
              <span className="text-[0.9375rem]">{o.label}</span>
            </label>
          );
        })}
      </div>
      <FieldError id={`${id}-error`} message={error} />
    </fieldset>
  );
}

/** Off-screen honeypot. Hidden from people and assistive tech; bots fill it. */
export function Honeypot(props: ComponentPropsWithoutRef<"input">) {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Website
        <input type="text" tabIndex={-1} autoComplete="off" {...props} />
      </label>
    </div>
  );
}

export function FormSuccess({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div role="status" className="form-success py-6" tabIndex={-1} data-testid="form-success">
      <svg
        aria-hidden
        viewBox="0 0 64 64"
        className="size-16 text-accent"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="32" cy="32" r="30" className="success-ring" pathLength={1} />
        <path d="M20 33l8 8 16-18" className="success-check" pathLength={1} />
      </svg>
      <h2 className="mt-8 font-display text-h2">{title}</h2>
      <div className="mt-4 max-w-md text-lead text-fg-muted">{children}</div>
    </div>
  );
}
