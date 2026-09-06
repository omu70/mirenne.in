import type { Availability, CollectionSlug, Product } from "@/lib/types";
import { collections, collectionMap } from "@/lib/data/collections";

/**
 * Pure, framework-agnostic filtering/sorting logic for the Shop page. Kept
 * separate from any component so it can be unit-reasoned-about (and reused
 * by both the desktop sidebar and the mobile filter sheet) without dragging
 * React into the picture.
 *
 * Every facet is derived from a product list passed in by the caller, NOT
 * from the static seed in lib/data/products.ts. That matters because the
 * live catalogue is the admin-editable store: when these were module-level
 * constants baked from the seed at import time, a piece added or edited in
 * /admin/products with a price outside the seed's range — or a new category,
 * colour or size — was silently filtered out of Shop and had no facet to
 * filter by. Callers compute facets once from the store with getShopFacets()
 * and thread them through.
 */

export type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "rating";
export type QuickFilter = "new" | "bestseller" | null;

export interface ShopFilters {
  categories: string[];
  collections: CollectionSlug[];
  colors: string[];
  sizes: string[];
  availability: Availability[];
  priceMin: number;
  priceMax: number;
  quickFilter: QuickFilter;
  q: string;
  sort: SortKey;
}

/** The filterable values that actually exist in a given catalogue. */
export interface ShopFacets {
  categories: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  priceMin: number;
  priceMax: number;
}

// ---- Static option lists (these come from site data, not the catalogue) ----

export const COLLECTION_OPTIONS: { slug: CollectionSlug; name: string }[] = collections.map((c) => ({
  slug: c.slug,
  name: c.name,
}));

// "Low Stock" is intentionally not offered as a browse filter (it stays a
// per-product badge on the PDP/product card via AVAILABILITY_LABEL there) —
// shoppers filter for what they can act on now, not a stock-level nuance.
export const AVAILABILITY_OPTIONS: { value: Availability; label: string }[] = [
  { value: "in-stock", label: "In Stock" },
  { value: "made-to-order", label: "Made To Order" },
];

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

// Sizes render in wearing order where we recognise them; anything else an
// admin types (a custom size, a numeric run) is appended rather than dropped,
// so it still gets a filter row of its own.
const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "Free Size", "Custom Size"];

/** Empty-catalogue fallback so the price slider still has a usable range. */
const EMPTY_PRICE_BOUNDS = { priceMin: 0, priceMax: 100000 };

// ---- Facets, derived from whichever catalogue the caller passes in ----

