import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { TestimonialCarousel } from "./TestimonialCarousel";
import type { Testimonial } from "@/lib/types";

/** Renders nothing until real testimonials exist in Sanity. No placeholder quotes, ever. */
export function Testimonials({ items }: { items: Testimonial[] }) {
  if (!items.length) return null;
  return (
    <section aria-labelledby="testimonials-title" className="theme-stone section-y">
      <Container>
        <Eyebrow id="testimonials-title">In their words</Eyebrow>
        <TestimonialCarousel items={items} />
      </Container>
    </section>
  );
}
