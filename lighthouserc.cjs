/**
 * Lighthouse CI (mobile emulation, Lighthouse defaults). `npm run lhci` builds nothing:
 * run `npm run build` first; LHCI starts `npm run start` itself.
 * Budgets from the brief: Performance ≥ 90, Accessibility ≥ 95, LCP < 2.5 s, CLS < 0.05.
 */
module.exports = {
  ci: {
    collect: {
      startServerCommand: "npm run start -- -p 3200",
      startServerReadyPattern: "Ready",
      url: [
        "http://localhost:3200/",
        "http://localhost:3200/work",
        "http://localhost:3200/work/4-fairway-point",
        "http://localhost:3200/contact",
      ],
      numberOfRuns: 3,
      settings: { chromeFlags: "--no-sandbox --headless=new" },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.05 }],
      },
    },
    upload: { target: "filesystem", outputDir: ".lighthouseci/reports" },
  },
};
