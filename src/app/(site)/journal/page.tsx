import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/sections/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { getPosts } from "@/lib/sanity/api";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Journal",
  description:
    "Notes from JM Kelley Inc. on building in Newport Beach and coastal Orange County: permitting, ADUs, budgets and construction.",
  path: "/journal",
});

const dateFmt = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

export default async function JournalPage() {
  const posts = await getPosts();
  return (
    <>
      <PageHero
        eyebrow="Journal"
        title={["Notes from the site."]}
        lead="Permitting, budgets and building on the coast, written by the people who do it."
      />
      <section aria-label="Posts" className="pb-[var(--section-y)]">
        <Container>
          {posts.length ? (
            <ul className="divide-y divide-rule border-y border-rule">
              {posts.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/journal/${p.slug}`}
                    className="group grid gap-4 py-10 md:grid-cols-12"
                  >
                    <p className="text-small text-fg-muted md:col-span-3">
                      {p.publishedAt ? dateFmt.format(new Date(p.publishedAt)) : ""}
                    </p>
                    <div className="md:col-span-9">
                      <h2 className="font-display text-h3 transition-transform duration-500 group-hover:translate-x-2 motion-reduce:group-hover:translate-x-0">
                        {p.title}
                      </h2>
                      <p className="mt-3 max-w-2xl text-fg-muted">{p.excerpt}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="max-w-xl border-t border-rule pt-8 text-lead text-fg-muted">
              The first posts are being written. In the meantime, see our{" "}
              <Link className="link-underline text-fg-strong" href="/process">
                process
              </Link>
              .
            </p>
          )}
        </Container>
      </section>
      <CtaBand />
    </>
  );
}
