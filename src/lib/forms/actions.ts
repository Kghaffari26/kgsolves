"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { getLeadProvider, type Lead } from "./provider";
import { rateLimit } from "./rateLimit";
import { planUploadLead, startProjectLead } from "./email";
import { planUploadSchema, startProjectSchema } from "./schemas";

export type FormResult =
  { ok: true } | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

/** Submissions faster than this after the form rendered are treated as bots. */
const MIN_FILL_MS = 2500;

async function guard(startedAt: unknown, website: unknown): Promise<FormResult | null> {
  // Honeypot or impossibly fast fill: pretend success so bots learn nothing.
  if (typeof website === "string" && website.length > 0) return { ok: true };
  if (typeof startedAt === "number" && Date.now() - startedAt < MIN_FILL_MS) return { ok: true };
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const rl = rateLimit(`lead:${ip}`);
  if (!rl.ok) {
    return {
      ok: false,
      error: `Too many submissions. Please wait ${Math.ceil(rl.retryAfterMs / 60000)} minutes or call us at 949-873-0740.`,
    };
  }
  return null;
}

function invalid(error: z.ZodError): FormResult {
  return {
    ok: false,
    error: "Please check the highlighted fields.",
    fieldErrors: z.flattenError(error).fieldErrors as Record<string, string[]>,
  };
}

async function deliver(build: () => Lead): Promise<FormResult> {
  try {
    await getLeadProvider().send(build());
    return { ok: true };
  } catch (err) {
    console.error("[lead] delivery failed:", err);
    return {
      ok: false,
      error: "We couldn't send your message just now. Please call us at 949-873-0740.",
    };
  }
}

export async function submitStartProject(input: unknown): Promise<FormResult> {
  const raw = (input ?? {}) as Record<string, unknown>;
  const blocked = await guard(raw.startedAt, raw.website);
  if (blocked) return blocked;
  const parsed = startProjectSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  return deliver(() => startProjectLead(parsed.data));
}

export async function submitPlanUpload(input: unknown): Promise<FormResult> {
  const raw = (input ?? {}) as Record<string, unknown>;
  const blocked = await guard(raw.startedAt, raw.website);
  if (blocked) return blocked;
  const parsed = planUploadSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const uploadsEnabled = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  // Only accept file URLs that point at our own Blob store.
  if (
    parsed.data.files.some(
      (f) => f.url && !/^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i.test(f.url),
    )
  ) {
    return { ok: false, error: "One of the files didn't upload correctly. Please try again." };
  }
  return deliver(() => planUploadLead(parsed.data, uploadsEnabled));
}
