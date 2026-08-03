import type { Availability, CollectionSlug, Product } from "@/lib/types";
import { products } from "@/lib/data/products";
import { collections, collectionMap } from "@/lib/data/collections";

/**
 * Pure, framework-agnostic filtering/sorting logic for the Shop page. Kept
 * separate from any component so it can be unit-reasoned-about (and reused
 * by both the desktop sidebar and the mobile filter sheet) without dragging
 * React into the picture.
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

// ---- Facet catalogues, derived once from the dummy data so they never drift ----

export const CATEGORY_OPTIONS: string[] = [...new Set(products.map((p) => p.category))].sort();

export const COLLECTION_OPTIONS: { slug: CollectionSlug; name: string }[] = collections.map((c) => ({
  slug: c.slug,
  name: c.name,
}));

export const COLOR_OPTIONS: { name: string; hex: string }[] = (() => {
  const seen = new Map<string, string>();
  for (const p of products) {
    for (const c of p.colors) {
      if (!seen.has(c.name)) seen.set(c.name, c.hex);
    }
  }
  return [...seen.entries()].map(([name, hex]) => ({ name, hex })).sort((a, b) => a.name.localeCompare(b.name));
})();

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "Custom Size"];
export const SIZE_OPTIONS: string[] = SIZE_ORDER.filter((s) => products.some((p) => p.sizes.includes(s)));

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

const rawMin = Math.min(...products.map((p) => p.price));
const rawMax = Math.max(...products.map((p) => p.price));
export const PRICE_MIN = Math.floor(rawMin / 1000) * 1000;
export const PRICE_MAX = Math.ceil(rawMax / 1000) * 1000;

export const DEFAULT_FILTERS: ShopFilters = {
  categories: [],
  collections: [],
  colors: [],
  sizes: [],
  availability: [],
  priceMin: PRICE_MIN,
  priceMax: PRICE_MAX,
  quickFilter: null,
  q: "",
  sort: "featured",
};

// ---- URL <-> filters ----

export function parseFiltersFromSearchParams(sp: URLSearchParams): ShopFilters {
  const priceMinParam = Number(sp.get("priceMin"));
  const priceMaxParam = Number(sp.get("priceMax"));
  const quickFilterParam = sp.get("filter");
  const sortParam = sp.get("sort");

  return {
    categories: sp.getAll("category").filter((c) => CATEGORY_OPTIONS.includes(c)),
    collections: sp.getAll("collection").filter((c): c is CollectionSlug => c in collectionMap),
    colors: sp.getAll("color").filter((c) => COLOR_OPTIONS.some((o) => o.name === c)),
    sizes: sp.getAll("size").filter((s) => SIZE_OPTIONS.includes(s)),
    availability: sp
      .getAll("availability")
      .filter((a): a is Availability => AVAILABILITY_OPTIONS.some((o) => o.value === a)),
    priceMin: Number.isFinite(priceMinParam) && priceMinParam >= PRICE_MIN ? priceMinParam : PRICE_MIN,
    priceMax: Number.isFinite(priceMaxParam) && priceMaxParam > 0 && priceMaxParam <= PRICE_MAX ? priceMaxParam : PRICE_MAX,
    quickFilter: quickFilterParam === "new" || quickFilterParam === "bestseller" ? quickFilterParam : null,
    q: sp.get("q") ?? "",
    sort: SORT_OPTIONS.some((o) => o.value === sortParam) ? (sortParam as SortKey) : "featured",
  };
}

export function filtersToSearchParams(filters: ShopFilters): URLSearchParams {
  const sp = new URLSearchParams();
  filters.categories.forEach((c) => sp.append("category", c));
  filters.collections.forEach((c) => sp.append("collection", c));
  filters.colors.forEach((c) => sp.append("color", c));
  filters.sizes.forEach((s) => sp.append("size", s));
  filters.availability.forEach((a) => sp.append("availability", a));
  if (filters.priceMin !== PRICE_MIN) sp.set("priceMin", String(filters.priceMin));
  if (filters.priceMax !== PRICE_MAX) sp.set("priceMax", String(filters.priceMax));
  if (filters.quickFilter) sp.set("filter", filters.quickFilter);
  if (filters.q) sp.set("q", filters.q);
  if (filters.sort !== "featured") sp.set("sort", filters.sort);
  return sp;
}

export function hasActiveFilters(filters: ShopFilters): boolean {
  return (
    filters.categories.length > 0 ||
    filters.collections.length > 0 ||
    filters.colors.length > 0 ||
    filters.sizes.length > 0 ||
    filters.availability.length > 0 ||
    filters.priceMin !== PRICE_MIN ||
    filters.priceMax !== PRICE_MAX ||
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
    if (filters.collections.length && !filters.collections.includes(p.collection)) return false;
    if (filters.availability.length && !filters.availability.includes(p.availability)) return false;
    if (filters.colors.length && !p.colors.some((c) => filters.colors.includes(c.name))) return false;
    if (filters.sizes.length && !p.sizes.some((s) => filters.sizes.includes(s))) return false;
    if (p.price < filters.priceMin || p.price > filters.priceMax) return false;

    if (q) {
      const hit =
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.collection.toLowerCase().includes(q) ||
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

export function getCategoryCounts(filters: ShopFilters): Record<string, number> {
  const result: Record<string, number> = {};
  for (const cat of CATEGORY_OPTIONS) {
    result[cat] = filterProducts(products, { ...filters, categories: [cat] }).length;
  }
  return result;
}

export function getCollectionCounts(filters: ShopFilters): Record<string, number> {
  const result: Record<string, number> = {};
  for (const c of COLLECTION_OPTIONS) {
    result[c.slug] = filterProducts(products, { ...filters, collections: [c.slug] }).length;
  }
  return result;
}

export function getColorCounts(filters: ShopFilters): Record<string, number> {
  const result: Record<string, number> = {};
  for (const c of COLOR_OPTIONS) {
    result[c.name] = filterProducts(products, { ...filters, colors: [c.name] }).length;
  }
  return result;
}

export function getSizeCounts(filters: ShopFilters): Record<string, number> {
  const result: Record<string, number> = {};
  for (const s of SIZE_OPTIONS) {
    result[s] = filterProducts(products, { ...filters, sizes: [s] }).length;
  }
  return result;
}

export function getAvailabilityCounts(filters: ShopFilters): Record<string, number> {
  const result: Record<string, number> = {};
  for (const a of AVAILABILITY_OPTIONS) {
    result[a.value] = filterProducts(products, { ...filters, availability: [a.value] }).length;
  }
  return result;
}
