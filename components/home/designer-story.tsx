"use client";

import Link from "next/link";
import Image from "next/image";
import { useContentStore } from "@/lib/store/content-store";
import { Container } from "@/components/luxury/container";
import { Reveal } from "@/components/luxury/reveal";
import { Button } from "@/components/ui/button";

export function DesignerStory() {
  const founderStory = useContentStore((s) => s.founder);

  return (
    <section className="py-24 md:py-32">
      <Container className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-20">
        <Reveal className="relative aspect-[4/5] overflow-hidden bg-paper md:order-2">
          <Image
            src="/images/mood/portrait-20.jpg"
            alt={`${founderStory.founderName}, ${founderStory.title} of Mirenne`}
            fill
            sizes="(min-width: 768px) 45vw, 90vw"
            className="object-cover"
          />
        </Reveal>

        <Reveal className="md:order-1">
          <p className="label-luxury text-gold">Designer Story</p>
          <blockquote className="mt-5 font-serif text-3xl leading-[1.2] text-gold md:text-4xl">
            &ldquo;{founderStory.heroQuote}&rdquo;
          </blockquote>
          <p className="mt-6 text-sm leading-relaxed text-gold">{founderStory.storyParagraphs[0]}</p>
          <div className="mt-7">
            <p className="text-sm text-gold">{founderStory.founderName}</p>
            <p className="text-xs text-gold">{founderStory.title}</p>
          </div>
          <Button asChild variant="secondary" size="md" className="mt-8">
            <Link href="/about">Read Our Full Story</Link>
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}
