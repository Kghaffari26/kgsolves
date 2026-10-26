import { test } from "@playwright/test";

/** `npm run qa:screenshots` → qa/screenshots/<page>-<width>.png (full page, reduced motion so pinned sections lay out flat). */
const pages = [
  "/",
  "/work",
  "/work/4-fairway-point",
  "/services/concrete-framing",
  "/for-builders",
  "/process",
  "/about",
  "/contact",
  "/areas/newport-beach",
];
const widths = [375, 768, 1280, 1920];

test.use({ reducedMotion: "reduce" });

for (const path of pages) {
  for (const width of widths) {
    test(`${path} @ ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: width < 800 ? 900 : 1000 });
      await page.goto(path, { waitUntil: "load" });
      // Let lazy images load.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 60));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(600);
      const name = path === "/" ? "home" : path.slice(1).replace(/\//g, "_");
      await page.screenshot({ path: `qa/screenshots/${name}-${width}.png`, fullPage: true });
    });
  }
}