export function getShopFacets(list: Product[]): ShopFacets {
  const categories = [...new Set(list.map((p) => p.category))].sort();

  const seenColors = new Map<string, string>();
  for (const p of list) {
    for (const c of p.colors) {
      if (!seenColors.has(c.name)) seenColors.set(c.name, c.hex);
    }
  }
  const colors = [...seenColors.entries()]
    .map(([name, hex]) => ({ name, hex }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const present = new Set(list.flatMap((p) => p.sizes));
  const known = SIZE_ORDER.filter((s) => present.has(s));
  const extra = [...present].filter((s) => !SIZE_ORDER.includes(s)).sort();
  const sizes = [...known, ...extra];

  if (list.length === 0) {
    return { categories, colors, sizes, ...EMPTY_PRICE_BOUNDS };
  }

  const rawMin = Math.min(...list.map((p) => p.price));
  const rawMax = Math.max(...list.map((p) => p.price));
  const priceMin = Math.floor(rawMin / 1000) * 1000;
  // Round the ceiling up to the next whole thousand, and never let it collapse
  // onto the floor — a single-price catalogue still needs a draggable range.
  const priceMax = Math.max(Math.ceil(rawMax / 1000) * 1000, priceMin + 1000);

  return { categories, colors, sizes, priceMin, priceMax };
}

export function getDefaultFilters(facets: ShopFacets): ShopFilters {
  return {
    categories: [],
    collections: [],
    colors: [],
    sizes: [],
    availability: [],
    priceMin: facets.priceMin,
    priceMax: facets.priceMax,
    quickFilter: null,
    q: "",
    sort: "featured",
  };
}

// ---- URL <-> filters ----

export function parseFiltersFromSearchParams(sp: URLSearchParams, facets: ShopFacets): ShopFilters {
  const priceMinParam = Number(sp.get("priceMin"));
  const priceMaxParam = Number(sp.get("priceMax"));
  const quickFilterParam = sp.get("filter");
  const sortParam = sp.get("sort");

  return {
    categories: sp.getAll("category").filter((c) => facets.categories.includes(c)),
    collections: sp.getAll("collection").filter((c): c is CollectionSlug => c in collectionMap),
    colors: sp.getAll("color").filter((c) => facets.colors.some((o) => o.name === c)),
    sizes: sp.getAll("size").filter((s) => facets.sizes.includes(s)),
    availability: sp
      .getAll("availability")
      .filter((a): a is Availability => AVAILABILITY_OPTIONS.some((o) => o.value === a)),
    priceMin:
      Number.isFinite(priceMinParam) && priceMinParam >= facets.priceMin ? priceMinParam : facets.priceMin,
    priceMax:
      Number.isFinite(priceMaxParam) && priceMaxParam > 0 && priceMaxParam <= facets.priceMax
        ? priceMaxParam
        : facets.priceMax,
    quickFilter: quickFilterParam === "new" || quickFilterParam === "bestseller" ? quickFilterParam : null,
    q: sp.get("q") ?? "",
    sort: SORT_OPTIONS.some((o) => o.value === sortParam) ? (sortParam as SortKey) : "featured",
  };
}

export function filtersToSearchParams(filters: ShopFilters, facets: ShopFacets): URLSearchParams {
  const sp = new URLSearchParams();
  filters.categories.forEach((c) => sp.append("category", c));
  filters.collections.forEach((c) => sp.append("collection", c));
  filters.colors.forEach((c) => sp.append("color", c));
  filters.sizes.forEach((s) => sp.append("size", s));
  filters.availability.forEach((a) => sp.append("availability", a));
  if (filters.priceMin !== facets.priceMin) sp.set("priceMin", String(filters.priceMin));
  if (filters.priceMax !== facets.priceMax) sp.set("priceMax", String(filters.priceMax));
  if (filters.quickFilter) sp.set("filter", filters.quickFilter);
  if (filters.q) sp.set("q", filters.q);
  if (filters.sort !== "featured") sp.set("sort", filters.sort);
  return sp;
}

export function hasActiveFilters(filters: ShopFilters, facets: ShopFacets): boolean {
  return (
    filters.categories.length > 0 ||
    filters.collections.length > 0 ||
    filters.colors.length > 0 ||
    filters.sizes.length > 0 ||
    filters.availability.length > 0 ||
    filters.priceMin !== facets.priceMin ||
    filters.priceMax !== facets.priceMax ||
    filters.quickFilter !== null ||
    filters.q !== ""
  );
}

// ---- Filtering / sorting ----

export function filterProducts(list: Product[], filters: ShopFilters): Product[] {
  const q = filters.q.trim().toLowerCase();

  return list.filter((p) => {
    if (filters.quickFilter === "new" && !p.isNew) return false;
    if (filters.quickFilter === "bestseller" && !p.isBestSeller) return false;
    if (filters.categories.length && !filters.categories.includes(p.category)) return false;
    if (filters.collections.length && (!p.collection || !filters.collections.includes(p.collection)))
      return false;
    if (filters.availability.length && !filters.availability.includes(p.availability)) return false;
    if (filters.colors.length && !p.colors.some((c) => filters.colors.includes(c.name))) return false;
    if (filters.sizes.length && !p.sizes.some((s) => filters.sizes.includes(s))) return false;
    if (p.price < filters.priceMin || p.price > filters.priceMax) return false;

    if (q) {
      const hit =
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.collection?.toLowerCase().includes(q) ?? false) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      if (!hit) return false;
    }

    return true;
  });
}

export function sortProducts(list: Product[], sort: SortKey): Product[] {
  const arr = [...list];
  switch (sort) {
    case "newest":
      return arr.sort((a, b) => Number(b.isNew) - Number(a.isNew));
    case "price-asc":
      return arr.sort((a, b) => a.price - b.price);
    case "price-desc":
      return arr.sort((a, b) => b.price - a.price);
    case "rating":
      return arr.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    case "featured":
    default:
      return arr;
  }
}

// ---- Facet counts (reflect all OTHER active filter groups, not the group itself) ----

export function getCategoryCounts(list: Product[], filters: ShopFilters, facets: ShopFacets) {
  const result: Record<string, number> = {};
  for (const cat of facets.categories) {
    result[cat] = filterProducts(list, { ...filters, categories: [cat] }).length;
  }
  return result;
}

export function getCollectionCounts(list: Product[], filters: ShopFilters) {
  const result: Record<string, number> = {};
  for (const c of COLLECTION_OPTIONS) {
    result[c.slug] = filterProducts(list, { ...filters, collections: [c.slug] }).length;
  }
  return result;
}

export function getColorCounts(list: Product[], filters: ShopFilters, facets: ShopFacets) {
  const result: Record<string, number> = {};
  for (const c of facets.colors) {
    result[c.name] = filterProducts(list, { ...filters, colors: [c.name] }).length;
  }
  return result;
}

export function getSizeCounts(list: Product[], filters: ShopFilters, facets: ShopFacets) {
  const result: Record<string, number> = {};
  for (const s of facets.sizes) {
    result[s] = filterProducts(list, { ...filters, sizes: [s] }).length;
  }
  return result;
}

export function getAvailabilityCounts(list: Product[], filters: ShopFilters) {
  const result: Record<string, number> = {};
  for (const a of AVAILABILITY_OPTIONS) {
    result[a.value] = filterProducts(list, { ...filters, availability: [a.value] }).length;
  }
  return result;
}
