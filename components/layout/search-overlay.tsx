"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import Link from "next/link";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { Container } from "@/components/luxury/container";
import { useProductStore } from "@/lib/store/product-store";
import { cn, formatINR, isUnoptimizableSrc } from "@/lib/utils";

const POPULAR_SEARCHES = ["Gowns", "Sarees", "Lehenga Sets", "Evening Wear", "Cocktail Dresses"];

interface SearchOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchOverlay({ open, onOpenChange }: SearchOverlayProps) {
  const products = useProductStore((s) => s.products);
  const [query, setQuery] = React.useState("");

  // Clear the search field once the overlay closes (covers every close path —
  // Escape, backdrop click, the close button, or the parent closing it on
  // route change) by adjusting state during render when `open` changes,
  // rather than reacting to it after the fact in an effect.
  const [prevOpen, setPrevOpen] = React.useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (!open) setQuery("");
  }

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.collection?.toLowerCase().includes(q) ?? false) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 6);
  }, [query, products]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/40 data-[state=open]:animate-[overlay-in_300ms_ease-out]" />
        <DialogPrimitive.Content
          className="fixed left-0 right-0 top-0 z-50 max-h-[85vh] overflow-y-auto bg-ivory focus:outline-none data-[state=open]:animate-[search-in_350ms_ease-out]"
          aria-describedby={undefined}
        >
          <DialogPrimitive.Title className="sr-only">Search</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Search the Mirenne catalogue by product, category, or collection.
          </DialogPrimitive.Description>

          <Container className="py-8 md:py-10">
            <div className="flex items-center gap-4 border-b border-hairline-dark pb-5">
              <Search className="h-5 w-5 shrink-0 text-gold" strokeWidth={1.25} />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, collections, categories..."
                className="w-full bg-transparent font-serif text-2xl text-gold placeholder:text-gold/50 focus:outline-none md:text-3xl"
              />
              <DialogPrimitive.Close
                aria-label="Close search"
                className="shrink-0 cursor-pointer text-gold transition-colors hover:text-gold-dark"
              >
                <X className="h-6 w-6" strokeWidth={1.25} />
              </DialogPrimitive.Close>
            </div>

            <div className="py-8">
              {query.trim() === "" ? (
                <div>
                  <p className="label-luxury mb-4 text-gold">Popular Searches</p>
                  <div className="flex flex-wrap gap-3">
                    {POPULAR_SEARCHES.map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="cursor-pointer border border-hairline-dark px-4 py-2 text-sm text-gold transition-colors hover:border-ink"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              ) : results.length === 0 ? (
                <p className="text-sm text-gold">No results for &ldquo;{query}&rdquo;. Try a collection or category name.</p>
              ) : (
                <div>
                  <p className="label-luxury mb-6 text-gold">
                    {results.length} Result{results.length !== 1 ? "s" : ""}
                  </p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 md:grid-cols-6">
                    {results.map((p) => (
                      <Link key={p.id} href={`/product/${p.slug}`} onClick={() => onOpenChange(false)} className="group">
                        <div className="relative aspect-[3/4] overflow-hidden bg-paper">
                          <Image
                            src={p.images[0].src}
                            alt={p.images[0].alt}
                            unoptimized={isUnoptimizableSrc(p.images[0].src)}
                            fill
                            sizes="(min-width: 768px) 16vw, 40vw"
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          />
                        </div>
                        <p className="mt-3 line-clamp-1 text-sm text-gold">{p.name}</p>
                        <p className="text-xs text-gold">{formatINR(p.price)}</p>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href={`/shop?q=${encodeURIComponent(query)}`}
                    onClick={() => onOpenChange(false)}
                    className={cn("label-luxury link-underline mt-9 inline-block text-gold")}
                  >
                    View All Results
                  </Link>
                </div>
              )}
            </div>
          </Container>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
