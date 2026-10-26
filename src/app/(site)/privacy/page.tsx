import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Todo } from "@/components/ui/Todo";
import { PageHero } from "@/components/sections/PageHero";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Privacy",
  description: "How JM Kelley Inc. handles information submitted through this website.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Privacy" title={["Privacy"]} />
      <Container width="narrow" className="prose-site pb-[var(--section-y)]">
        <Todo block>have this page reviewed by counsel before launch</Todo>
        <h2>What we collect</h2>
        <p>
          When you use our forms we collect what you enter: your name, contact details, project
          details and any files you upload. We use it only to respond to your inquiry and to prepare
          estimates or take-offs.
        </p>
        <h2>Files</h2>
        <p>
          Plan files you upload are stored privately with our hosting provider and shared only with
          the people preparing your take-off or estimate.
        </p>
        <h2>Analytics</h2>
        <p>
          We record basic, aggregate events such as form submissions and phone-link clicks to
          understand how the site is used.
        </p>
        <h2>Contact</h2>
        <p>Questions about your information? Call us at 949-873-0740.</p>
      </Container>
    </>
  );
}
