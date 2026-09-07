"use client";

import * as React from "react";

import { notFound } from "next/navigation";
import { Container } from "@/components/luxury/container";
import { Breadcrumb } from "@/components/luxury/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductGallery } from "@/components/product/product-gallery";
import { BuyBox } from "@/components/product/buy-box";
import { StickyMobileBuyBar } from "@/components/product/sticky-mobile-buy-bar";
import { DesignerNote } from "@/components/product/designer-note";
import { RelatedProducts } from "@/components/product/related-products";
import { RecentlyViewedRail } from "@/components/product/recently-viewed-rail";
import { RecentlyViewedTracker } from "@/components/product/recently-viewed-tracker";
import { useProductStore } from "@/lib/store/product-store";
import { useMounted } from "@/lib/hooks/use-mounted";
import { collectionMap } from "@/lib/data/collections";
import { collectionHref } from "@/lib/collections/href";
import { track } from "@/lib/analytics/events";

interface ProductPageClientProps {
  slug: string;
}

/**
 * Resolves and renders a product from the live, admin-editable catalogue
 * store. Gated on useMounted so the server-rendered pass — which has no
 * access to this browser's local storage — never disagrees with the first
 * client render; a brief skeleton stands in for that one beat rather than
 * risking a hydration mismatch or a flash of stale seed content.
 */
export function ProductPageClient({ slug }: ProductPageClientProps) {
  const mounted = useMounted();
  const products = useProductStore((s) => s.products);

  // Reported from the client because the catalogue this page renders lives in
  // the browser store. Keyed on the slug so switching between products in the
  // same session reports each one, and a re-render reports none of them twice.
  const viewed = React.useRef<string | null>(null);
  const product = products.find((p) => p.slug === slug);
  React.useEffect(() => {
    if (!product || viewed.current === product.slug) return;
    viewed.current = product.slug;
    track.viewItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      quantity: 1,
      category: product.category,
    });
  }, [product]);

  if (!mounted) {
    return (
      <Container className="py-10 md:py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          <Skeleton className="aspect-[4/5] w-full" />
          <div className="space-y-4 pt-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </Container>
    );
  }

  if (!product) {
    notFound();
  }

  const collection = product.collection ? collectionMap[product.collection] : undefined;

  return (
    <>
      <Container className="py-10 md:py-14">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/shop" },
            // A piece with no collection simply doesn't get a collection
            // crumb — the trail stays Home / Shop / <product>.
            ...(collection
              ? [{ label: collection.name, href: collectionHref(product.collection ?? "") }]
              : []),
            { label: product.name },
          ]}
          className="mb-6"
        />

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          <ProductGallery images={product.images} productName={product.name} />
          <div className="lg:sticky lg:top-28 lg:self-start">
            <BuyBox product={product} />
          </div>
        </div>
      </Container>

      {product.designerNote && <DesignerNote note={product.designerNote} />}
      <RelatedProducts product={product} />
      <RecentlyViewedRail excludeSlug={product.slug} />
      <RecentlyViewedTracker slug={product.slug} />
      <StickyMobileBuyBar product={product} />
    </>
  );
}
