import { defineField, defineType } from "sanity";
import { orderRankField } from "./shared";

export const teamMember = defineType({
  name: "teamMember",
  title: "Team member",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "role", type: "string", validation: (r) => r.required() }),
    defineField({ name: "bio", type: "text", rows: 4 }),
    defineField({ name: "photo", type: "imageWithAlt" }),
    defineField({ name: "founder", type: "boolean", initialValue: false }),
    orderRankField(),
  ],
  preview: { select: { title: "name", subtitle: "role", media: "photo" } },
});
