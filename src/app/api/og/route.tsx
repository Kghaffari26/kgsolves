import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

const fonts = Promise.all([
  readFile(path.join(process.cwd(), "src/assets/fonts/Fraunces-Regular.ttf")),
  readFile(path.join(process.cwd(), "src/assets/fonts/InterTight-Medium.ttf")),
]);

const PUBLIC_DIR = path.join(process.cwd(), "public");

/**
 * Site-relative images are read from /public (and shrunk) rather than fetched over HTTP;
 * remote images are limited to the Sanity CDN. Anything else is ignored.
 */
async function resolveImage(raw: string | null) {
  if (!raw) return null;
  if (raw.startsWith("/") && !raw.startsWith("//")) {
    const file = path.normalize(path.join(PUBLIC_DIR, decodeURIComponent(raw.split("?")[0])));
    if (!file.startsWith(PUBLIC_DIR + path.sep) || !/\.(jpe?g|png|webp)$/i.test(file)) return null;
    try {
      const buf = await sharp(await readFile(file))
        .resize(1200, 630, { fit: "cover" })
        .jpeg({ quality: 78 })
        .toBuffer();
      return `data:image/jpeg;base64,${buf.toString("base64")}`;
    } catch {
      return null;
    }
  }
  try {
    const u = new URL(raw);
    if (u.hostname !== "cdn.sanity.io") return null;
    u.searchParams.set("w", "1200");
    u.searchParams.set("h", "630");
    u.searchParams.set("fit", "crop");
    u.searchParams.set("fm", "jpg");
    return u.toString();
  } catch {
    return null;
  }
}

/**
 * Open Graph card: the page's project photo (or ink) with the page title and wordmark.
 * GET /api/og?title=4%20Fairway%20Point&image=/images/projects/4-fairway-point/hero.jpg
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = (searchParams.get("title") ?? "Coastal homes, built from the foundation up.").slice(
    0,
    90,
  );
  const image = await resolveImage(
    searchParams.get("image") ?? "/images/projects/4-fairway-point/hero.jpg",
  );
  const [fraunces, inter] = await fonts;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: "#0F1B2D",
        fontFamily: "Inter Tight",
      }}
    >
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          width={1200}
          height={630}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            objectFit: "cover",
            width: "100%",
            height: "100%",
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          display: "flex",
          background:
            "linear-gradient(180deg, rgba(15,27,45,0.55) 0%, rgba(15,27,45,0.45) 45%, rgba(15,27,45,0.95) 100%)",
          width: "100%",
          height: "100%",
        }}
      />
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
          width: "100%",
          color: "#FAF8F4",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              border: "1.5px solid rgba(250,248,244,0.8)",
              fontFamily: "Fraunces",
              fontSize: 26,
            }}
          >
            JMK
          </div>
          <div style={{ display: "flex", fontFamily: "Fraunces", fontSize: 34 }}>JM Kelley</div>
          <div style={{ display: "flex", fontSize: 14, letterSpacing: 4, opacity: 0.8 }}>INC.</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontFamily: "Fraunces",
              fontSize: title.length > 40 ? 64 : 84,
              lineHeight: 1.02,
              letterSpacing: -1.5,
              maxWidth: 980,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: 18,
              letterSpacing: 3.5,
              opacity: 0.85,
            }}
          >
            <span
              style={{
                display: "flex",
                width: 40,
                height: 1,
                background: "#D39A62",
                marginRight: 16,
                marginTop: 11,
              }}
            />
            NEWPORT BEACH · GENERAL CONTRACTOR · CONCRETE & FRAMING
          </div>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Fraunces", data: fraunces, weight: 400 },
        { name: "Inter Tight", data: inter, weight: 500 },
      ],
      headers: {
        "cache-control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
      },
    },
  );
}
