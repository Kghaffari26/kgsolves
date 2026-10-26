import { defineArrayMember, defineField, defineType } from "sanity";
import { orderRankField } from "./shared";

const item = (name: string) =>
  defineArrayMember({
    type: "object",
    name,
    fields: [
      defineField({ name: "title", type: "string", validation: (r) => r.required() }),
      defineField({ name: "body", type: "text", rows: 3 }),
    ],
  });

export const service = defineType({
  name: "service",
  title: "Service",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title" },
      validation: (r) => r.required(),
    }),
    defineField({ name: "summary", type: "text", rows: 2, validation: (r) => r.required() }),
    defineField({ name: "intro", type: "text", rows: 4 }),
    defineField({ name: "heroImage", type: "imageWithAlt", validation: (r) => r.required() }),
    defineField({
      name: "included",
      title: "What's included",
      type: "array",
      of: [item("included")],
    }),
    defineField({ name: "process", type: "array", of: [item("step")] }),
    defineField({
      name: "faqs",
      title: "FAQ",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "faq",
          fields: [
            defineField({ name: "question", type: "string", validation: (r) => r.required() }),
            defineField({ name: "answer", type: "text", rows: 4 }),
          ],
        }),
      ],
    }),
    defineField({
      name: "relatedTypes",
      title: "Related project types",
      type: "array",
      of: [{ type: "string" }],
      options: { list: ["new-home", "remodel", "adu", "multi-unit", "commercial"] },
    }),
    defineField({ name: "video", title: "Video slot", type: "videoEmbed" }),
    orderRankField(),
  ],
  orderings: [{ title: "Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
});
