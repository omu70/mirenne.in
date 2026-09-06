"use client";

import { Grid3x3, LayoutGrid, SlidersHorizontal, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn, formatINR } from "@/lib/utils";
import {
  AVAILABILITY_OPTIONS,
  COLLECTION_OPTIONS,
  SORT_OPTIONS,
  type ShopFacets,
  type ShopFilters,
} from "@/lib/shop/filters";

interface ShopToolbarProps {
  facets: ShopFacets;
  filters: ShopFilters;
  resultCount: number;
  onChange: (patch: Partial<ShopFilters>) => void;
  onClearAll: () => void;
  onOpenMobileFilters: () => void;
  density: 3 | 4;
  onDensityChange: (density: 3 | 4) => void;
}

interface Chip {
  key: string;
  label: string;
  onRemove: () => void;
}

export function ShopToolbar({
  facets,
  filters,
  resultCount,
  onChange,
  onClearAll,
  onOpenMobileFilters,
  density,
  onDensityChange,
}: ShopToolbarProps) {
  const chips: Chip[] = [];

  filters.categories.forEach((cat) =>
    chips.push({
      key: `category-${cat}`,
      label: cat,
      onRemove: () => onChange({ categories: filters.categories.filter((c) => c !== cat) }),
    })
  );
  filters.collections.forEach((slug) => {
    const c = COLLECTION_OPTIONS.find((o) => o.slug === slug);
    chips.push({
      key: `collection-${slug}`,
      label: c?.name ?? slug,
      onRemove: () => onChange({ collections: filters.collections.filter((s) => s !== slug) }),
    });
  });
  filters.colors.forEach((color) =>
    chips.push({
      key: `color-${color}`,
      label: color,
      onRemove: () => onChange({ colors: filters.colors.filter((c) => c !== color) }),
    })
  );
  filters.sizes.forEach((size) =>
    chips.push({
      key: `size-${size}`,
      label: `Size ${size}`,
      onRemove: () => onChange({ sizes: filters.sizes.filter((s) => s !== size) }),
    })
  );
  filters.availability.forEach((a) => {
    const opt = AVAILABILITY_OPTIONS.find((o) => o.value === a);
    chips.push({
      key: `availability-${a}`,
      label: opt?.label ?? a,
      onRemove: () => onChange({ availability: filters.availability.filter((v) => v !== a) }),
    });
  });
  if (filters.priceMin !== facets.priceMin || filters.priceMax !== facets.priceMax) {
    chips.push({
      key: "price",
      label: `${formatINR(filters.priceMin)} – ${formatINR(filters.priceMax)}`,
      onRemove: () => onChange({ priceMin: facets.priceMin, priceMax: facets.priceMax }),
    });
  }
  if (filters.quickFilter) {
    chips.push({
      key: "quick",
      label: filters.quickFilter === "new" ? "New Arrivals" : "Best Sellers",
      onRemove: () => onChange({ quickFilter: null }),
    });
  }
  if (filters.q) {
    chips.push({
      key: "q",
      label: `“${filters.q}”`,
      onRemove: () => onChange({ q: "" }),
    });
  }

  return (
    <div className="mb-8 flex flex-col gap-5 border-b border-hairline pb-6 md:mb-10 md:pb-8">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-gold">
          {resultCount} {resultCount === 1 ? "Piece" : "Pieces"}
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileFilters}
            className="label-luxury flex cursor-pointer items-center gap-2 text-gold lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" strokeWidth={1.25} />
            Filter
          </button>

          <div className="hidden items-center border border-hairline-dark lg:flex">
            <button
              type="button"
              aria-label="Show 3 per row"
              aria-pressed={density === 3}
              onClick={() => onDensityChange(3)}
              className={cn(
                "flex h-9 w-9 cursor-pointer items-center justify-center transition-colors",
                density === 3 ? "bg-ink text-ivory" : "text-gold hover:text-gold-dark"
              )}
            >
              <Grid3x3 className="h-4 w-4" strokeWidth={1.25} />
            </button>
            <button
              type="button"
              aria-label="Show 4 per row"
              aria-pressed={density === 4}
              onClick={() => onDensityChange(4)}
              className={cn(
                "flex h-9 w-9 cursor-pointer items-center justify-center border-l border-hairline-dark transition-colors",
                density === 4 ? "bg-ink text-ivory" : "text-gold hover:text-gold-dark"
              )}
            >
              <LayoutGrid className="h-4 w-4" strokeWidth={1.25} />
            </button>
          </div>

          <Select value={filters.sort} onValueChange={(v) => onChange({ sort: v as ShopFilters["sort"] })}>
            <SelectTrigger className="w-[150px] sm:w-[172px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <button
              key={chip.key}
              onClick={chip.onRemove}
              className="flex cursor-pointer items-center gap-2 border border-hairline-dark px-3 py-1.5 text-xs text-gold transition-colors hover:border-ink"
            >
              {chip.label}
              <X className="h-3 w-3" strokeWidth={1.5} />
            </button>
          ))}
          <button
            onClick={onClearAll}
            className="label-luxury cursor-pointer text-gold underline-offset-4 hover:text-gold-dark hover:underline"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}
