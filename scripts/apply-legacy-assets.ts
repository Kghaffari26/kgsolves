/**
 * Copies scraped legacy photos into /public and points the fallback project JSON at them,
 * replacing the generated placeholders.
 *
 *   npm run scrape          # first, from a machine that can reach jmkelleyinc.com
 *   (review assets/legacy/manifest.json: fix "group", set "reviewed": true)
 *   npm run legacy:apply
 *
 * Per project page: the first "finished" image becomes the hero, the rest the gallery (max 12),
 * and "jobsite" images become framing photos. When a project has both, the first jobsite photo
 * is paired with the first gallery photo for the before/after slider.
 *
 * Alt text is generated from the project name. Review it (TODO(client) in CONTENT_TODO.md).
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import type { LegacyImage } from "./scrape-current-site";
import type { ImageAsset, Project } from "../src/lib/types";

const ROOT = process.cwd();
const manifestPath = path.join(ROOT, "assets", "legacy", "manifest.json");
const projectsPath = path.join(ROOT, "src", "content", "fallback", "projects.json");

async function writeWeb(src: string, dest: string, maxWidth: number) {
  await mkdir(path.dirname(dest), { recursive: true });
  const info = await sharp(src)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(dest);
  return { width: info.width, height: info.height };
}

async function main() {
  if (!existsSync(manifestPath)) {
    console.error("No assets/legacy/manifest.json. Run `npm run scrape` first.");
    process.exit(1);
  }
  const { images } = JSON.parse(await readFile(manifestPath, "utf8")) as { images: LegacyImage[] };
  const projects = JSON.parse(await readFile(projectsPath, "utf8")) as Project[];
  const unreviewed = images.filter((i) => !i.reviewed).length;
  if (unreviewed)
    console.warn(`⚠ ${unreviewed} images have not been reviewed (grouping is a heuristic).`);

  for (const project of projects) {
    const mine = images.filter((i) => i.page === project.slug);
    if (!mine.length) {
      console.log(`- ${project.slug}: no legacy images, keeping placeholders`);
      continue;
    }
    const finished = mine.filter((i) => i.group === "finished");
    const jobsite = mine.filter((i) => i.group === "jobsite");
    const dir = path.join(ROOT, "public", "images", "projects", project.slug);
    const url = (f: string) => `/images/projects/${project.slug}/${f}`;
    const name = `${project.title}, ${project.location}`;

    const make = async (
      img: LegacyImage,
      file: string,
      alt: string,
      width: number,
    ): Promise<ImageAsset> => {
      const size = await writeWeb(path.join(ROOT, img.file), path.join(dir, file), width);
      return { src: url(file), alt, ...size, kind: img.group };
    };

    if (finished[0])
      project.heroImage = await make(finished[0], "hero.jpg", `${name} — finished exterior`, 2560);
    const gallery: ImageAsset[] = [];
    for (const [i, img] of finished.slice(1, 13).entries()) {
      gallery.push(
        await make(
          img,
          `gallery-${String(i + 1).padStart(2, "0")}.jpg`,
          `${name} — finished photo ${i + 1}`,
          2000,
        ),
      );
    }
    if (gallery.length) project.gallery = gallery;
    const framing: ImageAsset[] = [];
    for (const [i, img] of jobsite.slice(0, 8).entries()) {
      framing.push(
        await make(
          img,
          `framing-${String(i + 1).padStart(2, "0")}.jpg`,
          `${name} — under construction, photo ${i + 1}`,
          2000,
        ),
      );
    }
    project.gallery = [...project.gallery, ...framing];
    const after = gallery[0] ?? (finished[0] ? project.heroImage : null);
    project.beforeAfter =
      framing[0] && after ? [{ label: "Framing to finished", before: framing[0], after }] : [];
    console.log(`✓ ${project.slug}: ${finished.length} finished, ${jobsite.length} jobsite`);
  }

  await writeFile(projectsPath, JSON.stringify(projects, null, 2) + "\n");
  console.log("Updated src/content/fallback/projects.json. Review the generated alt text.");
}

main();
