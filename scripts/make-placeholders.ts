/**
 * Generates stand-in JPEGs for every image in src/content/fallback/*.json that is marked
 * `"placeholder": true` and doesn't exist yet in /public. Pass --force to regenerate all.
 *
 *   npm run placeholders
 *
 * Placeholders are drawn as architectural elevations so layouts can be judged before the real
 * photos arrive. Each one is labelled "Photo pending" so it can't be mistaken for a real project.
 */
import { readdir, readFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

type Img = {
  src: string;
  width: number;
  height: number;
  kind?: string;
  placeholder?: boolean;
  alt: string;
};

const ROOT = process.cwd();
const FALLBACK = path.join(ROOT, "src", "content", "fallback");
const force = process.argv.includes("--force");

function collect(node: unknown, out: Img[]) {
  if (Array.isArray(node)) node.forEach((n) => collect(n, out));
  else if (node && typeof node === "object") {
    const o = node as Record<string, unknown>;
    if (typeof o.src === "string" && o.placeholder === true && typeof o.width === "number") {
      out.push(o as unknown as Img);
    }
    Object.values(o).forEach((v) => collect(v, out));
  }
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

function finishedSvg(w: number, h: number, seed: number, label: string) {
  const palettes = [
    ["#ECE8E0", "#D6D0C5", "#171917"],
    ["#E4E2DC", "#C9C4BA", "#171917"],
    ["#F0ECE4", "#D3CAB9", "#252724"],
    ["#E6E1D8", "#C2B8A6", "#2B2D29"],
  ];
  const [sky, ground, ink] = palettes[seed % palettes.length];
  const gy = h * (0.68 + ((seed >> 3) % 8) / 100);
  const hw = w * (0.46 + ((seed >> 5) % 18) / 100);
  const hx = (w - hw) / 2 + (((seed >> 7) % 20) - 10) * (w / 200);
  const floors = 2 + ((seed >> 9) % 2);
  const fh = h * 0.13;
  const top = gy - fh * floors;
  const stroke = Math.max(2, w / 700);
  const windows: string[] = [];
  for (let f = 0; f < floors; f++) {
    const cols = 3 + ((seed >> (11 + f)) % 3);
    for (let c = 0; c < cols; c++) {
      const ww = (hw / cols) * 0.6;
      const x = hx + (hw / cols) * c + (hw / cols - ww) / 2;
      const y = top + fh * f + fh * 0.22;
      windows.push(
        `<rect x="${x}" y="${y}" width="${ww}" height="${fh * 0.6}" fill="${ink}" fill-opacity="0.16" stroke="${ink}" stroke-width="${stroke}"/>`,
      );
    }
  }
  const roof =
    (seed >> 4) % 2
      ? `<path d="M${hx - hw * 0.06} ${top} L${hx + hw * 1.06} ${top}" stroke="${ink}" stroke-width="${stroke * 3}"/>`
      : `<path d="M${hx - hw * 0.05} ${top} L${hx + hw / 2} ${top - fh * 0.9} L${hx + hw * 1.05} ${top}" fill="none" stroke="${ink}" stroke-width="${stroke * 1.5}"/>`;
  const fs = Math.round(Math.max(18, w / 60));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky}"/><stop offset="1" stop-color="#FAF9F6"/></linearGradient>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${ground}"/><stop offset="1" stop-color="${ink}" stop-opacity="0.55"/></linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#s)"/>
  <circle cx="${w * 0.8}" cy="${h * 0.22}" r="${h * 0.07}" fill="#756452" fill-opacity="0.18"/>
  <rect x="${hx}" y="${top}" width="${hw}" height="${gy - top}" fill="#FAF9F6" fill-opacity="0.75" stroke="${ink}" stroke-width="${stroke}"/>
  ${windows.join("")}
  ${roof}
  <rect y="${gy}" width="${w}" height="${h - gy}" fill="url(#g)"/>
  <line x1="0" y1="${gy}" x2="${w}" y2="${gy}" stroke="${ink}" stroke-width="${stroke}"/>
  <text x="${w * 0.04}" y="${h - h * 0.05}" font-family="Helvetica, Arial, sans-serif" font-size="${fs}" fill="#FAF9F6" letter-spacing="${fs * 0.15}">PHOTO PENDING · ${esc(label.toUpperCase())}</text>
</svg>`;
}

function jobsiteSvg(w: number, h: number, seed: number, label: string) {
  const ink = "#171917";
  const timber = "#756452";
  const gy = h * 0.78;
  const stroke = Math.max(2, w / 600);
  const grid: string[] = [];
  const step = w / 24;
  for (let x = 0; x < w; x += step) grid.push(`<line x1="${x}" y1="0" x2="${x}" y2="${h}"/>`);
  for (let y = 0; y < h; y += step) grid.push(`<line x1="0" y1="${y}" x2="${w}" y2="${y}"/>`);
  const studs: string[] = [];
  const left = w * 0.12;
  const right = w * 0.88;
  const plateY = h * (0.3 + (seed % 10) / 100);
  const n = 14 + (seed % 6);
  for (let i = 0; i <= n; i++) {
    const x = left + ((right - left) / n) * i;
    studs.push(`<line x1="${x}" y1="${plateY}" x2="${x}" y2="${gy}"/>`);
  }
  const fs = Math.round(Math.max(18, w / 60));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="#ECE8E0"/>
  <g stroke="${ink}" stroke-opacity="0.07" stroke-width="1">${grid.join("")}</g>
  <rect x="0" y="${gy}" width="${w}" height="${h - gy}" fill="#A9A49B"/>
  <g stroke="${timber}" stroke-width="${stroke * 2.2}">${studs.join("")}
    <line x1="${left}" y1="${plateY}" x2="${right}" y2="${plateY}"/>
    <line x1="${left}" y1="${plateY - stroke * 3}" x2="${right}" y2="${plateY - stroke * 3}"/>
    <line x1="${left}" y1="${gy}" x2="${right}" y2="${gy}"/>
  </g>
  <path d="M${left - w * 0.03} ${plateY} L${w / 2} ${plateY - h * 0.2} L${right + w * 0.03} ${plateY}" fill="none" stroke="${timber}" stroke-width="${stroke * 2}"/>
  <text x="${w * 0.04}" y="${h - h * 0.06}" font-family="Helvetica, Arial, sans-serif" font-size="${fs}" fill="${ink}" letter-spacing="${fs * 0.15}">JOBSITE PHOTO PENDING · ${esc(label.toUpperCase())}</text>
</svg>`;
}

async function main() {
  const files = (await readdir(FALLBACK)).filter((f) => f.endsWith(".json"));
  const images: Img[] = [];
  for (const f of files)
    collect(JSON.parse(await readFile(path.join(FALLBACK, f), "utf8")), images);

  const seen = new Set<string>();
  let made = 0;
  for (const img of images) {
    if (seen.has(img.src)) continue;
    seen.add(img.src);
    const out = path.join(ROOT, "public", img.src);
    if (existsSync(out) && !force) continue;
    await mkdir(path.dirname(out), { recursive: true });
    const seed = hash(img.src);
    const label = img.src.split("/").slice(-2, -1)[0]?.replace(/-/g, " ") ?? "";
    const svg =
      img.kind === "jobsite"
        ? jobsiteSvg(img.width, img.height, seed, label)
        : finishedSvg(img.width, img.height, seed, label);
    await sharp(Buffer.from(svg)).jpeg({ quality: 72, mozjpeg: true }).toFile(out);
    made++;
  }
  console.log(`Placeholders: ${made} written, ${seen.size - made} already present.`);
}

main();
