import Image from "next/image";
import Link from "next/link";
import { HoverVideo } from "@/components/media/HoverVideo";
import { Todo } from "@/components/ui/Todo";
import { projectTypeLabels } from "@/lib/site";
import type { Project } from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";

export function ProjectCard({
  project,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  aspect = "aspect-[4/5]",
  className,
  headingLevel: H = "h3",
}: {
  project: Project;
  sizes?: string;
  aspect?: string;
  className?: string;
  headingLevel?: "h2" | "h3";
}) {
  const { specs } = project;
  return (
    <article className={cn("group relative", className)}>
      <Link
        href={`/work/${project.slug}`}
        data-cursor="View"
        className="block focus-visible:outline-offset-4"
        aria-label={`${project.title}, ${project.location}`}
      >
        <div className={cn("relative overflow-hidden bg-sand", aspect)}>
          <Image
            src={project.heroImage.src}
            alt={project.heroImage.alt}
            fill
            sizes={sizes}
            className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out)] group-hover:scale-[1.06] motion-reduce:group-hover:scale-100"
          />
          {project.previewVideo && <HoverVideo src={project.previewVideo} />}
        </div>
        <div className="mt-5 flex items-start justify-between gap-4">
          <div>
            <H className="font-display text-h4 text-fg-strong">{project.title}</H>
            <p className="mt-1 text-small text-fg-muted">{project.location}</p>
          </div>
          <dl className="shrink-0 text-right text-small text-fg-muted">
            <dt className="sr-only">Type</dt>
            <dd>{projectTypeLabels[project.type]}</dd>
            {specs.sqft && (
              <>
                <dt className="sr-only">Size</dt>
                <dd className="tabular-nums">{formatNumber(specs.sqft)} sq ft</dd>
              </>
            )}
          </dl>
        </div>
      </Link>
      {!project.typeConfirmed && (
        <p className="mt-2">
          <Todo>confirm project type</Todo>
        </p>
      )}
    </article>
  );
}
