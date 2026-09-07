import type { Metadata, Viewport } from "next";
import "./fonts";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mirenne.in";

export const metadata: Metadata = {
  // Without metadataBase every og:image resolves to a relative path, which
  // WhatsApp, Instagram and Meta's ad previews all silently ignore.
  metadataBase: new URL(SITE_URL),
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
  // Paid traffic and word-of-mouth both arrive as pasted links. With no
  // OpenGraph tags those links previewed as a bare URL — no image, no title —
  // which costs click-through on every share and every ad.
  openGraph: {
    type: "website",
    siteName: "Mirenne",
    locale: "en_IN",
    url: SITE_URL,
    title: "Mirenne — Modern Indian Luxury Fashion House",
    description:
      "Hand-finished modern Indian womenswear, made in India — for women who'd rather be remembered than seen.",
    images: [{ url: "/images/banner/banner-desktop.jpg", width: 1200, height: 630, alt: "Mirenne" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mirenne — Modern Indian Luxury Fashion House",
    description: "Hand-finished modern Indian womenswear, made in India.",
    images: ["/images/banner/banner-desktop.jpg"],
  },
  alternates: { canonical: "/" },
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
