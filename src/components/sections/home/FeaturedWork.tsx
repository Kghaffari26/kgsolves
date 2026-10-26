import { ProjectCard } from "@/components/work/ProjectCard";
import { HorizontalScroller } from "./HorizontalScroller";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { Button } from "@/components/ui/Button";
import type { Project } from "@/lib/types";

export function FeaturedWork({ projects }: { projects: Project[] }) {
  return (
    <section aria-labelledby="featured-title" className="relative overflow-hidden">
      <HorizontalScroller
        header={
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>Selected work</Eyebrow>
              <Heading id="featured-title" className="mt-5 max-w-[14ch]">
                Homes on the coast we know best.
              </Heading>
            </div>
            <Button href="/work" variant="text" arrow>
              All projects
            </Button>
          </div>
        }
      >
        {projects.map((p) => (
          <li
            key={p.slug}
            className="w-[82vw] shrink-0 snap-start sm:w-[58vw] lg:w-[38vw] lg:[--ps:1.16] motion-reduce:lg:[--ps:1] xl:w-[34vw]"
            data-card
          >
            <ProjectCard project={p} sizes="(min-width: 1024px) 38vw, 82vw" aspect="aspect-[4/5]" />
          </li>
        ))}
      </HorizontalScroller>
    </section>
  );
}
