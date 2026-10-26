import { defineArrayMember, defineField, defineType } from "sanity";

export const post = defineType({
  name: "post",
  title: "Journal post",
  type: "document",
  description: "Posts stay unpublished on the site until they have a publish date that has passed.",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "excerpt",
      type: "text",
      rows: 3,
      validation: (r) => r.required().max(240),
    }),
    defineField({
      name: "publishedAt",
      type: "datetime",
      description: "Leave empty to keep the post as a draft.",
    }),
    defineField({ name: "heroImage", type: "imageWithAlt" }),
    defineField({
      name: "body",
      type: "array",
      of: [defineArrayMember({ type: "block" }), defineArrayMember({ type: "imageWithAlt" })],
    }),
  ],
  preview: { select: { title: "title", subtitle: "publishedAt", media: "heroImage" } },
});
