"use client";

import { useContentStore } from "@/lib/store/content-store";
import { Container } from "@/components/luxury/container";
import { SectionHeading } from "@/components/luxury/section-heading";
import { StaggerReveal, StaggerItem } from "@/components/luxury/reveal";
import { CollectionCard } from "@/components/luxury/collection-card";

export function CollectionBanner() {
  const collections = useContentStore((s) => s.collections);

  return (
    <section className="py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Shop By Collection"
          title="Seven Ways To Dress The Occasion"
          description="Each collection is built around a single kind of moment — the ones we think deserve a little more consideration than the rest of the wardrobe."
          align="center"
          className="mx-auto mb-14 items-center text-center"
        />

        <StaggerReveal className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          {collections.map((collection) => (
            <StaggerItem key={collection.slug}>
              <CollectionCard collection={collection} sizes="(min-width: 1024px) 14vw, (min-width: 640px) 30vw, 45vw" />
            </StaggerItem>
          ))}
        </StaggerReveal>
      </Container>
    </section>
  );
}
