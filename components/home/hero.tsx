"use client";

import * as React from "react";
import Link from "next/link";
import { getImageProps } from "next/image";
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
  const mobilePoster = hero.backgroundImageMobile;
  const posterCommon = { alt: "", fill: true, sizes: "100vw", priority: true } as const;
  const {
    props: { srcSet: desktopSrcSet, ...imgProps },
  } = getImageProps({ ...posterCommon, src: hero.backgroundImage });
  const {
    props: { srcSet: mobileSrcSet },
  } = getImageProps({ ...posterCommon, src: mobilePoster || hero.backgroundImage });
  // Picked after mount so each device downloads exactly one reel — a pair of
  // CSS-hidden <video>s would still both fetch.
  const [videoSrc, setVideoSrc] = React.useState<string | undefined>();
  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const pick = () =>
      setVideoSrc(mq.matches ? hero.backgroundVideo : hero.backgroundVideoMobile || hero.backgroundVideo);
    pick();
    mq.addEventListener("change", pick);
    return () => mq.removeEventListener("change", pick);
  }, [hero.backgroundVideo, hero.backgroundVideoMobile]);

  return (
    <section className="relative -mt-20 flex h-screen min-h-[640px] items-center justify-center overflow-hidden md:-mt-24 lg:-mt-[140px]">
      {/* Posters: each reel's opening frame, art-directed per breakpoint with
          <picture> so a device downloads only its own poster. */}
      <picture>
        {mobilePoster && <source media="(max-width: 767px)" srcSet={mobileSrcSet} />}
        <source media={mobilePoster ? "(min-width: 768px)" : "all"} srcSet={desktopSrcSet} />
        {/* eslint-disable-next-line jsx-a11y/alt-text -- decorative; alt="" comes from imgProps */}
        <img {...imgProps} className="object-cover" />
      </picture>
      {videoSrc && (
        <video
          key={videoSrc}
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/35 to-ink/60" />

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
