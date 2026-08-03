import { Container } from "@/components/luxury/container";
import { Reveal } from "@/components/luxury/reveal";

interface DesignerNoteProps {
  note: string;
}

/**
 * A quiet, one-line pause between the buy box and the more data-dense
 * sections below (reviews, related product grids) — mirrors the blockquote
 * treatment used in the home page's DesignerStory section so the voice
 * reads as the same person speaking in both places.
 */
export function DesignerNote({ note }: DesignerNoteProps) {
  return (
    <section className="border-t border-hairline bg-paper py-16 md:py-24">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="label-luxury text-gold">From The Designer</p>
          <blockquote className="mt-5 font-serif text-2xl leading-[1.35] text-gold md:text-3xl">
            &ldquo;{note}&rdquo;
          </blockquote>
        </Reveal>
      </Container>
    </section>
  );
}
