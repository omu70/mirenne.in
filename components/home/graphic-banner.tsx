import Image from "next/image";
import { Reveal } from "@/components/luxury/reveal";

/**
 * A pure graphic/abstract full-bleed banner — a quiet visual pause between
 * the product-led sections above and the brand-story section below.
 * Deliberately carries no copy, eyebrow, or CTA: the black-to-white field
 * itself is the moment. Two art-directed crops (distinct source images, not
 * one file stretched) swap at the md breakpoint: 19:6 panoramic on desktop,
 * 4:5 upright on mobile — both generated from the same monochrome recipe so
 * they read as one piece of art framed two ways.
 */
export function GraphicBanner() {
  return (
    <section className="bg-ink">
      <Reveal className="w-full">
        <div className="relative hidden w-full aspect-[19/6] md:block">
          <Image
            src="/images/banner/banner-desktop.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="relative w-full aspect-[4/5] md:hidden">
          <Image
            src="/images/banner/banner-mobile.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </Reveal>
    </section>
  );
}
