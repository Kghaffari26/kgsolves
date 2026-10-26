import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse, type NextRequest } from "next/server";
import { rateLimit } from "@/lib/forms/rateLimit";
import { ACCEPTED_CONTENT_TYPES, ACCEPTED_EXTENSIONS, MAX_UPLOAD_BYTES } from "@/lib/forms/schemas";

/**
 * Issues short-lived client upload tokens so plan files go straight from the browser to
 * Vercel Blob (serverless functions can't accept 50 MB bodies). Only PDF/DWG, 50 MB max.
 */
export async function POST(req: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "File uploads are not configured." }, { status: 503 });
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`upload:${ip}`, { limit: 40, windowMs: 10 * 60 * 1000 }).ok) {
    return NextResponse.json({ error: "Too many uploads. Try again later." }, { status: 429 });
  }
  const body = (await req.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        if (!ACCEPTED_EXTENSIONS.some((ext) => pathname.toLowerCase().endsWith(ext))) {
          throw new Error("Only PDF and DWG files are accepted.");
        }
        if (!pathname.startsWith("plans/")) throw new Error("Invalid upload path.");
        return {
          allowedContentTypes: ACCEPTED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
          addRandomSuffix: true,
          validUntil: Date.now() + 15 * 60 * 1000,
        };
      },
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
