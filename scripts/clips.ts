/**
 * Real photos → subtle motion clips with Runway (image-to-video), reviewed before they go live.
 *
 *   npm run clips:plan                 # pick photos + prompts → assets/clips/plan.json
 *   npm run clips:generate             # dry run: lists clips and the estimated cost
 *   npm run clips:generate:confirm     # calls Runway, saves review copies to assets/clips/review/
 *   (watch each review clip; in plan.json set "status": "approved" or "rejected")
 *   npm run clips:apply                # encodes approved clips into /public/video and wires them in
 *
 * Needs RUNWAYML_API_SECRET in .env.local (runwayml.com → API → keys; usage is billed per
 * second of video) and ffmpeg on PATH.
 *
 * Guardrails:
 *  - Only real photographs are animated. Generated "Photo pending" placeholders are refused,
 *    so no clip can show a house JM Kelley didn't build.
 *  - Prompts ask for camera movement and light only, never new or changed architecture.
 *    Generative video can still invent details (extra windows, warped rooflines), which is why
 *    nothing is published until you approve it.
 *
 * Runway API (v1): POST /v1/image_to_video, then poll GET /v1/tasks/{id}. If Runway has changed
 * the API since this was written, the script stops with the server's error message rather than
 * guessing. Check https://docs.dev.runwayml.com and adjust RUNWAY below.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync, createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { finished } from "node:stream/promises";
import path from "node:path";
import sharp from "sharp";
import { encodeLoop } from "./lib/encode-loop";
import type { ImageAsset, Project, SiteSettings } from "../src/lib/types";

for (const f of [".env.local", ".env"]) if (existsSync(f)) process.loadEnvFile(f);

const ROOT = process.cwd();
const PLAN = path.join(ROOT, "assets", "clips", "plan.json");
const REVIEW = path.join(ROOT, "assets", "clips", "review");
const PROJECTS = path.join(ROOT, "src", "content", "fallback", "projects.json");
const SETTINGS = path.join(ROOT, "src", "content", "fallback", "siteSettings.json");

const RUNWAY = {
  // RUNWAY_API_BASE overrides for testing against a mock server.
  base: process.env.RUNWAY_API_BASE || "https://api.dev.runwayml.com/v1",
  version: "2024-11-06",
  model: "gen4_turbo",
  seconds: 5,
  /** Approximate list price for gen4_turbo; check your plan. */
  usdPerSecond: 0.05,
};

type Target = "home" | `project:${string}:hero` | `project:${string}:preview`;
type Clip = {
  id: string;
  /** where the clip is used; one clip can serve several slots (e.g. homepage + case study) */
  targets: Target[];
  image: string;
  ratio: "1280:720" | "832:1104";
  prompt: string;
  status: "planned" | "generated" | "approved" | "rejected" | "applied";
  taskId?: string;
  raw?: string;
  error?: string;
};
type Plan = { clips: Clip[] };

const KEEP_ARCHITECTURE =
  "The building stays exactly as photographed: do not add, remove or change any windows, doors, walls, rooflines, railings, landscaping, people, vehicles or text. Photorealistic, no warping, no morphing.";

const PROMPTS = {
  hero: `Very slow, steady cinematic push-in toward the house, as if on a dolly. Natural late-afternoon light shifts subtly; only the sky, water and foliage move gently. ${KEEP_ARCHITECTURE}`,
  preview: `Slow, smooth lateral camera drift from left to right with a slight parallax. Calm natural light. ${KEEP_ARCHITECTURE}`,
};

const readJson = <T>(f: string): T => JSON.parse(readFileSync(f, "utf8")) as T;
const writeJson = (f: string, d: unknown) => writeFileSync(f, JSON.stringify(d, null, 2) + "\n");

function findImage(src: string): ImageAsset | undefined {
  for (const p of readJson<Project[]>(PROJECTS)) {
    for (const img of [p.heroImage, ...p.gallery]) if (img.src === src) return img;
  }
}

function isRealPhoto(src: string) {
  const img = findImage(src);
  return Boolean(img && !img.placeholder && existsSync(path.join(ROOT, "public", src)));
}

// ---------------------------------------------------------------------------- plan

