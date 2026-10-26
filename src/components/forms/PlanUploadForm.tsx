"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { FieldError, FormSuccess, Honeypot, TextArea, TextField } from "./fields";
import { submitPlanUpload } from "@/lib/forms/actions";
import {
  ACCEPTED_EXTENSIONS,
  MAX_UPLOAD_BYTES,
  planUploadSchema,
  type PlanUploadData,
  type PlanUploadInput,
} from "@/lib/forms/schemas";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const noopSubscribe = () => () => {};
const mb = (n: number) =>
  n < 100 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`;
const accepted = (f: File) => ACCEPTED_EXTENSIONS.some((ext) => f.name.toLowerCase().endsWith(ext));

/**
 * Plan upload for take-off requests. Files upload directly from the browser to Vercel Blob
 * (token issued by /api/blob/upload); the server action receives links, never file bodies.
 * When Blob isn't configured the request is still sent, listing file names only.
 */
export function PlanUploadForm({ uploadsEnabled }: { uploadsEnabled: boolean }) {
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [dragging, setDragging] = useState(false);
  const [fileNotice, setFileNotice] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);
  // Local date for the date picker's min, read on the client only.
  const today = useSyncExternalStore(
    noopSubscribe,
    () => new Date().toLocaleDateString("en-CA"),
    () => "",
  );
  const dropId = useId();

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitted },
  } = useForm<PlanUploadInput, unknown, PlanUploadData>({
    resolver: zodResolver(planUploadSchema),
    mode: "onTouched",
    defaultValues: { website: "", phone: "", notes: "", files: [], startedAt: 0 },
  });

  useEffect(() => {
    setValue("startedAt", Date.now());
  }, [setValue]);

  const syncFiles = (next: File[]) => {
    setFiles(next);
    setValue(
      "files",
      next.map((f) => ({ name: f.name, size: f.size, url: null })),
      { shouldValidate: isSubmitted },
    );
  };

  const addFiles = (list: FileList | File[]) => {
    const incoming = Array.from(list);
    const rejected = incoming.filter((f) => !accepted(f));
    const merged = [...files, ...incoming.filter(accepted)].filter(
      (f, i, arr) => arr.findIndex((g) => g.name === f.name && g.size === f.size) === i,
    );
    syncFiles(merged);
    // Rejections are a notice about this pick, separate from schema validation of the list.
    setFileNotice(
      rejected.length
        ? `Only PDF and DWG files are accepted (skipped ${rejected.map((f) => f.name).join(", ")}).`
        : null,
    );
    if (merged.reduce((n, f) => n + f.size, 0) > MAX_UPLOAD_BYTES) {
      setError("files", { message: "Files must total 50 MB or less." });
    } else if (merged.length) clearErrors("files");
  };

  const total = files.reduce((n, f) => n + f.size, 0);

  const onSubmit = (data: PlanUploadData) => {
    setServerError(null);
    startTransition(async () => {
      let uploaded = data.files;
      if (uploadsEnabled) {
        try {
          const { upload } = await import("@vercel/blob/client");
          const stamp = new Date().toISOString().slice(0, 10);
          uploaded = await Promise.all(
            files.map(async (f) => {
              const safe = f.name.replace(/[^\w.-]+/g, "_");
              const blob = await upload(`plans/${stamp}/${safe}`, f, {
                access: "public",
                handleUploadUrl: "/api/blob/upload",
                multipart: f.size > 8 * 1024 * 1024,
                onUploadProgress: (e) => setProgress((p) => ({ ...p, [f.name]: e.percentage })),
              });
              return { name: f.name, size: f.size, url: blob.url };
            }),
          );
        } catch (err) {
          setServerError(
            `Upload failed: ${(err as Error).message}. Please try again or call 949-873-0740.`,
          );
          return;
        }
      }
      const res = await submitPlanUpload({ ...data, files: uploaded });
      if (res.ok) {
        track({ name: "lead_submit", type: "lumber_takeoff", form: "plan_upload" });
        setDone(true);
      } else {
        setServerError(res.error);
        for (const [field, msgs] of Object.entries(res.fieldErrors ?? {})) {
          setError(field as keyof PlanUploadInput, { message: msgs?.[0] });
        }
      }
    });
  };

  if (done) {
    return (
      <FormSuccess title="Plans received.">
        <p>
          We&rsquo;ll review the set and confirm the quote and turnaround. A confirmation is on its
          way to your inbox.
        </p>
      </FormSuccess>
    );
  }

  const err = (k: keyof PlanUploadInput) => errors[k]?.message as string | undefined;

  return (
    <form
      onSubmit={(e) => handleSubmit(onSubmit)(e)}
      noValidate
      className="relative"
      aria-label="Upload plans for a take-off"
      data-testid="plan-upload-form"
    >
      <Honeypot {...register("website")} />
      <div className="grid gap-8 sm:grid-cols-2">
        <TextField
          label="Company"
          autoComplete="organization"
          error={err("company")}
          {...register("company")}
        />
        <TextField
          label="Contact name"
          autoComplete="name"
          error={err("contactName")}
          {...register("contactName")}
        />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          error={err("email")}
          {...register("email")}
        />
        <TextField
          label="Phone"
          type="tel"
          autoComplete="tel"
          optional
          error={err("phone")}
          {...register("phone")}
        />
        <TextField
          label="Project address"
          autoComplete="street-address"
          error={err("projectAddress")}
          {...register("projectAddress")}
          className="sm:col-span-2"
        />
        <TextField
          label="Needed by"
          type="date"
          min={today || undefined}
          error={err("neededBy")}
          {...register("neededBy")}
        />
      </div>

      <div className="mt-10">
        <p id={`${dropId}-label`} className="text-small font-medium text-fg-strong">
          Plan files
        </p>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            addFiles(e.dataTransfer.files);
          }}
          className={cn(
            "mt-3 flex flex-col items-center justify-center gap-3 border border-dashed px-6 py-10 text-center transition-colors",
            dragging ? "border-fg-strong bg-surface" : "border-current/30",
            (errors.files || fileNotice) && "border-[#A1361F]",
          )}
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="size-8 text-fg-muted"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
          >
            <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" />
          </svg>
          <p className="text-fg">
            Drag files here, or{" "}
            <button
              type="button"
              className="link-underline bg-[length:100%_1px] text-fg-strong"
              onClick={() => fileInput.current?.click()}
            >
              browse
            </button>
          </p>
          <p className="text-small text-fg-muted">PDF or DWG · multiple files · 50 MB total</p>
          <input
            ref={fileInput}
            type="file"
            multiple
            accept=".pdf,.dwg,application/pdf"
            className="sr-only"
            aria-labelledby={`${dropId}-label`}
            aria-describedby={errors.files || fileNotice ? `${dropId}-error` : undefined}
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = "";
            }}
            data-testid="plan-files"
          />
        </div>
        <FieldError
          id={`${dropId}-error`}
          message={fileNotice ?? errors.files?.message ?? errors.files?.root?.message}
        />

        {files.length > 0 && (
          <ul
            className="mt-4 divide-y divide-rule border-y border-rule"
            aria-label="Selected files"
          >
            {files.map((f) => (
              <li
                key={f.name + f.size}
                className="flex items-center justify-between gap-4 py-3 text-small"
              >
                <span className="min-w-0 truncate text-fg-strong">{f.name}</span>
                <span className="flex shrink-0 items-center gap-4 text-fg-muted tabular-nums">
                  {progress[f.name] != null && progress[f.name] < 100
                    ? `${Math.round(progress[f.name])}%`
                    : mb(f.size)}
                  <button
                    type="button"
                    onClick={() => syncFiles(files.filter((g) => g !== f))}
                    className="link-underline inline-flex min-h-11 items-center text-fg-strong"
                    aria-label={`Remove ${f.name}`}
                    disabled={pending}
                  >
                    Remove
                  </button>
                </span>
              </li>
            ))}
            <li className="flex justify-between py-3 text-small text-fg-muted">
              <span>Total</span>
              <span className={cn("tabular-nums", total > MAX_UPLOAD_BYTES && "text-[#A1361F]")}>
                {mb(total)} of 50 MB
              </span>
            </li>
          </ul>
        )}
        {!uploadsEnabled && (
          <p className="mt-3 text-small text-fg-muted">
            File storage isn&rsquo;t connected in this environment yet; we&rsquo;ll receive your
            file names and ask you to email the set.
          </p>
        )}
      </div>

      <TextArea
        label="Notes"
        optional
        className="mt-10"
        error={err("notes")}
        {...register("notes")}
      />

      {serverError && (
        <p role="alert" className="mt-8 border-l-2 border-[#A1361F] pl-4 text-[#A1361F]">
          {serverError}
        </p>
      )}

      <div className="mt-10 flex justify-end border-t border-rule pt-8">
        <Button type="submit" arrow disabled={pending}>
          {pending ? "Sending…" : "Send plans"}
        </Button>
      </div>
    </form>
  );
}
