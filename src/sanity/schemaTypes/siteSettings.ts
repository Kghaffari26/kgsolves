import { defineArrayMember, defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({
      name: "companyName",
      type: "string",
      initialValue: "JM Kelley Inc.",
      validation: (r) => r.required(),
    }),
    defineField({ name: "legalName", type: "string" }),
    defineField({ name: "phone", type: "string", validation: (r) => r.required() }),
    defineField({ name: "email", type: "string" }),
    defineField({ name: "streetAddress", type: "string" }),
    defineField({ name: "city", type: "string" }),
    defineField({ name: "region", type: "string" }),
    defineField({ name: "postalCode", type: "string" }),
    defineField({
      name: "hours",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "hoursRow",
          fields: [
            defineField({ name: "days", type: "string" }),
            defineField({ name: "hours", type: "string" }),
          ],
        }),
      ],
    }),
    defineField({
      name: "openingHours",
      title: "Opening hours (schema.org)",
      type: "array",
      of: [{ type: "string" }],
      description: "e.g. Mo-Fr 08:00-17:00",
    }),
    defineField({
      name: "license",
      type: "object",
      fields: [
        defineField({ name: "number", type: "string" }),
        defineField({ name: "board", type: "string", initialValue: "CSLB" }),
        defineField({
          name: "verified",
          title: "Verified on cslb.ca.gov",
          type: "boolean",
          initialValue: false,
        }),
      ],
    }),
    defineField({ name: "insuranceStatement", type: "text", rows: 2 }),
    defineField({
      name: "social",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "socialLink",
          fields: [
            defineField({ name: "label", type: "string" }),
            defineField({ name: "url", type: "url" }),
          ],
        }),
      ],
    }),
    defineField({
      name: "stats",
      type: "array",
      description: "Homepage stats. A stat only shows on the site once “Verified” is on.",
      of: [
        defineArrayMember({
          type: "object",
          name: "stat",
          fields: [
            defineField({ name: "label", type: "string", validation: (r) => r.required() }),
            defineField({ name: "value", type: "string" }),
            defineField({ name: "verified", type: "boolean", initialValue: false }),
          ],
          preview: { select: { title: "label", subtitle: "value" } },
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});