function plan() {
  const existing = existsSync(PLAN) ? readJson<Plan>(PLAN) : { clips: [] };
  const have = new Set(existing.clips.map((c) => c.id));
  const projects = readJson<Project[]>(PROJECTS);
  const skipped: string[] = [];
  const add = (c: Clip) => {
    if (have.has(c.id)) return;
    if (!isRealPhoto(c.image)) return void skipped.push(`${c.id} (${c.image} is a placeholder)`);
    // Same photo, same framing: reuse one clip rather than paying for it twice.
    const twin = existing.clips.find(
      (x) => x.image === c.image && x.ratio === c.ratio && x.status === "planned",
    );
    if (twin) return void twin.targets.push(...c.targets.filter((t) => !twin.targets.includes(t)));
    existing.clips.push(c);
    have.add(c.id);
  };

  const home = projects.find((p) => p.slug === "4-fairway-point") ?? projects[0];
  add({
    id: "home-hero",
    targets: ["home"],
    image: home.heroImage.src,
    ratio: "1280:720",
    prompt: PROMPTS.hero,
    status: "planned",
  });
  for (const p of projects) {
    add({
      id: `${p.slug}-hero`,
      targets: [`project:${p.slug}:hero`],
      image: p.heroImage.src,
      ratio: "1280:720",
      prompt: PROMPTS.hero,
      status: "planned",
    });
    const previewSrc = p.gallery.find((g) => g.kind !== "jobsite")?.src ?? p.heroImage.src;
    add({
      id: `${p.slug}-preview`,
      targets: [`project:${p.slug}:preview`],
      image: previewSrc,
      ratio: "832:1104",
      prompt: PROMPTS.preview,
      status: "planned",
    });
  }
  mkdirSync(path.dirname(PLAN), { recursive: true });
  writeJson(PLAN, existing);
  console.log(
    `Plan: ${existing.clips.length} clips in assets/clips/plan.json. Edit prompts or remove entries before generating.`,
  );
  if (skipped.length) {
    console.log(
      `\nSkipped ${skipped.length} (not real photos yet; run npm run scrape and npm run legacy:apply first):`,
    );
    skipped.forEach((s) => console.log(`  - ${s}`));
  }
}

// ------------------------------------------------------------------------ generate

