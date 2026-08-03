import type { Metadata } from "next";
import { productMap } from "@/lib/data/products";
import { ProductPageClient } from "@/components/product/product-page-client";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// The catalogue is now a client-side, admin-editable store (see
// lib/store/product-store.ts, managed from /admin/products) rather than a
// static build-time list, so this route can no longer pre-generate a static
// page per product or resolve live per-product metadata on the server —
// there's no server-side data source once a piece is added or edited only
// in a browser's local storage. generateMetadata falls back to the original
// seed catalogue when a slug happens to match it (the common case for the
// six pieces this ships with) and to a generic title otherwise; the actual
// product lookup and rendering happens client-side in ProductPageClient,
// against whatever is currently in the live store.
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const seedProduct = productMap[slug];
  if (seedProduct) {
    return { title: seedProduct.name, description: seedProduct.shortDescription };
  }
  return { title: "Mirenne" };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  return <ProductPageClient slug={slug} />;
}
