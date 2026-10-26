import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { CtaBand } from "@/components/sections/CtaBand";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPost, getPosts } from "@/lib/sanity/api";
import { buildMetadata } from "@/lib/seo/metadata";
import { articleLd, breadcrumbLd } from "@/lib/seo/jsonld";
import type { PostBlock } from "@/lib/types";

export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/journal/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/journal/${post.slug}`,
    type: "article",
    image: post.heroImage?.src,
  });
}

function Blocks({ blocks }: { blocks: PostBlock[] }) {
  return (
    <>
      {blocks.map((b, i) =>
        b._type === "heading" ? (
          <h2 key={i}>{b.text}</h2>
        ) : b._type === "list" ? (
          <ul key={i}>
            {b.items.map((it) => (
              <li key={it}>{it}</li>
            ))}
          </ul>
        ) : (
          <p key={i}>{b.text}</p>
        ),
      )}
    </>
  );
}

export default async function PostPage({ params }: PageProps<"/journal/[slug]">) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  return (
    <article>
      <JsonLd
        data={[
          articleLd(post),
          breadcrumbLd([
            { name: "Journal", path: "/journal" },
            { name: post.title, path: `/journal/${post.slug}` },
          ]),
        ]}
      />
      <header className="pt-[calc(var(--header-h)+var(--section-y-sm))] pb-[var(--section-y-sm)]">
        <Container width="narrow">
          <Eyebrow>
            <Link href="/journal" className="link-underline">
              Journal
            </Link>
          </Eyebrow>
          <h1 className="mt-6 font-display text-h1">{post.title}</h1>
          <p className="mt-6 text-lead text-fg-muted">{post.excerpt}</p>
        </Container>
      </header>
      {post.heroImage && (
        <div className="relative mx-auto aspect-[21/9] max-w-[var(--max-w)] overflow-hidden bg-sand">
          <Image
            src={post.heroImage.src}
            alt={post.heroImage.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      )}
      <Container width="narrow" className="prose-site section-y-sm text-lead">
        {post.bodyFormat === "portableText" ? (
          <PortableText value={post.body as Parameters<typeof PortableText>[0]["value"]} />
        ) : (
          <Blocks blocks={post.body as PostBlock[]} />
        )}
      </Container>
      <CtaBand />
    </article>
  );
}
