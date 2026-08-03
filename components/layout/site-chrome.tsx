"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/layout/cart-drawer";
import { Toaster } from "@/components/ui/sonner";

/**
 * Client-side shell wrapping every route: sticky/transparent Navbar, Footer,
 * the globally-mounted CartDrawer (driven entirely by the cart Zustand
 * store, so it needs no props), and the toast layer. Kept as its own
 * client boundary so `app/layout.tsx` can stay a server component and
 * still export `metadata`/`viewport`.
 *
 * `<main>` carries top padding equal to the fixed Navbar's height: a single
 * row (`h-20 md:h-24`) below `lg`, where the primary nav lives in the
 * MobileMenu sheet instead, and two rows (`h-24` + `h-11` = 140px) at `lg`
 * and up, where the nav renders centered below the logo. Full-bleed hero
 * sections (Home, Collection detail pages) should cancel this out with the
 * matching `-mt-20 md:-mt-24 lg:-mt-[140px]` so their imagery runs up under
 * the transparent nav.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20 md:pt-24 lg:pt-[140px]">{children}</main>
      <Footer />
      <CartDrawer />
      <Toaster />
    </>
  );
}
