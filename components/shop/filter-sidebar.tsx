"use client";

import * as React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { cn, formatINR } from "@/lib/utils";
import {
  AVAILABILITY_OPTIONS,
  COLLECTION_OPTIONS,
  getAvailabilityCounts,
  getCategoryCounts,
  getCollectionCounts,
  getColorCounts,
  getSizeCounts,
  type ShopFacets,
  type ShopFilters,
} from "@/lib/shop/filters";
import type { Product } from "@/lib/types";

type ListKey = "categories" | "collections" | "colors" | "sizes" | "availability";

interface FilterSidebarProps {
  /** The live catalogue — facet options and counts are derived from it. */
  products: Product[];
  facets: ShopFacets;
  filters: ShopFilters;
  onChange: (patch: Partial<ShopFilters>) => void;
  className?: string;
}

export function FilterSidebar({ products, facets, filters, onChange, className }: FilterSidebarProps) {
  const categoryCounts = React.useMemo(
    () => getCategoryCounts(products, filters, facets),
    [products, filters, facets]
  );
  const collectionCounts = React.useMemo(
    () => getCollectionCounts(products, filters),
    [products, filters]
  );
  // Collection is optional on a product, so a catalogue can legitimately have
  // nothing assigned to any collection. In that case every option in this
  // facet reads 0 and ticking one can only empty the grid — so the facet is
  // hidden entirely rather than shown as dead UI. It reappears the moment a
  // piece is given a collection (or one is already active in the URL).
  const hasAnyCollection =
    filters.collections.length > 0 || Object.values(collectionCounts).some((n) => n > 0);
  const colorCounts = React.useMemo(
    () => getColorCounts(products, filters, facets),
    [products, filters, facets]
  );
  const sizeCounts = React.useMemo(
    () => getSizeCounts(products, filters, facets),
    [products, filters, facets]
  );
  const availabilityCounts = React.useMemo(
    () => getAvailabilityCounts(products, filters),
    [products, filters]
  );

  const toggle = (key: ListKey, value: string) => {
    const current = filters[key] as string[];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    onChange({ [key]: next } as Partial<ShopFilters>);
  };

  return (
    <div className={cn(className)}>
      <Accordion type="multiple" defaultValue={["category", "collection", "price"]}>
        <AccordionItem value="category">
          <AccordionTrigger>Category</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-3.5">
              {facets.categories.map((cat) => (
                <label key={cat} className="group flex cursor-pointer items-center justify-between gap-3">
                  <span className="flex items-center gap-3">
                    <Checkbox
                      checked={filters.categories.includes(cat)}
                      onCheckedChange={() => toggle("categories", cat)}
                    />
                    <span className="text-sm text-gold transition-colors group-hover:text-gold-dark">{cat}</span>
                  </span>
                  <span className="text-xs text-gold">{categoryCounts[cat] ?? 0}</span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="collection" className={cn(!hasAnyCollection && "hidden")}>
          <AccordionTrigger>Collection</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-3.5">
              {COLLECTION_OPTIONS.map((c) => (
                <label key={c.slug} className="group flex cursor-pointer items-center justify-between gap-3">
                  <span className="flex items-center gap-3">
                    <Checkbox
                      checked={filters.collections.includes(c.slug)}
                      onCheckedChange={() => toggle("collections", c.slug)}
                    />
                    <span className="text-sm text-gold transition-colors group-hover:text-gold-dark">{c.name}</span>
                  </span>
                  <span className="text-xs text-gold">{collectionCounts[c.slug] ?? 0}</span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price">
          <AccordionTrigger>Price</AccordionTrigger>
          <AccordionContent>
            <PriceRangeControl facets={facets} filters={filters} onChange={onChange} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="color">
          <AccordionTrigger>Color</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-3">
              {facets.colors.map((c) => {
                const active = filters.colors.includes(c.name);
                const count = colorCounts[c.name] ?? 0;
                return (
                  <button
                    key={c.name}
                    type="button"
                    disabled={count === 0 && !active}
                    onClick={() => toggle("colors", c.name)}
                    aria-pressed={active}
                    aria-label={`${c.name} (${count})`}
                    title={c.name}
                    className={cn(
                      "h-8 w-8 cursor-pointer rounded-full border transition-all disabled:cursor-not-allowed disabled:opacity-30",
                      active ? "border-ink ring-1 ring-ink ring-offset-2" : "border-hairline-dark hover:border-ink"
                    )}
                    style={{ backgroundColor: c.hex }}
                  />
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="size">
          <AccordionTrigger>Size</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2">
              {facets.sizes.map((s) => {
                const active = filters.sizes.includes(s);
                const count = sizeCounts[s] ?? 0;
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={count === 0 && !active}
                    onClick={() => toggle("sizes", s)}
                    aria-pressed={active}
                    className={cn(
                      "flex h-10 min-w-10 cursor-pointer items-center justify-center border px-3 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-30",
                      active ? "border-ink bg-ink text-ivory" : "border-hairline-dark text-gold hover:border-ink"
                    )}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="availability" className="border-b-0">
          <AccordionTrigger>Availability</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-3.5">
              {AVAILABILITY_OPTIONS.map((a) => (
                <label key={a.value} className="group flex cursor-pointer items-center justify-between gap-3">
                  <span className="flex items-center gap-3">
                    <Checkbox
                      checked={filters.availability.includes(a.value)}
                      onCheckedChange={() => toggle("availability", a.value)}
                    />
                    <span className="text-sm text-gold transition-colors group-hover:text-gold-dark">{a.label}</span>
                  </span>
                  <span className="text-xs text-gold">{availabilityCounts[a.value] ?? 0}</span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

/**
 * The slider needs its own draft state so dragging feels instant — committing
 * every pixel of movement straight to the URL (via onChange) would spam
 * router.replace calls. `onValueChange` only updates the local draft;
 * `onValueCommit` (thumb release) is what reaches the real filter state.
 * Draft state still has to follow external resets (Clear All, back/forward
 * navigation), which it does by comparing against the incoming props during
 * render rather than in an effect.
 */
function PriceRangeControl({
  facets,
  filters,
  onChange,
}: {
  facets: ShopFacets;
  filters: ShopFilters;
  onChange: (patch: Partial<ShopFilters>) => void;
}) {
  const [draft, setDraft] = React.useState<[number, number]>([filters.priceMin, filters.priceMax]);

  const [prevExternal, setPrevExternal] = React.useState<[number, number]>([filters.priceMin, filters.priceMax]);
  if (filters.priceMin !== prevExternal[0] || filters.priceMax !== prevExternal[1]) {
    setPrevExternal([filters.priceMin, filters.priceMax]);
    setDraft([filters.priceMin, filters.priceMax]);
  }

  return (
    <div className="px-1 pt-1">
      <Slider
        min={facets.priceMin}
        max={facets.priceMax}
        step={500}
        value={draft}
        onValueChange={(v) => setDraft(v as [number, number])}
        onValueCommit={(v) => onChange({ priceMin: v[0], priceMax: v[1] })}
        className="mb-5"
      />
      <div className="flex items-center justify-between text-xs text-gold">
        <span>{formatINR(draft[0])}</span>
        <span>{formatINR(draft[1])}</span>
      </div>
    </div>
  );
}
