"use client";

import { ProductCard } from "@/components/product/product-card";
import { StaggerReveal, StaggerItem } from "@/components/luxury/reveal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface ProductGridProps {
  products: Product[];
  density: 3 | 4;
  onClearAll: () => void;
}

export function ProductGrid({ products, density, onClearAll }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
        <p className="font-serif text-2xl text-gold">No pieces match your filters</p>
        <p className="mt-3 max-w-sm text-sm text-gold">
          Try widening your price range, or removing a filter to see more of the collection.
        </p>
        <Button variant="secondary" size="md" className="mt-8" onClick={onClearAll}>
          Clear All Filters
        </Button>
      </div>
    );
  }

  return (
    <StaggerReveal
      className={cn(
        "grid grid-cols-2 gap-x-5 gap-y-14 sm:grid-cols-3 sm:gap-x-6",
        density === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
      )}
    >
      {products.map((product, i) => (
        <StaggerItem key={product.id}>
          <ProductCard
            product={product}
            priority={i === 0}
            sizes={
              density === 4
                ? "(min-width: 1024px) 23vw, (min-width: 640px) 30vw, 45vw"
                : "(min-width: 1024px) 30vw, (min-width: 640px) 30vw, 45vw"
            }
          />
        </StaggerItem>
      ))}
    </StaggerReveal>
  );
}
