"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/luxury/reveal";
import { useContentStore } from "@/lib/store/content-store";

/**
 * -mt-20 md:-mt-24 lg:-mt-[140px] cancels the top padding SiteChrome's <main>
 * applies for the fixed Navbar (single row below `lg`, two rows — logo +
 * centered nav — at `lg` and up), so this section runs full-bleed to the
 * true viewport top and the transparent nav floats over it as designed.
 * Copy, background image, and CTAs read from the content store so
 * /admin/homepage can rewrite them; the store's initial state is this same
 * copy, so there's nothing to hydrate-guard here — first paint always matches.
 */
export function Hero() {
  const hero = useContentStore((s) => s.hero);

  return (
    <section className="relative -mt-20 flex h-screen min-h-[640px] items-center justify-center overflow-hidden md:-mt-24 lg:-mt-[140px]">
      <Image
        src={hero.backgroundImage}
        alt="Soft taupe and gold editorial light field, the Mirenne atelier mood"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {hero.backgroundVideo && (
        <video
          src={hero.backgroundVideo}
          poster={hero.backgroundImage}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/50 via-ink/15 to-ink/45" />

      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center px-6 text-center">
        {hero.eyebrow && (
          <Reveal>
            <p className="label-luxury text-gold-light">{hero.eyebrow}</p>
          </Reveal>
        )}
        <Reveal delay={0.1}>
          <h1 className="mt-5 font-serif text-5xl leading-[1.05] text-ivory sm:text-6xl md:text-7xl">
            {hero.headlineLine1}
            <br />
            {hero.headlineLine2}
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-ivory/85 md:text-base">
            {hero.subheadline}
          </p>
        </Reveal>
        <Reveal delay={0.3} className="mt-9 flex flex-col gap-4 sm:flex-row">
          <Button asChild variant="gold" size="lg">
            <Link href={hero.primaryCtaHref}>{hero.primaryCtaLabel}</Link>
          </Button>
          {hero.secondaryCtaLabel && hero.secondaryCtaHref && (
            <Button asChild variant="outlineLight" size="lg">
              <Link href={hero.secondaryCtaHref}>{hero.secondaryCtaLabel}</Link>
            </Button>
          )}
        </Reveal>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-ivory/70">
        <ChevronDown className="h-5 w-5 animate-bounce" strokeWidth={1.25} />
      </div>
    </section>
  );
}
