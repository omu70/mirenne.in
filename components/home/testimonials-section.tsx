"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import { testimonials } from "@/lib/data/testimonials";
import { Container } from "@/components/luxury/container";
import { SectionHeading } from "@/components/luxury/section-heading";

export function TestimonialsSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [canPrev, setCanPrev] = React.useState(false);
  const [canNext, setCanNext] = React.useState(false);

  // Subscribe to embla's own selection events (an external system) and
  // mirror its scrollable-state into React state for the arrow buttons.
  React.useEffect(() => {
    if (!emblaApi) return;
    const update = () => {
      setCanPrev(emblaApi.canScrollPrev());
      setCanNext(emblaApi.canScrollNext());
    };
    update();
    emblaApi.on("select", update);
    emblaApi.on("reInit", update);
    return () => {
      emblaApi.off("select", update);
      emblaApi.off("reInit", update);
    };
  }, [emblaApi]);

  return (
    <section className="py-20 md:py-28">
      <Container>
        <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading eyebrow="In Their Words" title="From Our Clients" className="mb-0" />
          <div className="flex gap-3">
            <button
              onClick={() => emblaApi?.scrollPrev()}
              disabled={!canPrev}
              aria-label="Previous testimonial"
              className="flex h-11 w-11 cursor-pointer items-center justify-center border border-hairline-dark text-gold transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.25} />
            </button>
            <button
              onClick={() => emblaApi?.scrollNext()}
              disabled={!canNext}
              aria-label="Next testimonial"
              className="flex h-11 w-11 cursor-pointer items-center justify-center border border-hairline-dark text-gold transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ArrowRight className="h-4 w-4" strokeWidth={1.25} />
            </button>
          </div>
        </div>
      </Container>

      <div className="overflow-hidden" ref={emblaRef}>
        <Container>
          <div className="flex gap-6">
            {testimonials.map((t) => (
              <div
                key={t.customerName}
                className="min-w-0 flex-[0_0_85%] border border-hairline p-8 sm:flex-[0_0_60%] md:flex-[0_0_38%] md:p-10"
              >
                <Quote className="h-6 w-6 text-gold" strokeWidth={1.25} />
                <p className="mt-5 min-h-24 font-serif text-lg leading-relaxed text-gold md:text-xl">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-6 border-t border-hairline pt-4">
                  <p className="text-sm text-gold">{t.customerName}</p>
                  <p className="text-xs text-gold">
                    {t.location} · {t.occasion}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </div>
    </section>
  );
}
