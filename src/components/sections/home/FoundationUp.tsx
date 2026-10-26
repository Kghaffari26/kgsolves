import Image from "next/image";
import { HouseDrawing } from "./HouseDrawing";
import { FoundationUpScroller } from "./FoundationUpScroller";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import type { ImageAsset } from "@/lib/types";

export const stages = [
  {
    key: "concrete",
    label: "Concrete",
    body: "Our own crew forms, reinforces and pours the footings and slab. Everything above depends on getting this right.",
  },
  {
    key: "framing",
    label: "Framing",
    body: "Our framers stand the walls, floors and roof structure, with pre-fab and modular framing where it saves time on site.",
  },
  {
    key: "envelope",
    label: "Envelope",
    body: "Roof, sheathing, windows and doors close the structure in, run by the same team that built the frame.",
  },
  {
    key: "finished",
    label: "Finished",
    body: "One contractor from the first pour to the final walkthrough.",
  },
] as const;

function Intro() {
  return (
    <>
      <Eyebrow>Foundation up</Eyebrow>
      <Heading size="h2" className="mt-5 max-w-[16ch]">
        We build the bones ourselves.
      </Heading>
    </>
  );
}

/**
 * Signature section. Motion users get a pinned, scroll-scrubbed drawing (FoundationUpScroller);
 * reduced-motion users get the same four stages as a static grid. The switch is pure CSS
 * (.motion-only / .reduced-only), so neither version flashes before hydration.
 */
export function FoundationUp({ finished }: { finished: ImageAsset }) {
  return (
    <section aria-labelledby="foundation-title" className="theme-stone relative">
      <h2 id="foundation-title" className="sr-only">
        Foundation up: how we build
      </h2>

      {/* Animated version */}
      <div className="motion-only">
        <FoundationUpScroller
          intro={<Intro />}
          stages={stages.map(({ key, label, body }) => ({ key, label, body }))}
          finished={
            <Image
              src={finished.src}
              alt={finished.alt}
              fill
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-cover"
            />
          }
        />
      </div>

      {/* Reduced-motion version */}
      <div className="reduced-only section-y container-site" data-testid="foundation-static">
        <Intro />
        <ol className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {stages.map((s, i) => (
            <li key={s.key} className="border-t border-rule pt-5">
              <div className="relative aspect-[5/3] overflow-hidden bg-paper text-ink">
                {i < 3 ? (
                  <HouseDrawing stage={(i + 1) as 1 | 2 | 3} className="size-full p-3" />
                ) : (
                  <Image
                    src={finished.src}
                    alt={finished.alt}
                    fill
                    sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                )}
              </div>
              <p className="eyebrow mt-5 text-accent-text">
                {String(i + 1).padStart(2, "0")} · {s.label}
              </p>
              <p className="mt-3 text-fg">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
