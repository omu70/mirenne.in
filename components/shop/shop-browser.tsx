"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useProductStore } from "@/lib/store/product-store";
import {
  DEFAULT_FILTERS,
  filterProducts,
  filtersToSearchParams,
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

  // Local state is the source of truth for rendering, so every filter click
  // is instant. `next/navigation`'s router.replace() is deliberately NOT used
  // here — on this all-client, no-backend page it still round-trips through
  // Next's RSC machinery on every call (measured 800ms-1300ms in dev for a
  // search-param-only change), which is unacceptable latency for a checkbox
  // click. Instead we write the URL directly via the History API (for
  // shareable/bookmarkable links) and keep React state in sync ourselves.
  const [filters, setFilters] = React.useState<ShopFilters>(() => parseFiltersFromSearchParams(searchParams));

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
    setFilters(parseFiltersFromSearchParams(searchParams));
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
    const qs = filtersToSearchParams(filters).toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    if (window.location.pathname + window.location.search !== url) {
      window.history.replaceState(null, "", url);
    }
  }, [filters, pathname]);

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
      priceMin: DEFAULT_FILTERS.priceMin,
      priceMax: DEFAULT_FILTERS.priceMax,
      quickFilter: null,
      q: "",
    });
  }, [updateFilters]);

  return (
    <div>
      <ShopToolbar
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
          <FilterSidebar filters={filters} onChange={updateFilters} />
        </aside>

        <ProductGrid products={filtered} density={density} onClearAll={clearAll} />
      </div>

      <MobileFilterSheet
        open={mobileFiltersOpen}
        onOpenChange={setMobileFiltersOpen}
        filters={filters}
        onChange={updateFilters}
        onClearAll={clearAll}
        resultCount={filtered.length}
      />
    </div>
  );
}
