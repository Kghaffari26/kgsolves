/**
 * Builds the placeholder hero loop: a slow Ken Burns pan across finished photos.
 *
 *   npm run video:hero                       # uses the project hero images
 *   npm run video:hero -- a.jpg b.jpg c.jpg  # or any photos you pass
 *
 * Output: public/video/hero-placeholder.mp4 (H.264, -preset veryfast, CRF 26, 1080p, no audio)
 *         public/video/hero-placeholder.webm (VP9, same picture)
 * Budget: 4 MB or less each. Requires ffmpeg on PATH (winget install Gyan.FFmpeg on Windows).
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SECONDS_PER_SHOT = 5;
const FADE = 1;
const FPS = 30;

const args = process.argv.slice(2);
const inputs = (
  args.length
    ? args
    : ["4-fairway-point", "2000-east-oceanfront", "1418-balboa-blvd", "441-445-m-street"].map((s) =>
        path.join("public", "images", "projects", s, "hero.jpg"),
      )
).map((p) => path.resolve(ROOT, p));

for (const p of inputs) {
  if (!existsSync(p)) {
    console.error(`Missing input: ${p}`);
    process.exit(1);
  }
}

const outDir = path.join(ROOT, "public", "video");
mkdirSync(outDir, { recursive: true });

const frames = SECONDS_PER_SHOT * FPS;
const shots = inputs.map((_, i) => {
  // Alternate zoom-in and zoom-out so the cut never feels repetitive.
  const zoom = i % 2 === 0 ? `min(1+0.0008*on,1.12)` : `max(1.12-0.0008*on,1)`;
  return (
    `[${i}:v]scale=3840:2160:force_original_aspect_ratio=increase,crop=3840:2160,` +
    `zoompan=z='${zoom}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=1920x1080:fps=${FPS},` +
    `setsar=1,format=yuv420p[v${i}]`
  );
});
const fades: string[] = [];
let prev = "v0";
for (let i = 1; i < inputs.length; i++) {
  const out = i === inputs.length - 1 ? "out" : `x${i}`;
  fades.push(
    `[${prev}][v${i}]xfade=transition=fade:duration=${FADE}:offset=${i * (SECONDS_PER_SHOT - FADE)}[${out}]`,
  );
  prev = out;
}
const filter = [...shots, ...fades].join(";");
const map = inputs.length > 1 ? "[out]" : "[v0]";
const inputArgs = inputs.flatMap((p) => ["-i", p]);

function run(outFile: string, codec: string[]) {
  const res = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-loglevel",
      "error",
      ...inputArgs,
      "-filter_complex",
      filter,
      "-map",
      map,
      "-an",
      ...codec,
      outFile,
    ],
    { stdio: "inherit" },
  );
  if (res.status !== 0) {
    console.error(`ffmpeg failed for ${outFile}`);
    process.exit(res.status ?? 1);
  }
  const mb = statSync(outFile).size / 1024 / 1024;
  console.log(
    `${path.relative(ROOT, outFile)}  ${mb.toFixed(2)} MB${mb > 4 ? "  ⚠ over 4 MB budget" : ""}`,
  );
}

run(path.join(outDir, "hero-placeholder.mp4"), [
  "-c:v",
  "libx264",
  "-preset",
  "veryfast",
  "-crf",
  "26",
  "-pix_fmt",
  "yuv420p",
  "-movflags",
  "+faststart",
]);
run(path.join(outDir, "hero-placeholder.webm"), [
  "-c:v",
  "libvpx-vp9",
  "-crf",
  "40",
  "-b:v",
  "0",
  "-deadline",
  "good",
  "-cpu-used",
  "4",
  "-row-mt",
  "1",
]);
