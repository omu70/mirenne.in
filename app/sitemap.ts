import type { MetadataRoute } from "next";
import { products } from "@/lib/data/products";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mirenne.in";

/**
 * Built from the committed catalogue rather than the admin store, because a
 * sitemap is generated on the server and the live store lives in a browser.
 * That matches what search engines can actually reach: only committed products
 * have a page a crawler can load.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/shop`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    ...products.map((p) => ({
      url: `${SITE_URL}/product/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
