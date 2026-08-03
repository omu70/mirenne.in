"use client";

import { useProductStore } from "@/lib/store/product-store";
import { Container } from "@/components/luxury/container";
import { SectionHeading } from "@/components/luxury/section-heading";
import { StaggerReveal, StaggerItem } from "@/components/luxury/reveal";
import { ProductCard } from "@/components/product/product-card";

export function FeaturedProducts() {
  // Top-rated four, rather than a hand-picked/hardcoded slug list — the
  // catalogue is now admin-editable, so a fixed slug list would silently
  // go empty the moment those specific pieces are removed.
  const products = useProductStore((s) => s.products);
  const items = [...products]
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    .slice(0, 4);

  if (items.length === 0) return null;

  return (
    <section className="bg-paper py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="The Edit"
          title="Four Pieces Worth The Occasion"
          description="A hand-picked selection from across our collections — the pieces our styling team reaches for first when a client asks what to wear to the evening that matters most."
          align="center"
          className="mx-auto mb-14 max-w-2xl items-center text-center"
        />

        <StaggerReveal className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
          {items.map((product) => (
            <StaggerItem key={product.id}>
              <ProductCard product={product} />
            </StaggerItem>
          ))}
        </StaggerReveal>
      </Container>
    </section>
  );
}
