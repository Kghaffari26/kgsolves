import { defineField, defineType } from "sanity";

/** Every image on the site goes through this type, so alt text is always required. */
export const imageWithAlt = defineType({
  name: "imageWithAlt",
  title: "Image",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "Alt text",
      type: "string",
      description:
        "Describe what's in the photo for people who can't see it (e.g. “Two-storey white stucco home with a rooftop deck at dusk”).",
      validation: (r) => r.required().min(8).error("Alt text is required for every image."),
    }),
    defineField({
      name: "kind",
      title: "Photo type",
      type: "string",
      options: {
        list: [
          { title: "Finished (professional)", value: "finished" },
          { title: "Jobsite (construction)", value: "jobsite" },
        ],
        layout: "radio",
      },
      initialValue: "finished",
    }),
  ],
});

export const videoEmbed = defineType({
  name: "videoEmbed",
  title: "Video (Mux or Vimeo)",
  type: "object",
  fields: [
    defineField({
      name: "provider",
      type: "string",
      options: { list: ["vimeo", "mux"], layout: "radio" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "id",
      title: "Video ID / playback ID",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "title",
      type: "string",
      description: "Used as the accessible name of the player.",
      validation: (r) => r.required(),
    }),
  ],
});
