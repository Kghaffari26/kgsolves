import { defineArrayMember, defineField, defineType } from "sanity";
import { orderRankField } from "./shared";

const cities = [
  { title: "Newport Beach", value: "newport-beach" },
  { title: "Newport Coast", value: "newport-coast" },
  { title: "Corona del Mar", value: "corona-del-mar" },
  { title: "Costa Mesa", value: "costa-mesa" },
  { title: "Huntington Beach", value: "huntington-beach" },
];

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  groups: [
    { name: "main", title: "Main", default: true },
    { name: "media", title: "Media" },
    { name: "story", title: "Story" },
  ],
  fields: [
    defineField({ name: "title", type: "string", group: "main", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      group: "main",
      options: { source: "title", maxLength: 80 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "location",
      title: "Location label",
      type: "string",
      group: "main",
      description: "Shown under the title, e.g. “Newport Coast”.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "city",
      type: "string",
      group: "main",
      options: { list: cities },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "type",
      type: "string",
      group: "main",
      options: {
        list: [
          { title: "New home", value: "new-home" },
          { title: "Remodel", value: "remodel" },
          { title: "ADU", value: "adu" },
          { title: "Multi-unit", value: "multi-unit" },
          { title: "Commercial", value: "commercial" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "typeConfirmed",
      title: "Type confirmed by JM Kelley",
      type: "boolean",
      group: "main",
      initialValue: false,
    }),
    defineField({
      name: "summary",
      type: "text",
      rows: 2,
      group: "main",
      validation: (r) => r.required().max(200),
    }),
    defineField({
      name: "specs",
      type: "object",
      group: "main",
      options: { columns: 3 },
      fields: [
        defineField({ name: "beds", type: "number" }),
        defineField({ name: "baths", type: "number" }),
        defineField({ name: "sqft", title: "Square feet", type: "number" }),
      ],
    }),
    defineField({ name: "year", type: "string", group: "main" }),
    defineField({ name: "role", title: "JM Kelley's role", type: "string", group: "main" }),
    defineField({ name: "scope", type: "string", group: "main" }),
    defineField({ name: "architect", type: "string", group: "main" }),
    defineField({ name: "featured", type: "boolean", group: "main", initialValue: false }),
    orderRankField("main"),

    defineField({
      name: "heroImage",
      type: "imageWithAlt",
      group: "media",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "heroVideo",
      title: "Hero video loop",
      type: "object",
      group: "media",
      description: "Optional muted loop. Compress to 4 MB or less.",
      fields: [
        defineField({ name: "mp4", type: "file", options: { accept: "video/mp4" } }),
        defineField({ name: "webm", type: "file", options: { accept: "video/webm" } }),
      ],
    }),
    defineField({
      name: "previewVideo",
      title: "Card hover preview",
      type: "file",
      group: "media",
      options: { accept: "video/mp4" },
    }),
    defineField({
      name: "gallery",
      type: "array",
      group: "media",
      of: [defineArrayMember({ type: "imageWithAlt" })],
      options: { layout: "grid" },
    }),
    defineField({
      name: "beforeAfter",
      title: "Before / after pairs",
      type: "array",
      group: "media",
      of: [
        defineArrayMember({
          type: "object",
          name: "pair",
          fields: [
            defineField({ name: "label", type: "string", initialValue: "Framing to finished" }),
            defineField({
              name: "before",
              title: "Framing (before)",
              type: "imageWithAlt",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "after",
              title: "Finished (after)",
              type: "imageWithAlt",
              validation: (r) => r.required(),
            }),
          ],
          preview: { select: { title: "label", media: "after" } },
        }),
      ],
    }),
    defineField({ name: "walkthrough", type: "videoEmbed", group: "media" }),

    defineField({
      name: "story",
      type: "object",
      group: "story",
      fields: [
        defineField({ name: "brief", title: "The brief", type: "text", rows: 6 }),
        defineField({ name: "build", title: "The build", type: "text", rows: 6 }),
        defineField({ name: "result", title: "The result", type: "text", rows: 6 }),
      ],
    }),
  ],
  orderings: [{ title: "Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title", subtitle: "location", media: "heroImage" } },
});
