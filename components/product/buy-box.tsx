"use client";

import * as React from "react";
import Link from "next/link";
import { Heart, Minus, Plus, Ruler, ShieldCheck, Star, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SizeGuideDialog } from "@/components/product/size-guide-dialog";
import { CustomizeSection } from "@/components/product/customize-section";
import { useCartStore } from "@/lib/store/cart-store";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import { useMounted } from "@/lib/hooks/use-mounted";
import { collectionMap } from "@/lib/data/collections";
import { cn, formatINR } from "@/lib/utils";
import { collectionHref } from "@/lib/collections/href";
import type { Product } from "@/lib/types";

const AVAILABILITY_LABEL: Record<Product["availability"], string> = {
  "in-stock": "In Stock",
  "low-stock": "Low Stock",
  "made-to-order": "Made To Order",
};

interface BuyBoxProps {
  product: Product;
}

export function BuyBox({ product }: BuyBoxProps) {
  const mounted = useMounted();
  const addItem = useCartStore((s) => s.addItem);
  const isWishlisted = useWishlistStore((s) => s.has(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);

  const [color, setColor] = React.useState(product.colors[0]?.name ?? "");
  const [size, setSize] = React.useState(product.sizes[0] ?? "");
  const [quantity, setQuantity] = React.useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = React.useState(false);

  const collection = product.collection ? collectionMap[product.collection] : undefined;
  const roundedRating = Math.round(product.rating);

  const details = product.details ?? [];

  const handleAddToBag = () => {
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.images[0].src,
        color,
        size,
      },
      quantity
    );
    toast.success(`${product.name} added to your bag.`, {
      description: `${color} · ${size} · Qty ${quantity}`,
    });
  };

  return (
    <div>
      {collection && (
        <Link
          href={collectionHref(product.collection ?? "")}
          className="label-luxury text-gold transition-colors hover:text-gold-dark"
        >
          {collection.name}
        </Link>
      )}

      <h1
        className={cn(
          "font-serif text-3xl leading-[1.1] text-gold sm:text-4xl",
          collection && "mt-3"
        )}
      >
        {product.name}
      </h1>

      {product.reviewCount > 0 && (
        <div className="mt-3 flex w-fit items-center gap-2 text-sm text-gold">
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

      <div className="mt-5 flex items-baseline gap-3">
        <span className="text-xl text-gold">{formatINR(product.price)}</span>
        {product.compareAtPrice && (
          <span className="text-sm text-gold line-through">{formatINR(product.compareAtPrice)}</span>
        )}
      </div>

      <p className="mt-5 max-w-md text-sm leading-relaxed text-gold">{product.shortDescription}</p>

      {product.colors.length > 0 && (
        <div className="mt-8">
          <p className="label-luxury mb-3 text-gold">
            Color — <span className="text-gold">{color}</span>
          </p>
          <div className="flex flex-wrap gap-2.5">
            {product.colors.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => setColor(c.name)}
                aria-label={c.name}
                aria-pressed={color === c.name}
                className={cn(
                  "h-9 w-9 cursor-pointer rounded-full border transition-all",
                  color === c.name ? "border-ink ring-1 ring-ink ring-offset-2" : "border-hairline-dark hover:border-ink"
                )}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>
      )}

      {product.sizes.length > 0 && (
        <div className="mt-7">
          <div className="mb-3 flex items-center justify-between">
            <p className="label-luxury text-gold">Size</p>
            <button
              type="button"
              onClick={() => setSizeGuideOpen(true)}
              className="label-luxury link-underline flex cursor-pointer items-center gap-1.5 text-gold hover:text-gold-dark"
            >
              <Ruler className="h-3.5 w-3.5" strokeWidth={1.25} />
              Size Guide
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                aria-pressed={size === s}
                className={cn(
                  "flex h-11 min-w-11 cursor-pointer items-center justify-center border px-4 text-xs transition-colors",
                  size === s ? "border-ink bg-ink text-ivory" : "border-hairline-dark text-gold hover:border-ink"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <CustomizeSection product={product} variant="inline" />

      <div className="mt-7">
        <p className="label-luxury flex items-center gap-2 text-gold">
          {product.availability === "low-stock" && (
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ink opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-ink" />
            </span>
          )}
          {AVAILABILITY_LABEL[product.availability]}
        </p>
        {product.deliveryEstimate && (
          <p className="mt-1 text-xs text-gold">{product.deliveryEstimate}</p>
        )}
      </div>

      <div className="mt-7 flex items-center gap-4">
        <p className="label-luxury text-gold">Quantity</p>
        <div className="flex items-center border border-hairline-dark">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-11 w-11 cursor-pointer items-center justify-center text-gold hover:text-gold-dark"
            aria-label="Decrease quantity"
          >
            <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          <span className="w-8 text-center text-sm text-gold">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(9, q + 1))}
            className="flex h-11 w-11 cursor-pointer items-center justify-center text-gold hover:text-gold-dark"
            aria-label="Increase quantity"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <Button id="pdp-add-to-bag" variant="primary" size="lg" className="flex-1" onClick={handleAddToBag}>
          Add To Bag
        </Button>
        <button
          onClick={() => toggleWishlist(product.id)}
          aria-label={mounted && isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center border border-ink text-gold transition-colors hover:bg-ink hover:text-ivory"
        >
          <Heart className={cn("h-[18px] w-[18px]", mounted && isWishlisted && "fill-current")} strokeWidth={1.25} />
        </button>
      </div>

      {/* Trust signals sit right below the primary CTA — the point of
          hesitation — rather than after the accordion where they'd arrive
          too late to influence the decision. */}
      <div className="mt-6 flex flex-col gap-3 text-xs text-gold">
        <p className="flex items-center gap-2.5">
          <ShieldCheck className="h-4 w-4 shrink-0" strokeWidth={1.25} />
          Secure checkout · Cards, UPI &amp; Net Banking accepted
        </p>
        <p className="flex items-center gap-2.5">
          <Truck className="h-4 w-4 shrink-0" strokeWidth={1.25} />
          Complimentary gift wrapping available at checkout
        </p>
      </div>

      <Accordion type="multiple" defaultValue={["description"]} className="mt-10">
        <AccordionItem value="description">
          <AccordionTrigger>Description</AccordionTrigger>
          <AccordionContent>{product.description}</AccordionContent>
        </AccordionItem>
        {(details.length > 0 || product.components) && (
          <AccordionItem value="details">
            <AccordionTrigger>Product Details</AccordionTrigger>
            <AccordionContent>
              {details.length > 0 && (
                <ul className="flex flex-col gap-1.5">
                  {details.map((d) => (
                    <li key={d} className="flex gap-2.5">
                      <span aria-hidden="true">—</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              )}
              {product.components && (
                <p className={cn(details.length > 0 && "mt-3")}>
                  <span className="text-gold-dark">No. of components:</span> {product.components}
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        )}
        {(product.fabric || product.care) && (
          <AccordionItem value="fabric">
            <AccordionTrigger>The Fabric &amp; Care</AccordionTrigger>
            <AccordionContent>
              {product.fabric && <p>{product.fabric.charAt(0).toUpperCase() + product.fabric.slice(1)}</p>}
              {product.care && <p className={cn(product.fabric && "mt-2")}>{product.care}</p>}
            </AccordionContent>
          </AccordionItem>
        )}
        {product.stylingSuggestion && (
          <AccordionItem value="styling">
            <AccordionTrigger>Styling Notes</AccordionTrigger>
            <AccordionContent>{product.stylingSuggestion}</AccordionContent>
          </AccordionItem>
        )}
        <AccordionItem value="shipping" className="border-b-0">
          <AccordionTrigger>Shipping &amp; Returns</AccordionTrigger>
          <AccordionContent>
            <p>
              {product.availability === "made-to-order"
                ? "This piece is made to order and ships in 3–4 weeks. As with all made-to-order and customised pieces, it is final sale and cannot be returned."
                : "Ready-to-ship pieces are delivered within 3 to 5 business days across most Indian cities. Returns are accepted within 7 days of delivery, unworn and with tags intact."}
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <SizeGuideDialog product={product} open={sizeGuideOpen} onOpenChange={setSizeGuideOpen} />
    </div>
  );
}
