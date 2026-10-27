/**
 * Imports the local fallback content (and its images) into Sanity.
 *
 *   npm run seed:sanity              # create or replace seeded documents
 *   npm run seed:sanity -- --dry-run # print what would be written
 *
 * Needs NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET and SANITY_API_WRITE_TOKEN
 * (an Editor token from sanity.io/manage → API → Tokens), read from .env.local.
 *
 * Documents get stable IDs (project-<slug>, service-<slug>, siteSettings), so re-running updates
 * them in place. Images are uploaded from /public (run `npm run legacy:apply` first so real
 * photos are used; placeholders are uploaded with a warning). Draft journal outlines are created
 * as Sanity drafts with no publish date, so they never appear on the site.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { createClient, type SanityClient } from "@sanity/client";
import projects from "../src/content/fallback/projects.json";
import services from "../src/content/fallback/services.json";
import settings from "../src/content/fallback/siteSettings.json";
import posts from "../src/content/fallback/posts.json";
import type { ImageAsset, PostBlock, Project, Service } from "../src/lib/types";

for (const f of [".env.local", ".env"]) {
  if (existsSync(f)) process.loadEnvFile(f);
}

const dryRun = process.argv.includes("--dry-run");
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!dryRun && (!projectId || !token)) {
  console.error(
    "Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN in .env.local first.",
  );
  process.exit(1);
}

const client: SanityClient | null = dryRun
  ? null
  : createClient({ projectId, dataset, token, apiVersion: "2025-10-01", useCdn: false });

const uploaded = new Map<string, string>();
let placeholderCount = 0;

const key = () => randomUUID().slice(0, 12);

async function image(img: ImageAsset | null | undefined) {
  if (!img) return undefined;
  if (img.placeholder) placeholderCount++;
  const file = path.join(process.cwd(), "public", img.src);
  let assetId = uploaded.get(file);
  if (!assetId) {
    if (dryRun || !client) assetId = `image-dryrun-${uploaded.size}`;
    else {
      const asset = await client.assets.upload("image", readFileSync(file), {
        filename: path.basename(file),
      });
      assetId = asset._id;
    }
    uploaded.set(file, assetId);
  }
  return {
    _type: "imageWithAlt",
    asset: { _type: "reference", _ref: assetId },
    alt: img.alt,
    kind: img.kind ?? "finished",
  };
}

async function projectDoc(p: Project) {
  return {
    _id: `project-${p.slug}`,
    _type: "project",
    title: p.title,
    slug: { _type: "slug", current: p.slug },
    location: p.location,
    city: p.city,
    type: p.type,
    typeConfirmed: p.typeConfirmed,
    summary: p.summary,
    specs: p.specs,
    year: p.year ?? undefined,
    role: p.role ?? undefined,
    scope: p.scope ?? undefined,
    architect: p.architect ?? undefined,
    featured: p.featured,
    order: p.order,
    heroImage: await image(p.heroImage),
    gallery: await Promise.all(p.gallery.map(async (g) => ({ _key: key(), ...(await image(g)) }))),
    beforeAfter: await Promise.all(
      p.beforeAfter.map(async (b) => ({
        _key: key(),
        _type: "pair",
        label: b.label,
        before: await image(b.before),
        after: await image(b.after),
      })),
    ),
    story: {
      brief: p.story.brief ?? undefined,
      build: p.story.build ?? undefined,
      result: p.story.result ?? undefined,
    },
  };
}

async function serviceDoc(s: Service) {
  const withKeys = <T extends object>(list: T[], _type: string) =>
    list.map((x) => ({ _key: key(), _type, ...x }));
  return {
    _id: `service-${s.slug}`,
    _type: "service",
    title: s.title,
    slug: { _type: "slug", current: s.slug },
    summary: s.summary,
    intro: s.intro,
    heroImage: await image(s.heroImage),
    included: withKeys(s.included, "included"),
    process: withKeys(s.process, "step"),
    faqs: withKeys(
      s.faqs.map((f) => ({ question: f.question, answer: f.answer ?? undefined })),
      "faq",
    ),
    relatedTypes: s.relatedTypes,
    order: s.order,
  };
}

function toPortableText(blocks: PostBlock[]) {
  const span = (text: string) => [{ _type: "span", _key: key(), text, marks: [] }];
  return blocks.flatMap((b) => {
    if (b._type === "heading")
      return [{ _type: "block", _key: key(), style: "h2", markDefs: [], children: span(b.text) }];
    if (b._type === "paragraph")
      return [
        { _type: "block", _key: key(), style: "normal", markDefs: [], children: span(b.text) },
      ];
    return b.items.map((t) => ({
      _type: "block",
      _key: key(),
      style: "normal",
      listItem: "bullet",
      level: 1,
      markDefs: [],
      children: span(t),
    }));
  });
}

async function main() {
  const docs: Record<string, unknown>[] = [];
  docs.push({
    _id: "siteSettings",
    _type: "siteSettings",
    ...settings,
    // Video files are uploaded in the Studio (or via clips:apply + commit), not seeded.
    heroVideo: undefined,
    hours: settings.hours.map((h) => ({ _key: key(), _type: "hoursRow", ...h })),
    social: settings.social.map((s) => ({
      _key: key(),
      _type: "socialLink",
      label: s.label,
      url: s.url ?? undefined,
    })),
    stats: settings.stats.map((s) => ({
      _key: key(),
      _type: "stat",
      label: s.label,
      value: s.value ?? undefined,
      verified: s.verified,
    })),
  });
  for (const p of projects as Project[]) docs.push(await projectDoc(p));
  for (const s of services as Service[]) docs.push(await serviceDoc(s));
  for (const p of posts) {
    docs.push({
      _id: `drafts.post-${p.slug}`,
      _type: "post",
      title: p.title,
      slug: { _type: "slug", current: p.slug },
      excerpt: p.excerpt,
      body: toPortableText(p.body as PostBlock[]),
    });
  }

  if (dryRun || !client) {
    for (const d of docs) console.log(`would write ${d._id}`);
  } else {
    const tx = client.transaction();
    docs.forEach((d) => tx.createOrReplace(d as { _id: string; _type: string }));
    await tx.commit();
    console.log(
      `Wrote ${docs.length} documents and ${uploaded.size} images to ${projectId}/${dataset}.`,
    );
  }
  if (placeholderCount) {
    console.warn(
      `⚠ ${placeholderCount} image references are generated placeholders. Run "npm run legacy:apply" and seed again, or replace them in the Studio.`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
