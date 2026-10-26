import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** JMK monogram favicon (rendered at build time with Fraunces). */
export default async function Icon() {
  const font = await readFile(path.join(process.cwd(), "src/assets/fonts/Fraunces-Regular.ttf"));
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0F1B2D",
        color: "#FAF8F4",
        fontFamily: "Fraunces",
        fontSize: 27,
        letterSpacing: -1,
      }}
    >
      JMK
    </div>,
    { ...size, fonts: [{ name: "Fraunces", data: font, weight: 400 }] },
  );
}
