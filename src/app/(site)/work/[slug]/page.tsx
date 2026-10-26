import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { Button } from "@/components/ui/Button";
import { Todo } from "@/components/ui/Todo";
import { FadeUp } from "@/components/motion/FadeUp";
import { BeforeAfter } from "@/components/media/BeforeAfter";
import { Gallery } from "@/components/media/Gallery";
import { VideoEmbed } from "@/components/media/VideoEmbed";
import { JsonLd } from "@/components/seo/JsonLd";
import { getProject, getProjects } from "@/lib/sanity/api";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbLd, projectLd } from "@/lib/seo/jsonld";
import { projectTypeLabels } from "@/lib/site";
import { formatNumber } from "@/lib/utils";

export async function generateStaticParams() {
  return (await getProjects()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};
  return buildMetadata({
    title: `${project.title}, ${project.location}`,
    description: `${project.summary} Built by JM Kelley Inc., a Newport Beach general contractor that pours and frames its own projects.`,
    path: `/work/${project.slug}`,
    image: project.heroImage.src,
  });
}

function Spec({
  label,
  value,
  todo,
}: {
  label: string;
  value: React.ReactNode | null;
  todo: string;
}) {
  return (
    <div className="border-t border-rule pt-4">
      <dt className="eyebrow text-fg-muted">{label}</dt>
      <dd className="mt-2 font-display text-h4 text-fg-strong">{value ?? <Todo>{todo}</Todo>}</dd>
    </div>
  );
}

function StoryBlock({
  n,
  title,
  body,
  slug,
}: {
  n: string;
  title: string;
  body: string | null;
  slug: string;
}) {
  return (
    <FadeUp className="grid gap-6 border-t border-rule py-12 lg:grid-cols-12">
      <p className="eyebrow text-accent-text lg:col-span-1">{n}</p>
      <h2 className="font-display text-h3 lg:col-span-4">{title}</h2>
      <div className="prose-site max-w-2xl text-lead lg:col-span-7">
        {body ? (
          body.split("\n\n").map((para, i) => <p key={i}>{para}</p>)
        ) : (
          <Todo block>{`${slug}: "${title}" story`}</Todo>
        )}
      </div>
    </FadeUp>
  );
}

