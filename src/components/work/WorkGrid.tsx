"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, LazyMotion, domAnimation, m } from "motion/react";
import { ProjectCard } from "./ProjectCard";
import { Chip } from "@/components/ui/Tag";
import { projectFilters } from "@/lib/site";
import { useReducedMotion } from "@/lib/motion/useReducedMotion";
import type { Project, ProjectType } from "@/lib/types";

export function WorkGrid({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<ProjectType | "all">("all");
  const reduced = useReducedMotion();
  const visible = useMemo(
    () => (filter === "all" ? projects : projects.filter((p) => p.type === filter)),
    [filter, projects],
  );
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: projects.length };
    projects.forEach((p) => (c[p.type] = (c[p.type] ?? 0) + 1));
    return c;
  }, [projects]);

  return (
    <LazyMotion features={domAnimation} strict>
      <div role="group" aria-label="Filter projects by type" className="flex flex-wrap gap-2">
        {projectFilters.map((f) => (
          <Chip key={f.value} active={filter === f.value} onClick={() => setFilter(f.value)}>
            {f.label}
            <span className="ml-2 text-fg-muted tabular-nums">{counts[f.value] ?? 0}</span>
          </Chip>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {visible.length} {visible.length === 1 ? "project" : "projects"} shown
      </p>

      <m.ul
        layout={!reduced}
        className="mt-12 grid gap-x-[var(--grid-gap)] gap-y-16 sm:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((p, i) => (
            <m.li
              key={p.slug}
              layout={!reduced}
              initial={reduced ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={
                reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.96 }
              }
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className={i % 3 === 1 ? "lg:mt-24" : undefined}
            >
              <ProjectCard project={p} headingLevel="h2" />
            </m.li>
          ))}
        </AnimatePresence>
      </m.ul>
      {visible.length === 0 && (
        <p className="mt-12 max-w-md text-lead text-fg-muted">
          No projects in this category yet. Every project we&rsquo;ve published is under
          &ldquo;All&rdquo;.
        </p>
      )}
    </LazyMotion>
  );
}
