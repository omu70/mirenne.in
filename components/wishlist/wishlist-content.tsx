"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { Container } from "@/components/luxury/container";
import { SectionHeading } from "@/components/luxury/section-heading";
import { StaggerReveal, StaggerItem } from "@/components/luxury/reveal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/product/product-card";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import { useProductStore } from "@/lib/store/product-store";
import { useMounted } from "@/lib/hooks/use-mounted";

/**
 * The wishlist heart has been in the header and on every product card from the
 * start, and the store behind it worked — but /wishlist was never built, so
 * every one of those hearts led to a 404. This is that page.
 *
 * Ids are resolved against the live catalogue rather than stored alongside the
 * product, so a piece removed from the catalogue simply drops out of the list
 * instead of rendering a broken card.
 */
export function WishlistContent() {
  const mounted = useMounted();
  const productIds = useWishlistStore((s) => s.productIds);
  const clear = useWishlistStore((s) => s.clear);
  const products = useProductStore((s) => s.products);

  if (!mounted) {
    return (
      <Container className="py-14">
        <Skeleton className="mb-10 h-10 w-56" />
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full" />
          ))}
        </div>
      </Container>
    );
  }

  const saved = productIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (saved.length === 0) {
    return (
      <Container className="py-24">
        <div className="mx-auto max-w-md text-center">
          <Heart className="mx-auto h-8 w-8 text-gold" strokeWidth={1} />
          <h1 className="mt-6 font-serif text-3xl text-gold">Nothing saved yet</h1>
          <p className="mt-3 text-sm leading-relaxed text-gold">
            Tap the heart on any piece to keep it here while you decide.
          </p>
          <Button asChild variant="primary" size="lg" className="mt-8">
            <Link href="/shop">Shop All</Link>
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-10 md:py-14">
      <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <SectionHeading
          eyebrow="Saved For Later"
          title="Your Wishlist"
          description={`${saved.length} ${saved.length === 1 ? "piece" : "pieces"} saved.`}
          className="mb-0"
        />
        <button
          onClick={clear}
          className="label-luxury link-underline cursor-pointer text-gold hover:text-gold-dark"
        >
          Clear Wishlist
        </button>
      </div>

      <StaggerReveal className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
        {saved.map((product, i) => (
          <StaggerItem key={product.id}>
            <ProductCard product={product} priority={i === 0} />
          </StaggerItem>
        ))}
      </StaggerReveal>
    </Container>
  );
}
