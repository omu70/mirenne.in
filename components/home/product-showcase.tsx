"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Star } from "lucide-react";
import { cn, formatINR, isUnoptimizableSrc } from "@/lib/utils";
import { useProductStore } from "@/lib/store/product-store";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import { useMounted } from "@/lib/hooks/use-mounted";
import { collectionMap } from "@/lib/data/collections";
import { Container } from "@/components/luxury/container";
import { SectionHeading } from "@/components/luxury/section-heading";
import { Reveal } from "@/components/luxury/reveal";
import { LuxuryBadge } from "@/components/luxury/badge";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";

const AVAILABILITY_LABEL: Record<Product["availability"], string> = {
  "in-stock": "In Stock",
  "low-stock": "Low Stock",
  "made-to-order": "Made To Order",
};

/**
 * The homepage's full product showcase, replacing three separate 4-up
 * grids (New Arrivals / Best Sellers / The Edit) that — with only six
 * pieces in the whole catalogue — mostly reshuffled the same cards across
 * the page rather than actually showing more product. Every piece now
 * gets its own full-width, editorial moment: a portrait image plus a
 * two-shot detail gallery on one side, the full pitch (collection, name,
 * rating, description, price, availability, one clear CTA) on the other —
 * sides alternating per product so scrolling through all six reads as a
 * considered sequence rather than a repeated template. NewArrivals /
 * BestSellers / FeaturedProducts are left in place, just unused, in case
 * a future catalogue with more SKUs wants grid-style rails again.
 */
export function ProductShowcase() {
  const products = useProductStore((s) => s.products);

  if (products.length === 0) return null;

  return (
    <section className="py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="The Collection"
          title="Six Pieces, Made For You"
          description="Every Mirenne piece is made to order, shaped by karigars once you've placed your order, not pulled from a rack. Here's the full collection, one piece at a time."
          align="center"
          className="mx-auto mb-16 max-w-2xl items-center text-center md:mb-20"
        />
      </Container>

      <div>
        {products.map((product, index) => (
          <ProductRow
            key={product.id}
            product={product}
            reversed={index % 2 === 1}
            first={index === 0}
          />
        ))}
      </div>

      <Container className="mt-16 flex justify-center md:mt-20">
        <Button asChild variant="secondary" size="lg">
          <Link href="/shop">Shop The Full Collection</Link>
        </Button>
      </Container>
    </section>
  );
}

function ProductRow({
  product,
  reversed,
  first,
}: {
  product: Product;
  reversed: boolean;
  first: boolean;
}) {
  const mounted = useMounted();
  const isWishlisted = useWishlistStore((s) => s.has(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const roundedRating = Math.round(product.rating);
  const gallery = product.images.slice(1, 3);

  return (
    <div
      className={cn(
        "border-hairline py-16 md:py-20",
        !first && "border-t",
        reversed ? "bg-paper" : "bg-ivory"
      )}
    >
      <Container className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal className={cn("relative", reversed && "lg:order-2")}>
          <div className="relative aspect-[4/5] overflow-hidden bg-paper">
            <Image
              src={product.images[0].src}
              alt={product.images[0].alt}
              unoptimized={isUnoptimizableSrc(product.images[0].src)}
              fill
              priority={first}
              sizes="(min-width: 1024px) 45vw, 90vw"
              className="object-cover"
            />
            <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-2">
              {product.isNew && <LuxuryBadge variant="dark">New</LuxuryBadge>}
              {product.isBestSeller && <LuxuryBadge variant="gold">Best Seller</LuxuryBadge>}
            </div>
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              aria-label={mounted && isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
              className="absolute right-3 top-3 flex h-9 w-9 cursor-pointer items-center justify-center bg-ivory/90 text-gold transition-colors hover:text-gold-dark"
            >
              <Heart
                className={cn("h-4 w-4 transition-colors", mounted && isWishlisted && "fill-gold text-gold")}
                strokeWidth={1.25}
              />
            </button>
          </div>

          {gallery.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              {gallery.map((img) => (
                <div key={img.src} className="relative aspect-square overflow-hidden bg-paper">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    unoptimized={isUnoptimizableSrc(img.src)}
                    fill
                    sizes="(min-width: 1024px) 22vw, 45vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </Reveal>

        <Reveal delay={0.1} className={cn(reversed && "lg:order-1")}>
          {product.collection && (
            <p className="label-luxury text-gold">{collectionMap[product.collection]?.name}</p>
          )}

          <Link href={`/product/${product.slug}`}>
            <h3 className="mt-4 font-serif text-3xl leading-[1.1] text-gold transition-colors hover:text-gold-dark md:text-4xl">
              {product.name}
            </h3>
          </Link>

          {product.reviewCount > 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gold">
              <span className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn("h-3.5 w-3.5", i < roundedRating ? "fill-gold text-gold" : "text-hairline-dark")}
                    strokeWidth={1.25}
                  />
                ))}
              </span>
              <span>
                {product.rating.toFixed(1)} ({product.reviewCount} review{product.reviewCount === 1 ? "" : "s"})
              </span>
            </div>
          )}

          <p className="mt-5 max-w-md text-sm leading-relaxed text-gold md:text-base">
            {product.shortDescription}
          </p>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-xl text-gold">{formatINR(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-sm text-gold line-through">{formatINR(product.compareAtPrice)}</span>
            )}
          </div>

          {product.colors.length > 1 && (
            <div className="mt-4 flex gap-1.5">
              {product.colors.slice(0, 5).map((c) => (
                <span
                  key={c.name}
                  title={c.name}
                  className="h-4 w-4 rounded-full border border-hairline-dark"
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          )}

          <p className="mt-5 text-xs text-gold">
            {AVAILABILITY_LABEL[product.availability]} · {product.deliveryEstimate}
          </p>

          <Button asChild variant="primary" size="lg" className="mt-7" aria-label={`Shop ${product.name}`}>
            <Link href={`/product/${product.slug}`}>Shop This Piece</Link>
          </Button>
        </Reveal>
      </Container>
    </div>
  );
}
