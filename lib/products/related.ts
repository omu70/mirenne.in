import type { Product } from "@/lib/types";

/**
 * Picks up to `limit` products to show alongside `product` ("You May Also
 * Like"). Prefers the closest match — same collection AND category — then
 * widens the net (same collection, then same category, then anything else)
 * so a page always has something to show rather than a half-empty rail.
 * Takes the live catalogue as a parameter (rather than importing the static
 * seed) so it reflects whatever's currently in the admin-editable store.
 */
export function getRelatedProducts(product: Product, allProducts: Product[], limit = 4): Product[] {
  const pool = allProducts.filter((p) => p.id !== product.id);

  const buckets = [
    pool.filter((p) => p.collection === product.collection && p.category === product.category),
    pool.filter((p) => p.collection === product.collection),
    pool.filter((p) => p.category === product.category),
    pool,
  ];

  const seen = new Set<string>();
  const result: Product[] = [];

  for (const bucket of buckets) {
    for (const p of bucket) {
      if (result.length >= limit) break;
      if (!seen.has(p.id)) {
        seen.add(p.id);
        result.push(p);
      }
    }
    if (result.length >= limit) break;
  }

  return result;
}
