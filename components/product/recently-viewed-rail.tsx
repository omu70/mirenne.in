"use client";

import { Container } from "@/components/luxury/container";
import { SectionHeading } from "@/components/luxury/section-heading";
import { StaggerReveal, StaggerItem } from "@/components/luxury/reveal";
import { ProductCard } from "@/components/product/product-card";
import { useRecentlyViewedStore } from "@/lib/store/recently-viewed-store";
import { useProductStore } from "@/lib/store/product-store";
import { useMounted } from "@/lib/hooks/use-mounted";

interface RecentlyViewedRailProps {
  excludeSlug: string;
}

/**
 * Client-only by necessity — reads the persisted "recently viewed" store.
 * Gated on useMounted so the server-rendered pass (which always sees an
 * empty store) matches the first client render exactly; the real rail, if
 * any, fades in a beat later rather than causing a hydration mismatch.
 */
export function RecentlyViewedRail({ excludeSlug }: RecentlyViewedRailProps) {
  const mounted = useMounted();
  const productIds = useRecentlyViewedStore((s) => s.productIds);
  const clear = useRecentlyViewedStore((s) => s.clear);
  const products = useProductStore((s) => s.products);

  if (!mounted) return null;

  const productMap = Object.fromEntries(products.map((p) => [p.slug, p]));
  const items = productIds
    .filter((slug) => slug !== excludeSlug)
    .map((slug) => productMap[slug])
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .slice(0, 4);

  if (items.length === 0) return null;

  return (
    <section className="border-t border-hairline py-20 md:py-28">
      <Container>
        <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading eyebrow="Your History" title="Recently Viewed" className="mb-0" />
          <button
            type="button"
            onClick={clear}
            className="label-luxury link-underline cursor-pointer text-gold hover:text-gold-dark"
          >
            Clear
          </button>
        </div>

        <StaggerReveal className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
          {items.map((product) => (
            <StaggerItem key={product.id}>
              <ProductCard product={product} />
            </StaggerItem>
          ))}
        </StaggerReveal>
      </Container>
    </section>
  );
}
