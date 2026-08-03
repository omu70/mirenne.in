import { Suspense } from "react";
import type { Metadata } from "next";
import { Container } from "@/components/luxury/container";
import { Breadcrumb } from "@/components/luxury/breadcrumb";
import { ShopBrowser } from "@/components/shop/shop-browser";
import { ShopSkeleton } from "@/components/shop/shop-skeleton";

export const metadata: Metadata = {
  title: "Shop All",
  description:
    "Browse the full Mirenne collection — hand-finished evening wear, resort, cocktail, festive, and wedding-guest pieces, made in our own ateliers in Mumbai and Lucknow.",
};

export default function ShopPage() {
  return (
    <Container className="py-10 md:py-14">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Shop" }]} className="mb-6" />

      <div className="mb-10 md:mb-14">
        <p className="label-luxury text-gold">The Full Collection</p>
        <h1 className="mt-3 font-serif text-4xl leading-[1.05] text-gold sm:text-5xl">Shop All</h1>
      </div>

      <Suspense fallback={<ShopSkeleton />}>
        <ShopBrowser />
      </Suspense>
    </Container>
  );
}
