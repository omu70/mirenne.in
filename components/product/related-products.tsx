"use client";

import Link from "next/link";
import { Container } from "@/components/luxury/container";
import { SectionHeading } from "@/components/luxury/section-heading";
import { StaggerReveal, StaggerItem } from "@/components/luxury/reveal";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { getRelatedProducts } from "@/lib/products/related";
import { useProductStore } from "@/lib/store/product-store";
import type { Product } from "@/lib/types";

interface RelatedProductsProps {
  product: Product;
}

export function RelatedProducts({ product }: RelatedProductsProps) {
  const allProducts = useProductStore((s) => s.products);
  const items = getRelatedProducts(product, allProducts, 4);

  if (items.length === 0) return null;

  return (
    <section className="border-t border-hairline py-20 md:py-28">
      <Container>
        <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading eyebrow="Complete The Look" title="You May Also Like" className="mb-0" />
          <Button asChild variant="link" size="sm">
            <Link href="/shop">Shop All →</Link>
          </Button>
        </div>

        <StaggerReveal className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
          {items.map((p) => (
            <StaggerItem key={p.id}>
              <ProductCard product={p} />
            </StaggerItem>
          ))}
        </StaggerReveal>
      </Container>
    </section>
  );
}
