"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LuxuryBadge } from "@/components/luxury/badge";
import { useCartStore } from "@/lib/store/cart-store";
import { collectionMap } from "@/lib/data/collections";
import { cn, formatINR, isUnoptimizableSrc } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { track } from "@/lib/analytics/events";

interface QuickViewProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickView({ product, open, onOpenChange }: QuickViewProps) {
  const [color, setColor] = React.useState(product.colors[0]?.name ?? "");
  const [size, setSize] = React.useState(product.sizes[0] ?? "");
  const addItem = useCartStore((s) => s.addItem);

  // Keep the selection valid if QuickView is reused for a different product
  // instance without unmounting (e.g. swapped via key-less re-render).
  const [lastProductId, setLastProductId] = React.useState(product.id);
  if (product.id !== lastProductId) {
    setLastProductId(product.id);
    setColor(product.colors[0]?.name ?? "");
    setSize(product.sizes[0] ?? "");
  }

  const handleAdd = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0].src,
      color,
      size,
    });
    track.addToCart({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      quantity: 1,
      category: product.category,
    });
    toast.success(`${product.name} added to your bag.`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogTitle className="sr-only">{product.name} — Quick View</DialogTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <div className="relative aspect-[4/5] sm:aspect-auto sm:h-full">
            <Image
              src={product.images[0].src}
              alt={product.images[0].alt}
              unoptimized={isUnoptimizableSrc(product.images[0].src)}
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute left-4 top-4 flex flex-col gap-2">
              {product.isNew && <LuxuryBadge variant="dark">New</LuxuryBadge>}
              {product.isBestSeller && <LuxuryBadge variant="gold">Best Seller</LuxuryBadge>}
            </div>
          </div>

          <div className="flex flex-col p-8 md:p-10">
            {product.collection && (
              <p className="label-luxury text-gold">{collectionMap[product.collection]?.name}</p>
            )}
            <h3 className="mt-2 font-serif text-2xl leading-tight text-gold md:text-3xl">{product.name}</h3>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-lg text-gold">{formatINR(product.price)}</span>
              {product.compareAtPrice && (
                <span className="text-sm text-gold line-through">{formatINR(product.compareAtPrice)}</span>
              )}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-gold">{product.shortDescription}</p>

            {product.colors.length > 0 && (
              <div className="mt-6">
                <p className="label-luxury mb-3 text-gold">
                  Color — <span className="text-gold">{color}</span>
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setColor(c.name)}
                      aria-label={c.name}
                      aria-pressed={color === c.name}
                      className={cn(
                        "h-8 w-8 cursor-pointer rounded-full border transition-all",
                        color === c.name ? "border-ink ring-1 ring-ink ring-offset-2" : "border-hairline-dark hover:border-ink"
                      )}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>
            )}

            {product.sizes.length > 0 && (
              <div className="mt-6">
                <p className="label-luxury mb-3 text-gold">Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      aria-pressed={size === s}
                      className={cn(
                        "flex h-10 min-w-10 cursor-pointer items-center justify-center border px-3 text-xs transition-colors",
                        size === s ? "border-ink bg-ink text-ivory" : "border-hairline-dark text-gold hover:border-ink"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3">
              <Button variant="primary" size="lg" onClick={handleAdd}>
                Add To Bag
              </Button>
              <Button asChild variant="link" size="sm" onClick={() => onOpenChange(false)}>
                <Link href={`/product/${product.slug}`}>View Full Details</Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
