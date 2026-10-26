import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JM Kelley Inc.",
  description: "Newport Beach general contractor.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
