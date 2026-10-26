"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { ProjectCard } from "./ProjectCard";
import { Chip } from "@/components/ui/Tag";
import { projectFilters } from "@/lib/site";
import { EASE, loadGsap, motionOK, type GsapKit } from "@/lib/motion/gsap";
import type { Project, ProjectType } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Filterable grid. Every card stays in the DOM; filtering toggles `hidden`, and GSAP Flip
 * animates the change: remaining cards glide to their new cells, leavers fade and shrink in
 * place, newcomers settle in. Reduced motion: an instant swap.
 */
export function WorkGrid({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<ProjectType | "all">("all");
  const listRef = useRef<HTMLUListElement>(null);
  const kit = useRef<GsapKit | null>(null);
  const pending = useRef<ReturnType<GsapKit["Flip"]["getState"]> | null>(null);

  const visible = useMemo(
    () =>
      new Set(
        (filter === "all" ? projects : projects.filter((p) => p.type === filter)).map(
          (p) => p.slug,
        ),
      ),
    [filter, projects],
  );
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: projects.length };
    projects.forEach((p) => (c[p.type] = (c[p.type] ?? 0) + 1));
    return c;
  }, [projects]);

  const choose = (value: ProjectType | "all") => {
    if (value === filter) return;
    const items = listRef.current?.querySelectorAll("[data-flip]");
    if (kit.current && items && motionOK()) pending.current = kit.current.Flip.getState(items);
    setFilter(value);
  };

  // Warm the plugin so the first click animates.
  useLayoutEffect(() => {
    loadGsap().then((k) => (kit.current = k));
  }, []);

  useLayoutEffect(() => {
    const state = pending.current;
    const k = kit.current;
    if (!state || !k) return;
    pending.current = null;
    const tween = k.Flip.from(state, {
      duration: 0.9,
      ease: EASE.inOut,
      absolute: true,
      nested: true,
      prune: true,
      onEnter: (els) =>
        k.gsap.fromTo(
          els,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.9, delay: 0.25, stagger: 0.06, ease: EASE.out },
        ),
      onLeave: (els) =>
        k.gsap.to(els, { opacity: 0, scale: 0.94, duration: 0.45, ease: EASE.inOut }),
    });
    return () => {
      tween.kill();
    };
  }, [filter]);

  let shown = 0;
  return (
    <>
      <div role="group" aria-label="Filter projects by type" className="flex flex-wrap gap-2">
        {projectFilters.map((f) => (
          <Chip key={f.value} active={filter === f.value} onClick={() => choose(f.value)}>
            {f.label}
            <span className="ml-2 text-fg-muted tabular-nums">{counts[f.value] ?? 0}</span>
          </Chip>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {visible.size} {visible.size === 1 ? "project" : "projects"} shown
      </p>

      <ul
        ref={listRef}
        className="mt-12 grid gap-x-[var(--grid-gap)] gap-y-16 sm:grid-cols-2 lg:grid-cols-3"
      >
        {projects.map((p, i) => {
          const isShown = visible.has(p.slug);
          const pos = isShown ? shown++ : -1;
          return (
            <li
              key={p.slug}
              data-flip
              data-flip-id={p.slug}
              hidden={!isShown}
              className={cn(pos % 3 === 1 && "lg:mt-24")}
            >
              <ProjectCard project={p} headingLevel="h2" priority={i < 2} />
            </li>
          );
        })}
      </ul>
      {visible.size === 0 && (
        <p className="mt-12 max-w-md text-lead text-fg-muted">
          No projects in this category yet. Every project we&rsquo;ve published is under
          &ldquo;All&rdquo;.
        </p>
      )}
    </>
  );
}