export default async function ProjectPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const [project, all] = await Promise.all([getProject(slug), getProjects()]);
  if (!project) notFound();
  const index = all.findIndex((p) => p.slug === project.slug);
  const next = all[(index + 1) % all.length];
  const { specs } = project;

  return (
    <article>
      <JsonLd
        data={[
          projectLd(project),
          breadcrumbLd([
            { name: "Work", path: "/work" },
            { name: project.title, path: `/work/${project.slug}` },
          ]),
        ]}
      />

      <header
        data-header-overlay
        className="theme-dark relative isolate flex min-h-[92svh] items-end overflow-hidden"
      >
        <Image
          src={project.heroImage.src}
          alt={project.heroImage.alt}
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="-z-10 object-cover"
        />
        {project.heroVideo?.mp4 && (
          <video
            className="absolute inset-0 -z-10 size-full object-cover motion-reduce:hidden"
            muted
            loop
            playsInline
            autoPlay
            preload="none"
            poster={project.heroVideo.poster ?? project.heroImage.src}
            aria-hidden
          >
            {project.heroVideo.webm && <source src={project.heroVideo.webm} type="video/webm" />}
            <source src={project.heroVideo.mp4} type="video/mp4" />
          </video>
        )}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(15,27,45,0.5)_0%,rgba(15,27,45,0.25)_40%,rgba(15,27,45,0.88)_100%)]"
        />
        <Container className="pb-16 md:pb-20">
          <nav aria-label="Breadcrumb" className="text-small text-paper/75">
            <Link href="/work" className="link-underline">
              Work
            </Link>
            <span aria-hidden> / </span>
            <span aria-current="page">{project.title}</span>
          </nav>
          <h1 className="mt-6 max-w-[16ch] font-display text-display text-paper">
            {project.title}
          </h1>
          <p className="mt-6 text-lead text-paper/85">{project.location}</p>
        </Container>
      </header>

      <section aria-label="Project specifications" className="section-y-sm">
        <Container>
          <dl className="grid grid-cols-2 gap-x-[var(--grid-gap)] gap-y-8 md:grid-cols-3 lg:grid-cols-6">
            <Spec label="Bedrooms" value={specs.beds} todo="beds" />
            <Spec label="Bathrooms" value={specs.baths} todo="baths" />
            <Spec
              label="Size"
              value={specs.sqft ? `${formatNumber(specs.sqft)} sq ft` : null}
              todo="sq ft"
            />
            <Spec label="Year" value={project.year} todo="year" />
            <Spec
              label="Type"
              value={project.typeConfirmed ? projectTypeLabels[project.type] : null}
              todo="confirm type"
            />
            <Spec label="Our role" value={project.role} todo="JM Kelley's role" />
          </dl>
          <dl className="mt-8 grid grid-cols-1 gap-x-[var(--grid-gap)] gap-y-8 md:grid-cols-2">
            <Spec label="Scope" value={project.scope} todo="scope" />
            <Spec label="Architect" value={project.architect} todo="architect" />
          </dl>
          <p className="mt-16 max-w-3xl font-display text-h3 text-fg-strong">{project.summary}</p>
        </Container>
      </section>

      <section aria-label="Project story" className="pb-[var(--section-y-sm)]">
        <Container>
          <StoryBlock n="01" title="The brief" body={project.story.brief} slug={project.slug} />
          <StoryBlock n="02" title="The build" body={project.story.build} slug={project.slug} />
          <StoryBlock n="03" title="The result" body={project.story.result} slug={project.slug} />
        </Container>
      </section>

      {project.beforeAfter.length > 0 && (
        <section aria-labelledby="ba-title" className="theme-stone section-y-sm">
          <Container>
            <Eyebrow>Raw to refined</Eyebrow>
            <Heading id="ba-title" size="h2" className="mt-5">
              From the frame to the finish.
            </Heading>
            <div className="mt-12 space-y-12">
              {project.beforeAfter.map((pair, i) => (
                <BeforeAfter key={i} before={pair.before} after={pair.after} label={pair.label} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {project.gallery.length > 0 && (
        <section aria-labelledby="gallery-title" className="section-y-sm">
          <Container>
            <h2 id="gallery-title" className="font-display text-h2">
              Gallery
            </h2>
            <div className="mt-12">
              <Gallery images={project.gallery} title={project.title} />
            </div>
          </Container>
        </section>
      )}

      {project.walkthrough && (
        <section aria-labelledby="walkthrough-title" className="section-y-sm">
          <Container>
            <h2 id="walkthrough-title" className="font-display text-h2">
              Walkthrough
            </h2>
            <div className="mt-12">
              <VideoEmbed video={project.walkthrough} />
            </div>
          </Container>
        </section>
      )}

      <section aria-label="Start a project" className="section-y-sm">
        <Container className="flex flex-col items-start justify-between gap-8 border-t border-rule pt-12 md:flex-row md:items-center">
          <p className="max-w-[20ch] font-display text-h3">
            Planning something like {project.title}?
          </p>
          <Button href={`/contact?ref=${project.slug}`} arrow>
            Start a project like this
          </Button>
        </Container>
      </section>

      {next && next.slug !== project.slug && (
        <Link
          href={`/work/${next.slug}`}
          className="group theme-dark relative isolate block overflow-hidden"
          data-cursor="Next"
        >
          <Image
            src={next.heroImage.src}
            alt=""
            fill
            sizes="100vw"
            className="-z-10 object-cover opacity-40 transition-[transform,opacity] duration-[1.4s] ease-[var(--ease-out)] group-hover:scale-105 group-hover:opacity-60 motion-reduce:group-hover:scale-100"
          />
          <Container className="flex min-h-[60svh] flex-col justify-center py-[var(--section-y-sm)]">
            <p className="eyebrow text-paper/75">Next project</p>
            <p className="mt-6 max-w-[14ch] font-display text-display text-paper transition-transform duration-700 ease-[var(--ease-out)] group-hover:translate-x-3 motion-reduce:group-hover:translate-x-0">
              {next.title}
            </p>
            <p className="mt-4 text-lead text-paper/80">{next.location}</p>
          </Container>
        </Link>
      )}
    </article>
  );
}
