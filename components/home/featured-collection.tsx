"use client";

import { useContentStore, collectionsToMap } from "@/lib/store/content-store";
import { Container } from "@/components/luxury/container";
import { EditorialBanner } from "@/components/luxury/editorial-banner";

export function FeaturedCollection() {
  const collections = useContentStore((s) => s.collections);
  const collection = collectionsToMap(collections)["evening-wear"];

  return (
    <section className="py-20 md:py-28">
      <Container>
        <EditorialBanner
          image={{ src: collection.bannerImage.src, alt: collection.bannerImage.alt }}
          eyebrow="Featured Collection"
          title={collection.name}
          description={collection.description}
          ctaLabel={`Explore ${collection.name}`}
          ctaHref={`/collections/${collection.slug}`}
          align="right"
          theme="light"
          aspect="aspect-[4/5] md:aspect-[16/9]"
        />
      </Container>
    </section>
  );
}
