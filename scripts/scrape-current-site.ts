/**
 * Pulls images and page text from the current GoDaddy site (jmkelleyinc.com).
 *
 *   npm run scrape
 *
 * Output:
 *   assets/legacy/<page>/<file>   full-resolution images (img1.wsimg.com, transform suffix stripped)
 *   assets/legacy/<page>.txt      visible page text
 *   assets/legacy/manifest.json   one entry per image: page, original URL, size, group
 *
 * Groups: "finished" (professional photography) or "jobsite" (phone photos from construction).
 * The grouping is a heuristic (camera EXIF + resolution/aspect). Review it in the manifest:
 * set "group" by hand and flip "reviewed" to true, then run `npm run legacy:apply`.
 *
 * The script checks connectivity once and exits if the domain is unreachable. It never loops
 * on retries.
 */
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ORIGIN = "https://jmkelleyinc.com";
const OUT_DIR = path.join(process.cwd(), "assets", "legacy");

/** Legacy path -> folder name (matches the new project slugs where there is one). */
const PAGES: Record<string, string> = {
  "/": "home",
  "/portfolio": "portfolio",
  "/services": "services",
  "/contact-us": "contact-us",
  "/4-fairway-point": "4-fairway-point",
  "/1418-balboa-blvd": "1418-balboa-blvd",
  "/1441%2C-443%2C-445-m": "441-445-m-street",
  "/4807-seashore": "4807-seashore",
  "/2000-east": "2000-east-oceanfront",
  "/302-kings-road": "302-kings-road",
};

const PHONE_MAKES = ["apple", "samsung", "google", "motorola", "lg", "oneplus", "huawei", "xiaomi"];

export type LegacyImage = {
  page: string;
  pagePath: string;
  originalUrl: string;
  filename: string;
  file: string;
  width: number | null;
  height: number | null;
  bytes: number;
  camera: string | null;
  group: "finished" | "jobsite";
  groupReason: string;
  reviewed: boolean;
};

function stripTransform(url: string) {
  // e.g. //img1.wsimg.com/isteam/ip/<id>/IMG_1234.jpg/:/cr=t:0%25,l:0%25/rs=w:1280
  const clean = url.split("/:/")[0];
  return clean.startsWith("//") ? `https:${clean}` : clean;
}

function extractImageUrls(html: string) {
  const unescaped = html
    .replace(/\\u002F/gi, "/")
    .replace(/\\\//g, "/")
    .replace(/&amp;/g, "&");
  const matches =
    unescaped.match(/(?:https?:)?\/\/img1\.wsimg\.com\/isteam\/[^"'\s)<>\\,]+/g) ?? [];
  const urls = new Set<string>();
  for (const m of matches) {
    const url = stripTransform(m);
    if (/\.(jpe?g|png|webp|gif)$/i.test(url)) urls.add(url);
  }
  return [...urls];
}

function extractText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<(br|\/p|\/h[1-6]|\/li|\/div)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;|&rsquo;/g, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/[ \t]+/g, " ")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n");
}

function filenameFor(url: string, used: Set<string>) {
  const base = decodeURIComponent(url.split("/").pop() ?? "image.jpg").replace(/[^\w.-]+/g, "_");
  let name = base;
  let i = 1;
  while (used.has(name)) name = base.replace(/(\.\w+)$/, `-${i++}$1`);
  used.add(name);
  return name;
}

async function classify(buf: Buffer, width: number | null, height: number | null) {
  const meta = await sharp(buf).metadata();
  let camera: string | null = null;
  if (meta.exif) {
    // Cheap EXIF sniff: Make/Model strings are stored as plain ASCII.
    const ascii = meta.exif.toString("latin1").toLowerCase();
    const make = PHONE_MAKES.find((m) => ascii.includes(m));
    if (make) camera = make;
    else if (/canon|nikon|sony|fujifilm|hasselblad|phase one|leica/.test(ascii)) camera = "dslr";
  }
  if (camera && camera !== "dslr")
    return { camera, group: "jobsite" as const, reason: `EXIF make: ${camera}` };
  if (camera === "dslr")
    return { camera, group: "finished" as const, reason: "EXIF: dedicated camera" };
  // Phone-native sizes (12MP 4032x3024 and friends) with no EXIF still lean jobsite.
  const long = Math.max(width ?? 0, height ?? 0);
  const short = Math.min(width ?? 0, height ?? 0);
  const ratio = short ? long / short : 0;
  if ([4032, 4000, 3264, 4624, 4080].includes(long) && Math.abs(ratio - 4 / 3) < 0.02) {
    return { camera, group: "jobsite" as const, reason: "phone-native resolution, no EXIF" };
  }
  if ((height ?? 0) > (width ?? 0) && ratio > 1.7) {
    return { camera, group: "jobsite" as const, reason: "tall portrait (phone) aspect" };
  }
  return { camera, group: "finished" as const, reason: "default (no phone signals)" };
}

async function fetchWithTimeout(url: string, ms = 15000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, {
      signal: ctrl.signal,
      headers: { "user-agent": "Mozilla/5.0 (JM Kelley site migration script)" },
    });
  } finally {
    clearTimeout(t);
  }
}

