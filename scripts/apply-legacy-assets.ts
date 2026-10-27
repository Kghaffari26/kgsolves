/**
 * Copies scraped legacy photos into /public and points the fallback content at them, replacing
 * the generated placeholders.
 *
 *   npm run scrape          # from a machine that can reach jmkelleyinc.com
 *   npm run legacy:apply    # dry run: prints what would go where
 *   npm run legacy:apply:confirm
 *
 * Rules (the scrape is noisy, so nothing is assumed):
 *  - Skipped: site chrome that appears on 3+ pages (logo, banner), images under 700px on their
 *    long side, spacer/placeholder files, and exact duplicates (same file contents).
 *  - A photo found on exactly one project page belongs to that project. A photo found on two
 *    project pages is ambiguous and is skipped until you say which project it belongs to.
 *  - Construction ("jobsite") photos that only appear on the homepage/services pages are real
 *    JM Kelley jobsite photos without a known project: they go to /images/site/ and become the
 *    Concrete & Framing page image.
 *  - Per-image overrides in assets/legacy/manifest.json (add the keys by hand):
 *      "project": "<slug>"   assign to a project (also resolves ambiguous photos)
 *      "exclude": true       never use this image
 *      "group": "finished" | "jobsite"
 *  - Each project's hero is its largest finished photo; the rest form the gallery. Projects with
 *    real photos lose all their placeholders (never a mix of real and generated images).
 *  - Alt text is generated from the project name; review it (CONTENT_TODO.md).
 */
import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import type { LegacyImage } from "./scrape-current-site";
import type { ImageAsset, Project, Service } from "../src/lib/types";

type Entry = LegacyImage & { project?: string; exclude?: boolean };

const ROOT = process.cwd();
const confirm = process.argv.includes("--confirm");
const manifestPath = path.join(ROOT, "assets", "legacy", "manifest.json");
const projectsPath = path.join(ROOT, "src", "content", "fallback", "projects.json");
const servicesPath = path.join(ROOT, "src", "content", "fallback", "services.json");

const MIN_LONG_SIDE = 700;
const NON_PROJECT_PAGES = new Set(["home", "portfolio", "services", "contact-us"]);
// Filenames that suggest the photo came from somewhere else; worth a rights check.
const THIRD_PARTY = [
  { re: /^\d{8,11}_[0-9a-f]{10}_[a-z0-9]+/i, why: "Flickr-style filename" },
  { re: /^(CV|NP|OC|PW|SB|LG|IG|SR|PF)\d{6,9}_/i, why: "MLS listing-photo filename" },
];

async function writeWeb(src: string, dest: string, maxWidth: number) {
  await mkdir(path.dirname(dest), { recursive: true });
  const info = await sharp(src)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(dest);
  return { width: info.width, height: info.height };
}

const area = (i: Entry) => (i.width ?? 0) * (i.height ?? 0);
const hashOf = (file: string) => createHash("sha1").update(readFileSync(file)).digest("hex");

