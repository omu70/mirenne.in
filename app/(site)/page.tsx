import { Hero } from "@/components/home/hero";
import { EditorialCampaign } from "@/components/home/editorial-campaign";
import { ProductShowcase } from "@/components/home/product-showcase";
import { FeaturedCollection } from "@/components/home/featured-collection";
import { CollectionBanner } from "@/components/home/collection-banner";
import { GraphicBanner } from "@/components/home/graphic-banner";
import { Craftsmanship } from "@/components/home/craftsmanship";
import { Lookbook } from "@/components/home/lookbook";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { InstagramGallery } from "@/components/home/instagram-gallery";
import { NewsletterBand } from "@/components/home/newsletter-band";

// NewArrivals / BestSellers / FeaturedProducts previously ran here as three
// separate 4-up grids. With only six products total in the catalogue, the
// three rails mostly reshuffled the same cards rather than showing more of
// the collection — so they're replaced with ProductShowcase, one editorial,
// alternating-sides section per product covering the full six. Their files
// are left in place, unused, for a future catalogue with more SKUs.
export default function Home() {
  return (
    <>
      <Hero />
      <EditorialCampaign />
      <ProductShowcase />
      <FeaturedCollection />
      <CollectionBanner />
      <GraphicBanner />
      <Craftsmanship />
      <Lookbook />
      <TestimonialsSection />
      <InstagramGallery />
      <NewsletterBand />
    </>
  );
}
