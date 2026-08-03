"use client";

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

  const product = products.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  const collection = collectionMap[product.collection];

  return (
    <>
      <Container className="py-10 md:py-14">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/shop" },
            { label: collection.name, href: `/collections/${product.collection}` },
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

      <DesignerNote note={product.designerNote} />
      <RelatedProducts product={product} />
      <RecentlyViewedRail excludeSlug={product.slug} />
      <RecentlyViewedTracker slug={product.slug} />
      <StickyMobileBuyBar product={product} />
    </>
  );
}
