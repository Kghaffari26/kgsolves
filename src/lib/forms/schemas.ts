import { z } from "zod";

/** Shared by the client forms (react-hook-form) and the server actions. */

export const projectTypes = [
  { value: "custom-home", label: "Custom home" },
  { value: "remodel", label: "Remodel or addition" },
  { value: "adu", label: "ADU" },
  { value: "multi-unit", label: "Multi-unit / development" },
  { value: "commercial", label: "Commercial" },
  { value: "owners-rep", label: "Owner's representation" },
] as const;

export const cities = [
  { value: "newport-beach", label: "Newport Beach" },
  { value: "newport-coast", label: "Newport Coast" },
  { value: "corona-del-mar", label: "Corona del Mar" },
  { value: "costa-mesa", label: "Costa Mesa" },
  { value: "huntington-beach", label: "Huntington Beach" },
  { value: "other", label: "Somewhere else" },
] as const;

export const lotStatus = [
  { value: "own", label: "Yes, we own it" },
  { value: "escrow", label: "In escrow" },
  { value: "looking", label: "Still looking" },
  { value: "na", label: "Not applicable" },
] as const;

export const budgets = [
  { value: "under-500k", label: "Under $500k" },
  { value: "500k-1m", label: "$500k – $1M" },
  { value: "1m-2.5m", label: "$1M – $2.5M" },
  { value: "2.5m-5m", label: "$2.5M – $5M" },
  { value: "5m-plus", label: "$5M +" },
  { value: "not-sure", label: "Not sure yet" },
] as const;

export const startWindows = [
  { value: "asap", label: "As soon as possible" },
  { value: "3-6", label: "In 3–6 months" },
  { value: "6-12", label: "In 6–12 months" },
  { value: "12-plus", label: "More than a year out" },
  { value: "not-sure", label: "Not sure yet" },
] as const;

const values = <T extends readonly { value: string }[]>(list: T) =>
  list.map((x) => x.value) as unknown as [T[number]["value"], ...T[number]["value"][]];

const phone = z
  .string()
  .trim()
  .max(30)
  .refine(
    (v) => v === "" || v.replace(/\D/g, "").length >= 10,
    "Enter a phone number with area code, or leave it blank.",
  );

/** Spam controls carried by both forms. */
export const antiSpam = {
  /** honeypot: real people never see or fill this */
  website: z.string().max(0, "Leave this field empty.").optional().default(""),
  /** ms timestamp the form was rendered */
  startedAt: z.number().int().nonnegative(),
};

export const startProjectSteps = [
  z.object({ projectType: z.enum(values(projectTypes), { error: "Choose the type of project." }) }),
  z.object({
    city: z.enum(values(cities), { error: "Choose a location." }),
    cityOther: z.string().trim().max(80).optional().default(""),
    lot: z.enum(values(lotStatus), { error: "Let us know about the lot." }),
  }),
  z.object({
    budget: z.enum(values(budgets), { error: "Choose a budget range." }),
    start: z.enum(values(startWindows), { error: "Choose a target start." }),
  }),
  z.object({
    name: z.string().trim().min(2, "Enter your name.").max(100),
    email: z.email("Enter a valid email address.").max(200),
    phone,
    message: z
      .string()
      .trim()
      .max(3000, "Keep the message under 3,000 characters.")
      .optional()
      .default(""),
  }),
] as const;

export const startProjectSchema = startProjectSteps[0]
  .extend(startProjectSteps[1].shape)
  .extend(startProjectSteps[2].shape)
  .extend(startProjectSteps[3].shape)
  .extend({ ...antiSpam, ref: z.string().max(80).optional().default("") })
  .refine((d) => d.city !== "other" || d.cityOther.length > 1, {
    path: ["cityOther"],
    message: "Tell us where the project is.",
  });

export type StartProjectInput = z.input<typeof startProjectSchema>;
export type StartProjectData = z.output<typeof startProjectSchema>;

export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
export const ACCEPTED_EXTENSIONS = [".pdf", ".dwg"];
export const ACCEPTED_CONTENT_TYPES = [
  "application/pdf",
  "application/acad",
  "application/x-acad",
  "application/autocad_dwg",
  "application/dwg",
  "application/x-dwg",
  "image/vnd.dwg",
  "image/x-dwg",
  "application/octet-stream",
];

export const uploadedFile = z.object({
  name: z.string().max(200),
  size: z.number().int().positive(),
  url: z.url().nullable(),
});

export const planUploadSchema = z
  .object({
    company: z.string().trim().min(2, "Enter your company name.").max(120),
    contactName: z.string().trim().min(2, "Enter a contact name.").max(100),
    email: z.email("Enter a valid email address.").max(200),
    phone,
    projectAddress: z.string().trim().min(3, "Enter the project address or city.").max(200),
    neededBy: z.iso.date("Choose the date you need it by."),
    notes: z.string().trim().max(3000).optional().default(""),
    files: z
      .array(uploadedFile)
      .min(1, "Add at least one PDF or DWG file.")
      .max(20, "Up to 20 files."),
    ...antiSpam,
  })
  .refine((d) => d.files.reduce((n, f) => n + f.size, 0) <= MAX_UPLOAD_BYTES, {
    path: ["files"],
    message: "Files must total 50 MB or less.",
  })
  .refine(
    (d) =>
      d.files.every((f) => ACCEPTED_EXTENSIONS.some((ext) => f.name.toLowerCase().endsWith(ext))),
    {
      path: ["files"],
      message: "Only PDF and DWG files are accepted.",
    },
  );

export type PlanUploadInput = z.input<typeof planUploadSchema>;
export type PlanUploadData = z.output<typeof planUploadSchema>;

export const labelOf = (list: readonly { value: string; label: string }[], v: string) =>
  list.find((x) => x.value === v)?.label ?? v;
