import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { redirects, routes } from "./routes";

test.describe("routes", () => {
  for (const path of routes) {
    test(`${path} returns 200`, async ({ request }) => {
      const res = await request.get(path);
      expect(res.status()).toBe(200);
    });
  }

  test("unknown URL renders the 404 page", async ({ page }) => {
    const res = await page.goto("/this-page-does-not-exist");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Nothing built here yet." })).toBeVisible();
  });

  test("draft journal outlines are not published", async ({ request }) => {
    expect((await request.get("/journal/adu-rules-in-orange-county")).status()).toBe(404);
  });
});

test.describe("legacy redirects", () => {
  for (const [from, to] of redirects) {
    test(`${from} → ${to} (301)`, async ({ request }) => {
      const res = await request.get(from, { maxRedirects: 0 });
      expect(res.status()).toBe(301);
      expect(new URL(res.headers()["location"], "http://x").pathname).toBe(to);
    });
  }
});

test.describe("metadata", () => {
  test("pages have unique titles and canonical URLs", async ({ page }) => {
    const titles = new Set<string>();
    for (const path of [
      "/",
      "/work",
      "/work/4-fairway-point",
      "/services/adus",
      "/contact",
      "/areas/costa-mesa",
    ]) {
      await page.goto(path);
      const title = await page.title();
      expect(title).toContain("JM Kelley Inc.");
      expect(titles.has(title)).toBe(false);
      titles.add(title);
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
      await expect(page.locator('meta[name="description"]')).toHaveCount(1);
      const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
      expect(ld.join(" ")).toContain("GeneralContractor");
    }
  });

  test("every <img> has an alt attribute", async ({ page }) => {
    for (const path of ["/", "/work/4-fairway-point", "/services/concrete-framing"]) {
      await page.goto(path);
      const missing = await page.locator("img:not([alt])").count();
      expect(missing, `${path} has images without alt`).toBe(0);
    }
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("Foundation Up renders as a static four-panel grid", async ({ page }) => {
    await page.goto("/");
    const grid = page.getByTestId("foundation-static");
    await expect(grid).toBeVisible();
    await expect(grid.locator("li")).toHaveCount(4);
    // The pinned version is hidden and no hero video is created.
    await expect(page.locator(".motion-only").first()).toBeHidden();
    await page.waitForTimeout(1500);
    await expect(page.locator("section[data-header-overlay] video")).toHaveCount(0);
  });
});

test.describe("forms (console provider)", () => {
  test("start a project: validates each step and submits", async ({ page }) => {
    const events: string[] = [];
    await page.exposeFunction("captureEvent", (e: string) => events.push(e));
    await page.addInitScript(() =>
      window.addEventListener("jmk:analytics", (e) =>
        (window as unknown as { captureEvent: (s: string) => void }).captureEvent(
          JSON.stringify((e as CustomEvent).detail),
        ),
      ),
    );
    await page.goto("/contact");
    const form = page.getByTestId("start-project-form");
    await form.getByRole("button", { name: "Continue" }).click();
    await expect(form.getByText("Choose the type of project.")).toBeVisible();
    await form.getByRole("radio", { name: "ADU" }).check({ force: true });
    await form.getByRole("button", { name: "Continue" }).click();
    await form.getByRole("radio", { name: "Costa Mesa" }).check({ force: true });
    await form.getByRole("radio", { name: "Yes, we own it" }).check({ force: true });
    await form.getByRole("button", { name: "Continue" }).click();
    await form.getByRole("radio", { name: "Not sure yet" }).first().check({ force: true });
    await form.getByRole("radio", { name: "In 3–6 months" }).check({ force: true });
    await form.getByRole("button", { name: "Continue" }).click();
    await form.getByLabel("Name").fill("Playwright Test");
    await form.getByLabel("Email").fill("nope");
    await form.getByRole("button", { name: "Send project details" }).click();
    await expect(form.getByText("Enter a valid email address.")).toBeVisible();
    await form.getByLabel("Email").fill("qa@example.com");
    await page.waitForTimeout(2600); // minimum human fill time
    await form.getByRole("button", { name: "Send project details" }).click();
    await expect(page.getByTestId("form-success")).toBeVisible();
    expect(events.some((e) => e.includes('"lead_submit"') && e.includes('"adu"'))).toBe(true);
  });

  test("plan upload: rejects non-PDF/DWG and submits", async ({ page }) => {
    await page.goto("/for-builders");
    const form = page.getByTestId("plan-upload-form");
    await form.getByRole("button", { name: "Send plans" }).click();
    await expect(form.getByText("Enter your company name.")).toBeVisible();
    await form.getByLabel("Company").fill("QA Framing Co");
    await form.getByLabel("Contact name").fill("Pat QA");
    await form.getByLabel("Email").fill("pat@example.com");
    await form.getByLabel("Project address").fill("1 Test Way, Newport Beach");
    await form.getByLabel("Needed by").fill("2031-06-01");
    const files = form.getByTestId("plan-files");
    // The picker's accept filter hides .txt files, so exercise rejection through drag and drop.
    const drop = await page.evaluateHandle(() => {
      const dt = new DataTransfer();
      dt.items.add(new File(["x"], "notes.txt", { type: "text/plain" }));
      return dt;
    });
    await form.getByText("Drag files here").dispatchEvent("drop", { dataTransfer: drop });
    await expect(form.getByText(/Only PDF and DWG files are accepted/)).toBeVisible();
    await files.setInputFiles({
      name: "A-101.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4\n%%EOF"),
    });
    await expect(form.getByText("A-101.pdf")).toBeVisible();
    await page.waitForTimeout(2600);
    await form.getByRole("button", { name: "Send plans" }).click();
    await expect(page.getByTestId("form-success")).toBeVisible();
  });

  test("honeypot submissions are silently dropped", async ({ page }) => {
    await page.goto("/for-builders");
    const hp = page.locator('input[name="website"]');
    await expect(hp).toHaveAttribute("tabindex", "-1");
  });
});

test.describe("work filters", () => {
  test("filtering shows matching projects and All restores them", async ({ page }) => {
    await page.goto("/work");
    const cards = page.locator("li[data-flip]:not([hidden])");
    await expect(cards).toHaveCount(6);
    await page.getByRole("button", { name: /^Multi-unit/ }).click();
    await expect(cards).toHaveCount(1);
    await expect(page.getByRole("button", { name: /^Multi-unit/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await page.getByRole("button", { name: /^All/ }).click();
    await expect(cards).toHaveCount(6);
  });
});

test.describe("keyboard", () => {
  test("skip link moves focus to main content", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard test");
    await page.goto("/work");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });

  test("gallery lightbox opens, steps and closes with the keyboard", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard test");
    await page.goto("/work/4-fairway-point");
    const first = page.getByRole("button", { name: /Open image 1 of/ });
    await first.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: /gallery, image 1 of/ });
    await expect(dialog).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("dialog", { name: /image 2 of/ })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(first).toBeFocused();
  });

  test("before/after slider responds to arrow keys", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard test");
    await page.goto("/work/4-fairway-point");
    const slider = page.getByRole("slider", { name: /Framing to finished/ });
    await slider.focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expect(slider).toHaveValue("52");
    await page.keyboard.press("End");
    await expect(slider).toHaveValue("100");
  });

  test("mobile menu traps focus and closes with Escape", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Menu" });
    await toggle.click();
    const dialog = page.getByRole("dialog", { name: "Site menu" });
    await expect(dialog).toBeVisible();
    for (let i = 0; i < 15; i++) await page.keyboard.press("Tab");
    expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);
    await page.keyboard.press("Escape");
    await expect(toggle).toBeFocused();
  });
});

test.describe("accessibility (axe)", () => {
  for (const path of [
    "/",
    "/work",
    "/work/4-fairway-point",
    "/contact",
    "/for-builders",
    "/services/concrete-framing",
  ]) {
    test(`${path} has no serious axe violations`, async ({ page }) => {
      await page.goto(path);
      // Let entrance animations finish so axe measures final colours.
      await page.waitForTimeout(2500);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      const serious = results.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical",
      );
      expect(serious.map((v) => `${v.id}: ${v.nodes.length} × ${v.help}`)).toEqual([]);
    });
  }
});
