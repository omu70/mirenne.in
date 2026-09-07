import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mirenne.in";

/**
 * Keeps the admin panel, checkout and the wishlist out of the index. Checkout
 * and wishlist pages are per-shopper and worthless as search results; /admin
 * has no business being crawled at all.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/admin/", "/checkout", "/wishlist", "/api/"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
