import type { Metadata, Viewport } from "next";
import { dmSans, instrumentSerif } from "@/lib/fonts";
import { siteUrl } from "@/lib/env";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "JM Kelley Inc. — Newport Beach Builder",
    template: "%s | JM Kelley Inc. — Newport Beach Builder",
  },
  description:
    "JM Kelley Inc. builds coastal homes from the foundation up: general contracting, structural concrete and framing in Newport Beach and coastal Orange County.",
};

export const viewport: Viewport = {
  themeColor: "#171917",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-US" className={`${instrumentSerif.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
