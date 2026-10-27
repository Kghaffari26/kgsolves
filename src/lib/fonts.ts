import { DM_Sans, Instrument_Serif } from "next/font/google";

/**
 * Display: Instrument Serif. A condensed, high-contrast editorial serif with fine hairlines,
 * set at a single regular weight and always mixed case. It carries the architectural
 * restraint of the reference design while holding up at 9rem display sizes.
 */
export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display-face",
  display: "swap",
});

/** Body/UI: DM Sans. Quiet geometric grotesk, comfortable at 16px with generous leading. */
export const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans-face",
  display: "swap",
});
