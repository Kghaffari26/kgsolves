import localFont from "next/font/local";
import { Inter_Tight } from "next/font/google";

/**
 * Display: Fraunces. A soft, high-contrast "Old Style" serif with an optical-size axis
 * (14–144). At display sizes the opsz axis sharpens the hairlines and tightens the apertures,
 * which gives the editorial look we want at 6–9rem, while the same file stays sturdy at 20px.
 * Cormorant is beautiful but too thin and fragile on mid-size headings and on Windows
 * rendering; Fraunces holds up across the whole scale.
 *
 * Self-hosted as a performance measure: the Google variable font (opsz + wght, 67 KB) is
 * instanced to weight 400 with the opsz axis kept and subset to Latin (34 KB):
 *   fonttools varLib.instancer Fraunces-latin.woff2 wght=400 opsz=14:144 -o out.ttf
 *   pyftsubset out.ttf --unicodes="*" --layout-features="*" --flavor=woff2
 * Licensed under the SIL Open Font License 1.1 (see src/assets/fonts/OFL.txt).
 */
export const fraunces = localFont({
  src: "../assets/fonts/Fraunces-400-opsz-latin.woff2",
  variable: "--font-fraunces",
  weight: "400",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

/** Body/UI: Inter Tight. Neutral grotesk with tight default spacing that sits well under a serif. */
export const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});
