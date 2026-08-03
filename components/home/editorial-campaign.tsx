"use client";

import { EditorialBanner } from "@/components/luxury/editorial-banner";
import { Container } from "@/components/luxury/container";
import { useContentStore } from "@/lib/store/content-store";

/**
 * A full-bleed editorial moment spotlighting one collection. Previously
 * sourced its image/copy/link from a Journal post; now reads the first
 * collection from the (admin-editable) content store instead, so it has no
 * dependency on Journal data or the (removed) /journal route.
 */
export function EditorialCampaign() {
  const collections = useContentStore((s) => s.collections);
  const collection = collections[0];

  if (!collection) return null;

  return (
    <section className="py-24 md:py-32">
      <Container>
        <EditorialBanner
          image={{ src: collection.bannerImage.src, alt: collection.bannerImage.alt }}
          eyebrow="Featured Collection"
          title={collection.name}
          description={collection.description}
          ctaLabel="Shop The Collection"
          ctaHref={`/shop?collection=${collection.slug}`}
          align="left"
          theme="light"
          aspect="aspect-[21/9]"
          priority
        />
      </Container>
    </section>
  );
}
