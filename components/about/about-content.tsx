"use client";

import Link from "next/link";
import { Container } from "@/components/luxury/container";
import { Reveal } from "@/components/luxury/reveal";
import { Button } from "@/components/ui/button";
import { useContentStore } from "@/lib/store/content-store";

/** Splits a stored copy block on blank lines into standalone paragraphs. */
function Paragraphs({ text, className }: { text: string; className?: string }) {
  return (
    <div className={className}>
      {text.split("\n\n").map((paragraph, i) => (
        <p key={i} className={i > 0 ? "mt-5" : undefined}>
          {paragraph}
        </p>
      ))}
    </div>
  );
}

/**
 * Reads from the (admin-editable) content store rather than importing
 * lib/data/about.ts directly, so a rewrite from /admin/homepage shows up
 * here too — the same convention Hero, EditorialCampaign, and Footer use
 * for their content-store-backed copy.
 */
export function AboutContent() {
  const about = useContentStore((s) => s.about);

  return (
    <>
      <section className="border-b border-hairline bg-paper py-20 md:py-28">
        <Container className="max-w-3xl text-center">
          <Reveal>
            <p className="label-luxury text-gold">About Mirenne</p>
            <h1 className="mt-5 font-serif text-4xl leading-[1.1] text-gold md:text-5xl">
              {about.heroHeadline}
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-gold md:text-base">
              {about.heroSubline}
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="py-20 md:py-28">
        <Container className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <p className="label-luxury text-gold">The Meaning Of Mirenne</p>
            <Paragraphs
              text={about.philosophyStatement}
              className="mt-5 space-y-0 text-sm leading-relaxed text-gold md:text-base"
            />
          </Reveal>
          <Reveal delay={0.1}>
            <p className="label-luxury text-gold">The Shape It Took</p>
            <Paragraphs
              text={about.madeInIndiaStatement}
              className="mt-5 space-y-0 text-sm leading-relaxed text-gold md:text-base"
            />
          </Reveal>
        </Container>
      </section>

      <section className="border-t border-hairline bg-ink py-20 text-center text-ivory md:py-28">
        <Container className="max-w-xl">
          <Reveal className="flex flex-col items-center">
            <h2 className="font-serif text-3xl leading-[1.1] md:text-4xl">
              Every daydream deserves to be worn.
            </h2>
            <Button asChild variant="gold" size="lg" className="mt-8">
              <Link href="/shop">Shop The Collection</Link>
            </Button>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
