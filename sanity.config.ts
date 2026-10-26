"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";
import { apiVersion, dataset, projectId } from "./src/lib/sanity/env";

export default defineConfig({
  name: "jmkelley",
  title: "JM Kelley Inc.",
  basePath: "/studio",
  projectId: projectId || "not-configured",
  dataset,
  schema: {
    types: schemaTypes,
    // Site settings is a singleton: no "new" or "duplicate".
    templates: (templates) => templates.filter((t) => t.schemaType !== "siteSettings"),
  },
  document: {
    actions: (actions, ctx) =>
      ctx.schemaType === "siteSettings"
        ? actions.filter((a) => a.action !== "duplicate" && a.action !== "delete")
        : actions,
  },
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: apiVersion })],
});
