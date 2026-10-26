import { defineField, defineType } from "sanity";

export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  description: "Real client quotes only, with the client's permission.",
  fields: [
    defineField({ name: "quote", type: "text", rows: 4, validation: (r) => r.required() }),
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "context",
      type: "string",
      description: "e.g. “Homeowner, Corona del Mar”",
    }),
    defineField({ name: "project", type: "reference", to: [{ type: "project" }] }),
    defineField({
      name: "permission",
      title: "Client approved publishing this quote",
      type: "boolean",
      validation: (r) =>
        r.required().custom((v) => (v ? true : "Get the client's permission first.")),
    }),
  ],
  preview: { select: { title: "name", subtitle: "quote" } },
});
