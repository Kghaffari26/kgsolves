import * as z from "zod/mini";

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

// zod/mini: the same validation as classic Zod at a fraction of the bundle size, since these
// schemas ship to the browser with the forms.
const text = (min: number, max: number, message: string) =>
  z.string().check(z.trim(), z.minLength(min, message), z.maxLength(max));
const optionalText = (max: number, message?: string) =>
  z._default(z.optional(z.string().check(z.trim(), z.maxLength(max, message))), "");
const email = z.email("Enter a valid email address.").check(z.maxLength(200));

const phone = z.string().check(
  z.trim(),
  z.maxLength(30),
  z.refine(
    (v) => v === "" || v.replace(/\D/g, "").length >= 10,
    "Enter a phone number with area code, or leave it blank.",
  ),
);

/** Spam controls carried by both forms. */
export const antiSpam = {
  /** honeypot: real people never see or fill this */
  website: z._default(z.optional(z.string().check(z.maxLength(0, "Leave this field empty."))), ""),
  /** ms timestamp the form was rendered */
  startedAt: z.number().check(z.gte(0)),
};

const stepShapes = [
  { projectType: z.enum(values(projectTypes), { error: "Choose the type of project." }) },
  {
    city: z.enum(values(cities), { error: "Choose a location." }),
    cityOther: optionalText(80),
    lot: z.enum(values(lotStatus), { error: "Let us know about the lot." }),
  },
  {
    budget: z.enum(values(budgets), { error: "Choose a budget range." }),
    start: z.enum(values(startWindows), { error: "Choose a target start." }),
  },
  {
    name: text(2, 100, "Enter your name."),
    email,
    phone,
    message: optionalText(3000, "Keep the message under 3,000 characters."),
  },
] as const;

export const startProjectSchema = z
  .object({
    ...stepShapes[0],
    ...stepShapes[1],
    ...stepShapes[2],
    ...stepShapes[3],
    ...antiSpam,
    ref: optionalText(80),
  })
  .check(
    z.refine((d) => d.city !== "other" || d.cityOther.length > 1, {
      path: ["cityOther"],
      message: "Tell us where the project is.",
    }),
  );

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
  name: z.string().check(z.maxLength(200)),
  size: z.number().check(z.gt(0)),
  url: z.nullable(z.url()),
});

export const planUploadSchema = z
  .object({
    company: text(2, 120, "Enter your company name."),
    contactName: text(2, 100, "Enter a contact name."),
    email,
    phone,
    projectAddress: text(3, 200, "Enter the project address or city."),
    neededBy: z.iso.date("Choose the date you need it by."),
    notes: optionalText(3000),
    files: z
      .array(uploadedFile)
      .check(
        z.minLength(1, "Add at least one PDF or DWG file."),
        z.maxLength(20, "Up to 20 files."),
      ),
    ...antiSpam,
  })
  .check(
    z.refine((d) => d.files.reduce((n, f) => n + f.size, 0) <= MAX_UPLOAD_BYTES, {
      path: ["files"],
      message: "Files must total 50 MB or less.",
    }),
    z.refine(
      (d) =>
        d.files.every((f) => ACCEPTED_EXTENSIONS.some((ext) => f.name.toLowerCase().endsWith(ext))),
      {
        path: ["files"],
        message: "Only PDF and DWG files are accepted.",
      },
    ),
  );

export type PlanUploadInput = z.input<typeof planUploadSchema>;
export type PlanUploadData = z.output<typeof planUploadSchema>;

export const labelOf = (list: readonly { value: string; label: string }[], v: string) =>
  list.find((x) => x.value === v)?.label ?? v;
