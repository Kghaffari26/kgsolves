import { defineQuery } from "next-sanity";

const image = `{ alt, kind, hotspot, crop, asset->{ _id, url, metadata { lqip, dimensions { width, height } } } }`;
const file = `asset->{ url }`;

const projectFields = `
  "slug": slug.current, title, location, city, type, typeConfirmed, summary,
  specs { beds, baths, sqft }, year, role, scope, architect,
  heroImage ${image},
  "heroVideo": heroVideo { "mp4": mp4.${file}.url, "webm": webm.${file}.url },
  "previewVideo": previewVideo.${file}.url,
  gallery[] ${image},
  beforeAfter[] { label, before ${image}, after ${image} },
  story { brief, build, result },
  walkthrough { provider, id, title },
  featured, order
`;

export const projectsQuery = defineQuery(
  `*[_type == "project" && defined(slug.current)] | order(order asc) { ${projectFields} }`,
);

export const servicesQuery =
  defineQuery(`*[_type == "service" && defined(slug.current)] | order(order asc) {
  "slug": slug.current, title, summary, intro, heroImage ${image},
  included[] { title, body }, process[] { title, body }, faqs[] { question, answer },
  relatedTypes, video { provider, id, title }, order
}`);

export const settingsQuery = defineQuery(`*[_type == "siteSettings"][0]{
  companyName, legalName, phone, email, streetAddress, city, region, postalCode,
  hours[] { days, hours }, openingHours, license { number, verified, board },
  insuranceStatement, social[] { label, url }, stats[] { label, value, verified },
  "heroVideo": heroVideo { "mp4": mp4.asset->url, "webm": webm.asset->url, "poster": poster.asset->url }
}`);

export const testimonialsQuery = defineQuery(`*[_type == "testimonial"] | order(_createdAt desc) {
  "id": _id, quote, name, context, "projectSlug": project->slug.current
}`);

export const teamQuery = defineQuery(`*[_type == "teamMember"] | order(order asc) {
  "id": _id, name, role, bio, photo ${image}, founder
}`);

export const postsQuery =
  defineQuery(`*[_type == "post" && defined(slug.current) && defined(publishedAt) && publishedAt <= now()] | order(publishedAt desc) {
  "slug": slug.current, title, excerpt, publishedAt, heroImage ${image}, body
}`);