async function main() {
  try {
    const res = await fetchWithTimeout(ORIGIN, 10000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    console.error(
      `\nCannot reach ${ORIGIN} (${(err as Error).message}).\n` +
        "Not retrying. Download the assets manually into assets/legacy/<page>/ and run the\n" +
        "script again from a machine that can reach the site, or hand the files over.\n",
    );
    process.exit(2);
  }

  await mkdir(OUT_DIR, { recursive: true });
  const manifestPath = path.join(OUT_DIR, "manifest.json");
  const previous: LegacyImage[] = existsSync(manifestPath)
    ? (JSON.parse(await readFile(manifestPath, "utf8")).images ?? [])
    : [];
  const reviewed = new Map(previous.filter((p) => p.reviewed).map((p) => [p.originalUrl, p]));

  const images: LegacyImage[] = [];
  const failures: string[] = [];

  for (const [pagePath, page] of Object.entries(PAGES)) {
    process.stdout.write(`\n${pagePath} -> ${page}\n`);
    let html: string;
    try {
      const res = await fetchWithTimeout(ORIGIN + pagePath);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      html = await res.text();
    } catch (err) {
      failures.push(`${pagePath}: ${(err as Error).message}`);
      continue;
    }
    await writeFile(path.join(OUT_DIR, `${page}.txt`), extractText(html) + "\n");

    const dir = path.join(OUT_DIR, page);
    await mkdir(dir, { recursive: true });
    const used = new Set<string>();
    for (const url of extractImageUrls(html)) {
      const filename = filenameFor(url, used);
      try {
        const res = await fetchWithTimeout(url, 60000);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf = Buffer.from(await res.arrayBuffer());
        await writeFile(path.join(dir, filename), buf);
        const meta = await sharp(buf)
          .metadata()
          .catch(() => ({ width: undefined, height: undefined }));
        const width = meta.width ?? null;
        const height = meta.height ?? null;
        const c = await classify(buf, width, height).catch(() => ({
          camera: null,
          group: "finished" as const,
          reason: "unreadable metadata",
        }));
        const prior = reviewed.get(url);
        images.push({
          page,
          pagePath,
          originalUrl: url,
          filename,
          file: `assets/legacy/${page}/${filename}`,
          width,
          height,
          bytes: buf.length,
          camera: c.camera,
          group: prior?.group ?? c.group,
          groupReason: prior ? "manual review" : c.reason,
          reviewed: Boolean(prior),
        });
        process.stdout.write(`  ✓ ${filename} ${width}x${height} [${prior?.group ?? c.group}]\n`);
      } catch (err) {
        failures.push(`${url}: ${(err as Error).message}`);
      }
    }
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    source: ORIGIN,
    counts: {
      total: images.length,
      finished: images.filter((i) => i.group === "finished").length,
      jobsite: images.filter((i) => i.group === "jobsite").length,
    },
    failures,
    images,
  };
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  console.log(
    `\nSaved ${images.length} images. Manifest: ${path.relative(process.cwd(), manifestPath)}`,
  );
  if (failures.length) console.warn(`${failures.length} failures (listed in the manifest).`);
}

main();
