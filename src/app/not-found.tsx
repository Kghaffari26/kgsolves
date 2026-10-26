import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Divider } from "@/components/ui/Divider";
import { HouseDrawing } from "@/components/sections/home/HouseDrawing";

export const metadata: Metadata = {
  title: { absolute: "Page not found | JM Kelley Inc." },
  robots: { index: false },
};

export default function NotFound() {
  return (
    <SiteShell>
      <section className="pt-[calc(var(--header-h)+var(--section-y-sm))] pb-[var(--section-y)]">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <p className="eyebrow text-fg-muted">Error 404</p>
              <h1 className="mt-6 font-display text-h1">Nothing built here yet.</h1>
              <p className="mt-6 max-w-md text-lead text-fg-muted">
                The page you were looking for doesn&rsquo;t exist or has moved. Our old site&rsquo;s
                pages now live under Work.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Button href="/work" arrow>
                  See our work
                </Button>
                <Button href="/contact" variant="ghost">
                  Start a project
                </Button>
              </div>
            </div>
            <div className="text-ink lg:col-span-6">
              <HouseDrawing stage={1} className="w-full" />
              <Divider variant="blueprint" label="Foundation only" className="mt-4" />
            </div>
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}
