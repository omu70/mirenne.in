"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { cn, formatINR } from "@/lib/utils";
import { LuxuryBadge } from "@/components/luxury/badge";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import { useMounted } from "@/lib/hooks/use-mounted";
import { collectionMap } from "@/lib/data/collections";
import { QuickView } from "@/components/product/quick-view";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  sizes?: string;
}

export function ProductCard({ product, priority, sizes }: ProductCardProps) {
  const mounted = useMounted();
  const isWishlisted = useWishlistStore((s) => s.has(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const [quickViewOpen, setQuickViewOpen] = React.useState(false);

  const primaryImage = product.images[0];
  const secondaryImage = product.images[1] ?? primaryImage;

  return (
    <>
      <div className="group relative">
        <div className="relative aspect-[3/4] overflow-hidden bg-paper">
          <Link href={`/product/${product.slug}`} className="relative block h-full w-full" aria-label={product.name}>
            <Image
              src={primaryImage.src}
              alt={primaryImage.alt}
              fill
              priority={priority}
              sizes={sizes ?? "(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 90vw"}
              className="object-cover transition-opacity duration-700 ease-out group-hover:opacity-0"
            />
            <Image
              src={secondaryImage.src}
              alt={secondaryImage.alt}
              fill
              sizes={sizes ?? "(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 90vw"}
              className="absolute inset-0 object-cover opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-100"
            />
          </Link>

          <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-2">
            {product.isNew && <LuxuryBadge variant="dark">New</LuxuryBadge>}
            {product.isBestSeller && <LuxuryBadge variant="gold">Best Seller</LuxuryBadge>}
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product.id);
            }}
            aria-label={mounted && isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute right-3 top-3 flex h-9 w-9 cursor-pointer items-center justify-center bg-ivory/90 text-gold transition-colors hover:text-gold-dark"
          >
            <Heart
              className={cn("h-4 w-4 transition-colors", mounted && isWishlisted && "fill-gold text-gold")}
              strokeWidth={1.25}
            />
          </button>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-ivory/95 p-3 text-center opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.preventDefault();
                setQuickViewOpen(true);
              }}
              className="label-luxury pointer-events-auto w-full cursor-pointer text-gold hover:text-gold-dark"
            >
              Quick View
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/product/${product.slug}`}
              className="line-clamp-1 text-sm text-gold transition-colors hover:text-gold-dark"
            >
              {product.name}
            </Link>
            <p className="mt-1 text-xs text-gold">{collectionMap[product.collection].name}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm text-gold">{formatINR(product.price)}</p>
            {product.compareAtPrice && (
              <p className="text-xs text-gold line-through">{formatINR(product.compareAtPrice)}</p>
            )}
          </div>
        </div>

        {product.colors.length > 1 && (
          <div className="mt-2 flex gap-1.5">
            {product.colors.slice(0, 5).map((c) => (
              <span
                key={c.name}
                title={c.name}
                className="h-3 w-3 rounded-full border border-hairline-dark"
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        )}
      </div>

      <QuickView product={product} open={quickViewOpen} onOpenChange={setQuickViewOpen} />
    </>
  );
}
