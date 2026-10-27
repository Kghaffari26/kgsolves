import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** JMK monogram favicon (rendered at build time with Instrument Serif). */
export default async function AppleIcon() {
  const font = await readFile(
    path.join(process.cwd(), "src/assets/fonts/InstrumentSerif-Regular.ttf"),
  );
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#171917",
        color: "#FAF9F6",
        fontFamily: "Instrument Serif",
        fontSize: 74,
        letterSpacing: -2,
      }}
    >
      JMK
    </div>,
    { ...size, fonts: [{ name: "Instrument Serif", data: font, weight: 400 }] },
  );
}
