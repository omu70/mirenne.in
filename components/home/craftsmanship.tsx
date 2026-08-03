import Image from "next/image";
import { founderStory } from "@/lib/data/founder";
import { Container } from "@/components/luxury/container";
import { Reveal, StaggerReveal, StaggerItem } from "@/components/luxury/reveal";

// Kept to facts the Website Content Handoff doc actually confirms (About
// page: "Built slowly, from Indore" + "every piece is made-to-order") —
// the previous stats named a founding year and atelier cities that appear
// nowhere in that doc and, in the founding-city case, contradicted it.
const STATS = [
  { value: "Indore", label: "Where We're Based" },
  { value: "Made-To-Order", label: "Every Piece" },
  { value: "100%", label: "Made In India" },
];

export function Craftsmanship() {
  return (
    <section className="bg-paper py-24 md:py-32">
      <Container className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-20">
        <Reveal className="relative aspect-[4/5] overflow-hidden bg-ivory">
          <Image
            src="/images/mood/atelier-02.jpg"
            alt="Warm, textured light evoking the Mirenne atelier where each piece is hand-finished"
            fill
            sizes="(min-width: 768px) 45vw, 90vw"
            className="object-cover"
          />
        </Reveal>

        <div>
          <Reveal>
            <p className="label-luxury text-gold">Craftsmanship</p>
            <h2 className="mt-5 font-serif text-4xl leading-[1.1] text-gold md:text-5xl">
              Where Hands Remember What Machines Forget
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-gold">
              {founderStory.craftsmanshipNote.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </Reveal>

          <StaggerReveal className="mt-10 grid grid-cols-3 gap-6 border-t border-hairline-dark pt-8">
            {STATS.map((stat) => (
              <StaggerItem key={stat.label}>
                <p className="font-serif text-lg text-gold md:text-xl">{stat.value}</p>
                <p className="label-luxury mt-1.5 text-[10px] text-gold">{stat.label}</p>
              </StaggerItem>
            ))}
          </StaggerReveal>
        </div>
      </Container>
    </section>
  );
}
