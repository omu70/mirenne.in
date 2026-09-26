import { Hero } from "@/components/home/hero";
import { ProductShowcase } from "@/components/home/product-showcase";
import { Craftsmanship } from "@/components/home/craftsmanship";
import { NewsletterBand } from "@/components/home/newsletter-band";

// NewArrivals / BestSellers / FeaturedProducts previously ran here as three
// separate 4-up grids. With only six products total in the catalogue, the
// three rails mostly reshuffled the same cards rather than showing more of
// the collection — so they're replaced with ProductShowcase, one editorial,
// alternating-sides section per product covering the full six. Their files
// are left in place, unused, for a future catalogue with more SKUs.
// Trimmed to the sections that carry real content. Removed (files kept):
// FeaturedCollection (duplicated EditorialCampaign's single-collection
// spotlight), GraphicBanner (copy-less filler), Lookbook (stock mood shots),
// TestimonialsSection (placeholder customer quotes, not real reviews) and
// InstagramGallery (placeholder posts/likes linking to "#"), EditorialCampaign
// (Evening Wear spotlight) and CollectionBanner ("Seven Ways To Dress").
export default function Home() {
  return (
    <>
      <Hero />
      <ProductShowcase />
      <Craftsmanship />
      <NewsletterBand />
    </>
  );
}
