import { defineField } from "sanity";

export const orderRankField = (group?: string) =>
  defineField({
    name: "order",
    type: "number",
    group,
    description: "Lower numbers show first.",
    initialValue: 100,
    validation: (r) => r.required(),
  });
