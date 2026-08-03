import type { Metadata, Viewport } from "next";
import "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Mirenne — Modern Indian Luxury Fashion House",
    template: "%s | Mirenne",
  },
  description:
    "Mirenne is a made-in-India luxury womenswear atelier — hand-finished eveningwear, resort and bridal pieces crafted for a modern, quietly confident femininity.",
  keywords: [
    "Mirenne",
    "luxury Indian fashion",
    "designer womenswear",
    "made in India couture",
    "luxury eveningwear",
    "bridal guest outfits",
  ],
};

export const viewport: Viewport = {
  themeColor: "#EDE6CF",
  width: "device-width",
  initialScale: 1,
};

/**
 * Bare shell only — html/body, global fonts and CSS, and metadata that every
 * route should inherit (App Router merges metadata down the tree). Which
 * chrome wraps `children` is decided by each route group below this: the
 * storefront's Navbar/Footer/CartDrawer live in app/(site)/layout.tsx, and
 * the admin's own gate + sidebar shell lives in app/admin/layout.tsx. This
 * split (rather than always rendering SiteChrome here) is what keeps the
 * customer-facing chrome from bleeding into /admin.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className="antialiased">
      <body className="min-h-screen flex flex-col bg-ivory text-gold font-sans">{children}</body>
    </html>
  );
}
