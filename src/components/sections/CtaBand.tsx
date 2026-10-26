import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Divider } from "@/components/ui/Divider";

export function CtaBand({
  title = "Have a lot, a set of plans, or just an idea?",
  body = "Tell us about the project. We'll start with an honest budget.",
  primary = { label: "Start a project", href: "/contact" },
  secondary = { label: "Send plans for a take-off", href: "/for-builders#upload" },
  tone = "stone",
}: {
  title?: string;
  body?: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string } | null;
  tone?: "stone" | "paper";
}) {
  return (
    <section className={`${tone === "stone" ? "theme-stone" : ""} section-y-sm`}>
      <Container>
        <Divider variant="blueprint" label="Next" className="mb-14" />
        <div className="grid items-end gap-10 lg:grid-cols-12">
          <h2 className="font-display text-h2 lg:col-span-8">{title}</h2>
          <div className="lg:col-span-4">
            <p className="text-lead text-fg-muted">{body}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href={primary.href} arrow>
                {primary.label}
              </Button>
              {secondary && (
                <Button href={secondary.href} variant="ghost">
                  {secondary.label}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