async function runway(pathname: string, init?: RequestInit) {
  const key = process.env.RUNWAYML_API_SECRET;
  if (!key) throw new Error("Set RUNWAYML_API_SECRET in .env.local");
  const res = await fetch(`${RUNWAY.base}${pathname}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      "X-Runway-Version": RUNWAY.version,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`Runway ${res.status} on ${pathname}: ${body.slice(0, 400)}`);
  return JSON.parse(body) as Record<string, unknown>;
}

async function promptImage(src: string, ratio: Clip["ratio"]) {
  const [w, h] = ratio.split(":").map(Number);
  const buf = await sharp(path.join(ROOT, "public", src))
    .rotate()
    .resize(w, h, { fit: "cover" })
    .jpeg({ quality: 88 })
    .toBuffer();
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

async function download(url: string, dest: string) {
  const res = await fetch(url);
  if (!res.ok || !res.body) throw new Error(`Download failed: HTTP ${res.status}`);
  mkdirSync(path.dirname(dest), { recursive: true });
  await finished(
    Readable.fromWeb(res.body as import("node:stream/web").ReadableStream).pipe(
      createWriteStream(dest),
    ),
  );
}

async function generate(yes: boolean, only?: string) {
  if (!existsSync(PLAN)) throw new Error("No plan yet. Run npm run clips:plan");
  const p = readJson<Plan>(PLAN);
  const todo = p.clips.filter((c) => c.status === "planned" && (!only || c.id === only));
  if (!todo.length) return void console.log("Nothing planned to generate.");

  for (const c of todo) {
    if (!isRealPhoto(c.image))
      throw new Error(`Refusing ${c.id}: ${c.image} is not a real photo (placeholder or missing).`);
  }
  const cost = todo.length * RUNWAY.seconds * RUNWAY.usdPerSecond;
  console.log(
    `${todo.length} clip(s) × ${RUNWAY.seconds}s with ${RUNWAY.model} ≈ $${cost.toFixed(2)} (approximate; check your Runway plan).`,
  );
  todo.forEach((c) =>
    console.log(`  - ${c.id}  ←  ${c.image}  (used for: ${c.targets.join(", ")})`),
  );
  if (!yes) return void console.log("\nDry run. Run npm run clips:generate:confirm to generate.");

  for (const c of todo) {
    try {
      console.log(`\n→ ${c.id}: submitting`);
      const task = await runway("/image_to_video", {
        method: "POST",
        body: JSON.stringify({
          model: RUNWAY.model,
          promptImage: await promptImage(c.image, c.ratio),
          promptText: c.prompt,
          ratio: c.ratio,
          duration: RUNWAY.seconds,
        }),
      });
      c.taskId = String(task.id);
      writeJson(PLAN, p);

      let state: Record<string, unknown> = {};
      for (let i = 0; i < 120; i++) {
        await new Promise((r) => setTimeout(r, 6000));
        state = await runway(`/tasks/${c.taskId}`);
        process.stdout.write(`  ${state.status}\r`);
        if (
          state.status === "SUCCEEDED" ||
          state.status === "FAILED" ||
          state.status === "CANCELLED"
        )
          break;
      }
      if (state.status !== "SUCCEEDED")
        throw new Error(
          `task ${state.status ?? "timed out"} ${JSON.stringify(state.failure ?? "")}`,
        );
      const url = (state.output as string[] | undefined)?.[0];
      if (!url) throw new Error("task succeeded but returned no output URL");

      c.raw = `assets/clips/raw/${c.id}.mp4`;
      await download(url, path.join(ROOT, c.raw));
      encodeLoop(path.join(ROOT, c.raw), path.join(REVIEW, c.id));
      c.status = "generated";
      delete c.error;
      console.log(`  ✓ review copy: assets/clips/review/${c.id}.mp4`);
    } catch (err) {
      c.error = (err as Error).message;
      console.error(`  ✗ ${c.id}: ${c.error}`);
      // Account-level problems (no credits, bad key, rate limit) will fail every clip the same
      // way: stop instead of submitting the rest.
      if (/credits|unauthori[sz]ed|invalid api key|Runway 40[13]|Runway 429/i.test(c.error)) {
        writeJson(PLAN, p);
        console.error(
          "\nStopped: this is an account problem, not a clip problem. Fix it (e.g. add API credits at\n" +
            "dev.runwayml.com → Billing) and run the same command again; finished clips are not redone.",
        );
        process.exitCode = 1;
        return;
      }
    }
    writeJson(PLAN, p);
  }
  const made = todo.filter((c) => c.status === "generated").length;
  if (!made) {
    console.error("\nNo clips were generated. See the errors above.");
    process.exitCode = 1;
    return;
  }
  console.log(
    `\n${made} of ${todo.length} clip(s) ready. Watch them in assets/clips/review/. In plan.json set "status" to "approved" or "rejected", then run npm run clips:apply.`,
  );
}

// --------------------------------------------------------------------------- apply

function apply() {
  const p = readJson<Plan>(PLAN);
  const projects = readJson<Project[]>(PROJECTS);
  const settings = readJson<SiteSettings>(SETTINGS);
  let n = 0;
  for (const c of p.clips.filter((x) => x.status === "approved")) {
    if (!c.raw || !existsSync(path.join(ROOT, c.raw))) {
      console.warn(`- ${c.id}: approved but no raw clip on disk; generate it first`);
      continue;
    }
    for (const target of c.targets) {
      const [, slug, slot] = target.split(":");
      const rel = target === "home" ? "video/home-hero" : `video/projects/${slug}/${slot}`;
      const project = target === "home" ? null : projects.find((x) => x.slug === slug);
      if (target !== "home" && !project) {
        console.warn(`- ${c.id}: no project "${slug}"`);
        continue;
      }
      const out = encodeLoop(path.join(ROOT, c.raw), path.join(ROOT, "public", rel));
      const src = { mp4: `/${rel}.mp4`, webm: `/${rel}.webm`, poster: `/${rel}.jpg` };
      if (!project) settings.heroVideo = src;
      else if (slot === "hero") project.heroVideo = src;
      else project.previewVideo = src.mp4;
      console.log(
        `✓ ${c.id} → public/${rel}.{mp4,webm,jpg}  (${out.mb.mp4.toFixed(2)} MB / ${out.mb.webm.toFixed(2)} MB)`,
      );
    }
    c.status = "applied";
    n++;
  }
  writeJson(PROJECTS, projects);
  writeJson(SETTINGS, settings);
  writeJson(PLAN, p);
  console.log(
    n
      ? `\nApplied ${n} clip(s). Run npm run seed:sanity to push them to Sanity, or commit public/video.`
      : "No approved clips to apply.",
  );
}

// ---------------------------------------------------------------------------- main

const [cmd, ...args] = process.argv.slice(2);
const onlyIdx = args.indexOf("--only");
const run =
  cmd === "plan"
    ? Promise.resolve(plan())
    : cmd === "generate"
      ? generate(args.includes("--yes"), onlyIdx >= 0 ? args[onlyIdx + 1] : undefined)
      : cmd === "apply"
        ? Promise.resolve(apply())
        : Promise.reject(
            new Error("Usage: tsx scripts/clips.ts plan | generate [--yes] [--only <id>] | apply"),
          );
run.catch((err) => {
  console.error((err as Error).message);
  process.exit(1);
});
