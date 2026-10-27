/**
 * Content types shared by the Sanity data layer and the local JSON fallback.
 * `null` on a fact field means "unknown — TODO(client)". Components render a
 * placeholder marker for nulls instead of guessing.
 */

export type ImageAsset = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** finished = professional photography; jobsite = construction phone photos */
  kind?: "finished" | "jobsite";
  /** true while the file is a generated stand-in for a real photo */
  placeholder?: boolean;
  /** tiny base64 blur preview */
  lqip?: string;
};

export type VideoSource = {
  /** self-hosted loop in /public/video (webm + mp4), or a long-form embed */
  mp4?: string;
  webm?: string;
  poster?: string;
};

export type VideoEmbedSource = {
  provider: "mux" | "vimeo";
  id: string;
  title: string;
};

export type CitySlug =
  "newport-beach" | "newport-coast" | "corona-del-mar" | "costa-mesa" | "huntington-beach";

export type ProjectType = "new-home" | "remodel" | "adu" | "multi-unit" | "commercial";

export type Project = {
  slug: string;
  title: string;
  /** shown under the title, e.g. "Newport Coast" */
  location: string;
  city: CitySlug;
  type: ProjectType;
  /** false until the client confirms the project type */
  typeConfirmed: boolean;
  summary: string;
  specs: { beds: number | null; baths: number | null; sqft: number | null };
  year: string | null;
  role: string | null;
  scope: string | null;
  architect: string | null;
  heroImage: ImageAsset;
  heroVideo: VideoSource | null;
  /** short muted loop shown on card hover */
  previewVideo: string | null;
  gallery: ImageAsset[];
  beforeAfter: { before: ImageAsset; after: ImageAsset; label: string }[];
  story: { brief: string | null; build: string | null; result: string | null };
  walkthrough: VideoEmbedSource | null;
  featured: boolean;
  order: number;
};

export type Faq = { question: string; answer: string | null };

export type Service = {
  slug: string;
  title: string;
  /** one-line summary for lists */
  summary: string;
  intro: string;
  heroImage: ImageAsset;
  included: { title: string; body: string }[];
  process: { title: string; body: string }[];
  faqs: Faq[];
  /** project types used to pick related projects */
  relatedTypes: ProjectType[];
  /** slot for a time-lapse or explainer video (flagship pages) */
  video: VideoEmbedSource | null;
  order: number;
};

export type Stat = { label: string; value: string | null; verified: boolean };

export type SiteSettings = {
  companyName: string;
  legalName: string;
  phone: string;
  email: string | null;
  streetAddress: string | null;
  city: string;
  region: string;
  postalCode: string | null;
  hours: { days: string; hours: string }[];
  /** schema.org openingHours strings */
  openingHours: string[];
  license: { number: string; verified: boolean; board: string };
  insuranceStatement: string | null;
  social: { label: string; url: string | null }[];
  stats: Stat[];
  /** homepage hero loop; null → the generated placeholder loop */
  heroVideo?: VideoSource | null;
};

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  context: string | null;
  projectSlug: string | null;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  photo: ImageAsset | null;
  founder: boolean;
};

export type PostBlock =
  | { _type: "heading"; text: string }
  | { _type: "paragraph"; text: string }
  | { _type: "list"; items: string[] };

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string | null;
  draft: boolean;
  heroImage: ImageAsset | null;
  /** Fallback posts use simple blocks; Sanity posts use Portable Text. */
  body: PostBlock[] | unknown[];
  bodyFormat: "blocks" | "portableText";
};

export type Area = {
  slug: CitySlug;
  name: string;
  intro: string[];
  considerations: { title: string; body: string }[];
};
