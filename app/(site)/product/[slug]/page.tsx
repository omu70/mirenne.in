import type { Metadata } from "next";
import { productMap } from "@/lib/data/products";
import { ProductPageClient } from "@/components/product/product-page-client";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mirenne.in";

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
  if (!seedProduct) return { title: "Mirenne" };

  const image = seedProduct.images[0];

  return {
    title: seedProduct.name,
    description: seedProduct.shortDescription,
    alternates: { canonical: `/product/${slug}` },
    // A product link shared to WhatsApp or used as an ad destination should
    // preview as the piece itself, not as a bare URL.
    openGraph: {
      type: "website",
      title: seedProduct.name,
      description: seedProduct.shortDescription,
      url: `/product/${slug}`,
      images: image ? [{ url: image.src, width: image.width, height: image.height, alt: image.alt }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: seedProduct.name,
      description: seedProduct.shortDescription,
      images: image ? [image.src] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const seedProduct = productMap[slug];

  /**
   * Product structured data, so Google can show the price and availability
   * directly in results rather than a plain blue link. Built from the seed
   * catalogue because this runs on the server — which is also the honest
   * boundary: only committed products are purchasable, so only they should
   * claim an offer.
   */
  const jsonLd = seedProduct && {
    "@context": "https://schema.org",
    "@type": "Product",
    name: seedProduct.name,
    description: seedProduct.description,
    sku: seedProduct.id,
    // Absolute URLs: search engines resolve structured data on its own, with
    // no page context to make a relative path meaningful.
    image: seedProduct.images.map((i) => `${SITE_URL}${i.src}`),
    brand: { "@type": "Brand", name: "Mirenne" },
    ...(seedProduct.fabric ? { material: seedProduct.fabric } : {}),
    offers: {
      "@type": "Offer",
      price: seedProduct.price,
      priceCurrency: "INR",
      availability:
        seedProduct.availability === "made-to-order"
          ? "https://schema.org/PreOrder"
          : "https://schema.org/InStock",
      url: `${SITE_URL}/product/${slug}`,
    },
  };

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          // Values come from the committed catalogue, not user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductPageClient slug={slug} />
    </>
  );
}