async function main() {
  if (!existsSync(manifestPath)) {
    console.error("No assets/legacy/manifest.json. Run `npm run scrape` first.");
    process.exit(1);
  }
  const { images } = JSON.parse(await readFile(manifestPath, "utf8")) as { images: Entry[] };
  const projects = JSON.parse(await readFile(projectsPath, "utf8")) as Project[];
  const services = JSON.parse(await readFile(servicesPath, "utf8")) as Service[];
  const slugs = new Set(projects.map((p) => p.slug));
  const skipped: string[] = [];
  const warnings: string[] = [];

  // Group every manifest row by file contents, so one photo = one record with all its pages.
  type Photo = { key: string; rows: Entry[]; pages: Set<string>; best: Entry };
  const photos = new Map<string, Photo>();
  for (const row of images) {
    const file = path.join(ROOT, row.file);
    if (!existsSync(file)) continue;
    const key = hashOf(file);
    const ph = photos.get(key) ?? { key, rows: [], pages: new Set<string>(), best: row };
    ph.rows.push(row);
    ph.pages.add(row.page);
    if (area(row) > area(ph.best)) ph.best = row;
    photos.set(key, ph);
  }

  const byProject = new Map<string, Entry[]>();
  const siteJobsite: Entry[] = [];
  for (const ph of photos.values()) {
    const name = ph.best.filename;
    const override = ph.rows.find((r) => r.project || r.exclude || r.reviewed);
    const row: Entry = { ...ph.best, ...(override ?? {}) };
    if (row.exclude) {
      skipped.push(`${name}: excluded in manifest`);
      continue;
    }
    if (!row.project) {
      if (ph.pages.size >= 3) {
        skipped.push(`${name}: on ${ph.pages.size} pages (logo/banner); set "project" to use it`);
        continue;
      }
      if (/placeholder|spacer|transparent/i.test(name)) {
        skipped.push(`${name}: spacer image`);
        continue;
      }
      if (Math.max(row.width ?? 0, row.height ?? 0) < MIN_LONG_SIDE) {
        skipped.push(`${name}: too small (${row.width}x${row.height})`);
        continue;
      }
    }
    const tp = THIRD_PARTY.find((t) => t.re.test(name));
    if (tp) warnings.push(`${name}: ${tp.why}. Confirm JM Kelley has the rights to use it.`);

    const projectPages = [...ph.pages].filter((p) => slugs.has(p));
    if (row.project) {
      if (!slugs.has(row.project)) {
        skipped.push(`${name}: unknown project "${row.project}"`);
        continue;
      }
      byProject.set(row.project, [...(byProject.get(row.project) ?? []), row]);
    } else if (projectPages.length === 1) {
      byProject.set(projectPages[0], [...(byProject.get(projectPages[0]) ?? []), row]);
    } else if (projectPages.length > 1) {
      skipped.push(`${name}: on ${projectPages.join(" and ")}; set "project" to choose`);
    } else if (row.group === "jobsite" && [...ph.pages].every((p) => NON_PROJECT_PAGES.has(p))) {
      siteJobsite.push(row);
    } else {
      skipped.push(`${name}: only on ${[...ph.pages].join(", ")}; set "project" to use it`);
    }
  }

  // ------------------------------------------------------------------ report
  console.log(
    confirm
      ? "Applying:\n"
      : "Dry run (nothing written). Run npm run legacy:apply:confirm to apply.\n",
  );
  for (const p of projects) {
    const mine = byProject.get(p.slug) ?? [];
    const f = mine.filter((i) => i.group === "finished").length;
    console.log(
      `${mine.length ? "✓" : "-"} ${p.slug}: ${f} finished, ${mine.length - f} jobsite${mine.length ? "" : " (keeps placeholders)"}`,
    );
  }
  console.log(`✓ site jobsite photos (Concrete & Framing): ${siteJobsite.length}`);
  if (skipped.length) {
    console.log(`\nSkipped ${skipped.length}:`);
    skipped.forEach((s) => console.log(`  - ${s}`));
  }
  if (warnings.length) {
    console.log(`\n⚠ Rights check:`);
    warnings.forEach((w) => console.log(`  - ${w}`));
  }
  if (!confirm) return;

  // ------------------------------------------------------------------- write
  for (const project of projects) {
    const mine = byProject.get(project.slug);
    if (!mine?.length) continue;
    const dir = path.join(ROOT, "public", "images", "projects", project.slug);
    // Real photos replace the placeholders entirely: clear the folder first.
    await rm(dir, { recursive: true, force: true });
    const url = (f: string) => `/images/projects/${project.slug}/${f}`;
    const name = `${project.title}, ${project.location}`;
    const make = async (
      img: Entry,
      file: string,
      alt: string,
      width: number,
    ): Promise<ImageAsset> => {
      const size = await writeWeb(path.join(ROOT, img.file), path.join(dir, file), width);
      return { src: url(file), alt, ...size, kind: img.group };
    };

    const finished = mine.filter((i) => i.group === "finished").sort((a, b) => area(b) - area(a));
    const jobsite = mine.filter((i) => i.group === "jobsite");
    const heroSrc = finished[0] ?? jobsite[0];
    project.heroImage = await make(
      heroSrc,
      "hero.jpg",
      `${name}${heroSrc.group === "jobsite" ? " under construction" : ""}`,
      2560,
    );

    const gallery: ImageAsset[] = [];
    for (const [i, img] of finished.slice(1, 13).entries()) {
      gallery.push(
        await make(
          img,
          `gallery-${String(i + 1).padStart(2, "0")}.jpg`,
          `${name}, photo ${i + 2}`,
          2000,
        ),
      );
    }
    const framing: ImageAsset[] = [];
    for (const [i, img] of jobsite
      .filter((j) => j !== heroSrc)
      .slice(0, 8)
      .entries()) {
      framing.push(
        await make(
          img,
          `framing-${String(i + 1).padStart(2, "0")}.jpg`,
          `${name} under construction, photo ${i + 1}`,
          2000,
        ),
      );
    }
    project.gallery = [...gallery, ...framing];
    project.beforeAfter =
      framing[0] && finished[0]
        ? [{ label: "Framing to finished", before: framing[0], after: project.heroImage }]
        : [];
  }

  if (siteJobsite.length) {
    const site: ImageAsset[] = [];
    for (const [i, img] of siteJobsite.slice(0, 12).entries()) {
      const file = `jobsite-${String(i + 1).padStart(2, "0")}.jpg`;
      const size = await writeWeb(
        path.join(ROOT, img.file),
        path.join(ROOT, "public", "images", "site", file),
        2000,
      );
      site.push({
        src: `/images/site/${file}`,
        alt: `JM Kelley jobsite: concrete and framing work in progress, photo ${i + 1}`,
        ...size,
        kind: "jobsite",
      });
    }
    const cf = services.find((s) => s.slug === "concrete-framing");
    if (cf) cf.heroImage = site[0];
  }

  // Service pages borrow project images by path; give them the real photo's metadata and alt
  // text (or the new hero if that file no longer exists).
  const bySrc = new Map(
    projects.flatMap((p) => [p.heroImage, ...p.gallery].map((i) => [i.src, i] as const)),
  );
  for (const s of services) {
    const real = bySrc.get(s.heroImage.src);
    if (real) s.heroImage = real;
    else {
      const owner = projects.find((p) => s.heroImage.src.startsWith(`/images/projects/${p.slug}/`));
      if (owner && byProject.has(owner.slug)) s.heroImage = owner.heroImage;
    }
  }

  await writeFile(projectsPath, JSON.stringify(projects, null, 2) + "\n");
  await writeFile(servicesPath, JSON.stringify(services, null, 2) + "\n");
  console.log(
    "\nUpdated projects.json and services.json. Review the generated alt text, then run npm run dev.",
  );
}

main();
