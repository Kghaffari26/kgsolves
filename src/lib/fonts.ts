import { Fraunces, Inter_Tight } from "next/font/google";

/**
 * Display: Fraunces. A variable "Old Style soft" serif with an optical-size axis (9–144).
 * At display sizes the opsz axis sharpens the hairlines and tightens the apertures, giving the
 * high-contrast editorial look we want at 6–9rem, while the same file stays readable at 24px.
 * Cormorant is beautiful but too thin and fragile on mid-size headings and on Windows rendering;
 * Fraunces holds up across the whole scale with one font file.
 */
export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz"],
  display: "swap",
});

/** Body/UI: Inter Tight. Neutral grotesk with tight default spacing that sits well under a serif. */
export const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});
