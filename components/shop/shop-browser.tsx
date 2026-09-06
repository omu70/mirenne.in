"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useProductStore } from "@/lib/store/product-store";
import {
  filterProducts,
  filtersToSearchParams,
  getShopFacets,
  parseFiltersFromSearchParams,
  sortProducts,
  type ShopFilters,
} from "@/lib/shop/filters";
import { FilterSidebar } from "@/components/shop/filter-sidebar";
import { MobileFilterSheet } from "@/components/shop/mobile-filter-sheet";
import { ShopToolbar } from "@/components/shop/shop-toolbar";
import { ProductGrid } from "@/components/shop/product-grid";

export function ShopBrowser() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const products = useProductStore((s) => s.products);

  // Facet options and the price slider's bounds come from the live catalogue,
  // not the static seed — otherwise a piece added in /admin/products outside
  // the seed's price range is filtered off this page and never appears.
  const facets = React.useMemo(() => getShopFacets(products), [products]);

  // Local state is the source of truth for rendering, so every filter click
  // is instant. `next/navigation`'s router.replace() is deliberately NOT used
  // here — on this all-client, no-backend page it still round-trips through
  // Next's RSC machinery on every call (measured 800ms-1300ms in dev for a
  // search-param-only change), which is unacceptable latency for a checkbox
  // click. Instead we write the URL directly via the History API (for
  // shareable/bookmarkable links) and keep React state in sync ourselves.
  const [filters, setFilters] = React.useState<ShopFilters>(() =>
    parseFiltersFromSearchParams(searchParams, facets)
  );

  // The store hydrates from local storage after mount, so the catalogue (and
  // with it the price bounds) can widen on the second render. Follow that
  // during render rather than in an effect: if the price filter was still at
  // the old full range it stays at the new full range, and otherwise it is
  // clamped into it — either way a newly added piece can't end up hidden
  // behind a stale ceiling the shopper never chose.
  const [prevBounds, setPrevBounds] = React.useState<[number, number]>([facets.priceMin, facets.priceMax]);
  if (facets.priceMin !== prevBounds[0] || facets.priceMax !== prevBounds[1]) {
    const wasFullRange = filters.priceMin === prevBounds[0] && filters.priceMax === prevBounds[1];
    setPrevBounds([facets.priceMin, facets.priceMax]);
    setFilters((f) =>
      wasFullRange
        ? { ...f, priceMin: facets.priceMin, priceMax: facets.priceMax }
        : {
            ...f,
            priceMin: Math.max(facets.priceMin, Math.min(f.priceMin, facets.priceMax)),
            priceMax: Math.min(facets.priceMax, Math.max(f.priceMax, facets.priceMin)),
          }
    );
  }

  // Re-derive from the URL when it changes for a reason OTHER than our own
  // history.replaceState calls below — i.e. a <Link> elsewhere in the site
  // navigating here with query params (mega menu, "Shop New Arrivals", the
  // search overlay's "View All Results"), or browser back/forward. Adjusting
  // state during render (rather than in an effect) also means our own
  // history.replaceState calls — which don't touch Next's router state —
  // can never bounce back and clobber a same-tick local update.
  const searchParamsString = searchParams.toString();
  const [prevSearchParamsString, setPrevSearchParamsString] = React.useState(searchParamsString);
  if (searchParamsString !== prevSearchParamsString) {
    setPrevSearchParamsString(searchParamsString);
    setFilters(parseFiltersFromSearchParams(searchParams, facets));
  }

  const filtered = React.useMemo(
    () => sortProducts(filterProducts(products, filters), filters.sort),
    [filters, products]
  );

  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);
  const [density, setDensity] = React.useState<3 | 4>(4);

  // Keep the address bar in sync with local filter state (shareable /
  // bookmarkable links) via a plain useEffect — the textbook place for
  // synchronizing React state with a browser API that lives outside React.
  // Calling history.replaceState directly inside the setState updater (or
  // during render) instead trips React's "Cannot update a component while
  // rendering a different component" guard, because Next's router reacts
  // to the history change synchronously and tries to update its own state
  // mid-way through committing ShopBrowser's update.
  React.useEffect(() => {
    const qs = filtersToSearchParams(filters, facets).toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    if (window.location.pathname + window.location.search !== url) {
      window.history.replaceState(null, "", url);
    }
  }, [filters, facets, pathname]);

  const updateFilters = React.useCallback((patch: Partial<ShopFilters>) => {
    setFilters((current) => ({ ...current, ...patch }));
  }, []);

  const clearAll = React.useCallback(() => {
    updateFilters({
      categories: [],
      collections: [],
      colors: [],
      sizes: [],
      availability: [],
      priceMin: facets.priceMin,
      priceMax: facets.priceMax,
      quickFilter: null,
      q: "",
    });
  }, [updateFilters, facets]);

  return (
    <div>
      <ShopToolbar
        facets={facets}
        filters={filters}
        resultCount={filtered.length}
        onChange={updateFilters}
        onClearAll={clearAll}
        onOpenMobileFilters={() => setMobileFiltersOpen(true)}
        density={density}
        onDensityChange={setDensity}
      />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr] lg:gap-12 xl:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <FilterSidebar products={products} facets={facets} filters={filters} onChange={updateFilters} />
        </aside>

        <ProductGrid products={filtered} density={density} onClearAll={clearAll} />
      </div>

      <MobileFilterSheet
        open={mobileFiltersOpen}
        onOpenChange={setMobileFiltersOpen}
        products={products}
        facets={facets}
        filters={filters}
        onChange={updateFilters}
        onClearAll={clearAll}
        resultCount={filtered.length}
      />
    </div>
  );
}
