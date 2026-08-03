"use client";

import Link from "next/link";
import { useProductStore } from "@/lib/store/product-store";
import { Container } from "@/components/luxury/container";
import { SectionHeading } from "@/components/luxury/section-heading";
import { StaggerReveal, StaggerItem } from "@/components/luxury/reveal";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";

export function NewArrivals() {
  const products = useProductStore((s) => s.products);
  const items = products.filter((p) => p.isNew).slice(0, 4);

  if (items.length === 0) return null;

  return (
    <section className="py-20 md:py-28">
      <Container>
        <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading eyebrow="Just In" title="New Arrivals" className="mb-0" />
          <Button asChild variant="link" size="sm">
            <Link href="/shop?filter=new">View All New Arrivals →</Link>
          </Button>
        </div>

        <StaggerReveal className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
          {items.map((product, i) => (
            <StaggerItem key={product.id}>
              <ProductCard product={product} priority={i === 0} />
            </StaggerItem>
          ))}
        </StaggerReveal>
      </Container>
    </section>
  );
}
