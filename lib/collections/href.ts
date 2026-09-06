import type { CollectionSlug } from "@/lib/types";

/**
 * Where a collection link should point.
 *
 * There is no /collections/<slug> route — the site never had one, so every
 * collection link on the homepage, in the footer and on product pages was a
 * 404. Rather than build landing pages that would currently be empty (no piece
 * is assigned to a collection), collection links go to Shop with that
 * collection's filter applied. That URL is real today, says what it means, and
 * starts returning pieces the moment products are assigned in /admin/products.
 *
 * If proper collection landing pages are built later, this is the one place to
 * change.
 */
export function collectionHref(slug: CollectionSlug | string): string {
  return `/shop?collection=${encodeURIComponent(slug)}`;
}
