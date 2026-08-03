import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/luxury/container";
import { SectionHeading } from "@/components/luxury/section-heading";
import { Reveal } from "@/components/luxury/reveal";
import { MotifSprig } from "@/components/graphics/motifs";

export function Lookbook() {
  return (
    <section className="py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="The Lookbook"
          title="Styled For The Occasions Between Occasions"
          className="mb-14"
        />

        <div className="grid grid-cols-2 gap-4 md:grid-cols-12 md:grid-rows-2 md:h-[860px]">
          <Reveal className="relative col-span-2 aspect-[16/10] overflow-hidden bg-paper md:aspect-auto md:col-span-5 md:row-span-2">
            <Image
              src="/images/mood/portrait-14.jpg"
              alt="Editorial lookbook image, full-length silhouette in soft studio light"
              fill
              sizes="(min-width: 768px) 40vw, 90vw"
              className="object-cover"
            />
          </Reveal>

          <Reveal delay={0.05} className="relative aspect-square overflow-hidden bg-paper md:aspect-auto md:col-span-4">
            <Image
              src="/images/mood/portrait-16.jpg"
              alt="Editorial lookbook image, close crop of a draped silhouette"
              fill
              sizes="(min-width: 768px) 32vw, 45vw"
              className="object-cover"
            />
          </Reveal>

          <Reveal delay={0.1} className="relative flex flex-col justify-between overflow-hidden bg-ink p-7 text-ivory md:col-span-3">
            <MotifSprig className="h-10 w-10 text-gold-light" />
            <div>
              <p className="font-serif text-xl leading-tight">
                Every piece styled the way we would wear it ourselves.
              </p>
              <Link
                href="/shop"
                className="label-luxury mt-5 inline-flex items-center gap-2 text-ivory/80 transition-colors hover:text-ivory"
              >
                Shop The Edit
                <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.15} className="relative aspect-square overflow-hidden bg-paper md:aspect-auto md:col-span-4">
            <Image
              src="/images/mood/portrait-18.jpg"
              alt="Editorial lookbook image, movement caught mid-stride"
              fill
              sizes="(min-width: 768px) 32vw, 45vw"
              className="object-cover"
            />
          </Reveal>

          <Reveal delay={0.2} className="relative aspect-square overflow-hidden bg-paper md:aspect-auto md:col-span-3">
            <Image
              src="/images/mood/square-10.jpg"
              alt="Editorial lookbook image, detail crop against a quiet backdrop"
              fill
              sizes="(min-width: 768px) 24vw, 45vw"
              className="object-cover"
            />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
