"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/luxury/container";
import { LUXURY_EASE } from "@/components/luxury/reveal";
import { MegaMenu } from "@/components/layout/mega-menu";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { SearchOverlay } from "@/components/layout/search-overlay";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCartStore, cartItemCount } from "@/lib/store/cart-store";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import { useMounted } from "@/lib/hooks/use-mounted";

// Rendered either side of the "Shop" mega-menu trigger, in this exact
// order — matches the Website Content Handoff doc's header nav spec
// (Home, Shop, About, Contact Us). New Arrivals moved out of the top nav
// but stays reachable via the footer and the homepage's New Arrivals rail.
const LINKS_BEFORE_SHOP = [{ label: "Home", href: "/" }];
const LINKS_AFTER_SHOP = [
  { label: "About", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

const TRANSPARENT_PREFIXES = ["/collections"];

export function Navbar() {
  const pathname = usePathname();
  const mounted = useMounted();

  const [scrolled, setScrolled] = React.useState(false);
  const [megaOpen, setMegaOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

  const headerRef = React.useRef<HTMLElement>(null);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const cartItems = useCartStore((s) => s.items);
  const openCart = useCartStore((s) => s.openCart);
  const wishlistCount = useWishlistStore((s) => s.productIds.length);
  const itemCount = cartItemCount(cartItems);

  const isTransparentCapable =
    pathname === "/" || TRANSPARENT_PREFIXES.some((p) => pathname.startsWith(p));

  const showSolid = scrolled || !isTransparentCapable || mobileMenuOpen || searchOpen || megaOpen;

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close every transient nav overlay when the route changes. Navigation can
  // originate from anywhere in the tree (a <Link>, browser back/forward,
  // programmatic router.push), so there's no single event handler to hang
  // this off of — instead this adjusts state during render when `pathname`
  // differs from the last render, which is the React-recommended way to
  // reset state in response to a changing value without an effect.
  const [prevPathname, setPrevPathname] = React.useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMegaOpen(false);
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }

  React.useEffect(() => {
    if (!megaOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMegaOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMegaOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onClick);
    };
  }, [megaOpen]);

  const openMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setMegaOpen(false), 150);
  };

  const textClass = showSolid ? "text-gold" : "text-ivory";

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "fixed left-0 right-0 top-0 z-40 border-b transition-colors duration-500",
          showSolid ? "border-hairline bg-ivory" : "border-transparent bg-transparent"
        )}
      >
        <Container>
          {/* Row 1: mobile menu trigger / logo (centered, larger) / utility icons */}
          <div className="grid h-20 grid-cols-[1fr_auto_1fr] items-center md:h-24">
            <div className="flex items-center justify-self-start">
              <button
                aria-label="Open menu"
                onClick={() => setMobileMenuOpen(true)}
                className={cn("transition-colors duration-500 lg:hidden", textClass)}
              >
                <Menu className="h-6 w-6" strokeWidth={1.25} />
              </button>
            </div>

            <Link href="/" className="justify-self-center" aria-label="Mirenne — Home">
              <Logo
                variant="wordmark"
                className={cn("text-2xl transition-colors duration-500 sm:text-3xl", textClass)}
              />
            </Link>

            <div className="flex items-center gap-5 justify-self-end">
              <button
                aria-label="Search"
                onClick={() => setSearchOpen(true)}
                className={cn("transition-colors duration-500 hover:text-gold-dark", textClass)}
              >
                <Search className="h-[18px] w-[18px]" strokeWidth={1.25} />
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="Account"
                    className={cn("hidden transition-colors duration-500 hover:text-gold-dark sm:block", textClass)}
                  >
                    <User className="h-[18px] w-[18px]" strokeWidth={1.25} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel>Welcome to Mirenne</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => toast("Sign in is coming soon.", { description: "This is a frontend preview build." })}
                  >
                    Sign In
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => toast("Account creation is coming soon.", { description: "This is a frontend preview build." })}
                  >
                    Create Account
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/wishlist">Wishlist</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className={cn("relative hidden transition-colors duration-500 hover:text-gold-dark sm:block", textClass)}
              >
                <Heart className="h-[18px] w-[18px]" strokeWidth={1.25} />
                {mounted && wishlistCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] text-ivory">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <button
                aria-label="Bag"
                onClick={openCart}
                className={cn("relative transition-colors duration-500 hover:text-gold-dark", textClass)}
              >
                <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.25} />
                {mounted && itemCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] text-ivory">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Row 2 (desktop only): primary nav, centered below the logo. Fixed
              lg:h-11 so the total header height (row 1's h-24 + row 2's h-11 =
              140px) is a known constant — SiteChrome's <main> padding and each
              full-bleed hero's cancelling negative margin key off this same
              140px at `lg` and up. Below `lg`, these destinations live in the
              MobileMenu sheet instead. */}
          <nav className="hidden items-center justify-center gap-8 lg:flex lg:h-11">
            {LINKS_BEFORE_SHOP.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn("label-luxury link-underline transition-colors duration-500", textClass)}
              >
                {link.label}
              </Link>
            ))}
            <button
              onMouseEnter={openMenu}
              onMouseLeave={scheduleClose}
              onClick={() => setMegaOpen((v) => !v)}
              className={cn(
                "label-luxury flex items-center gap-1.5 transition-colors duration-500",
                textClass
              )}
              aria-expanded={megaOpen}
            >
              Shop
              <ChevronDown
                className={cn("h-3 w-3 transition-transform duration-300", megaOpen && "rotate-180")}
                strokeWidth={1.5}
              />
            </button>
            {LINKS_AFTER_SHOP.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn("label-luxury link-underline transition-colors duration-500", textClass)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </Container>

        <AnimatePresence>
          {megaOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: LUXURY_EASE }}
              onMouseEnter={openMenu}
              onMouseLeave={scheduleClose}
              className="absolute left-0 right-0 top-full border-b border-hairline bg-ivory shadow-[0_30px_60px_-25px_rgba(17,17,17,0.25)]"
            >
              <Container className="py-14">
                <MegaMenu onNavigate={() => setMegaOpen(false)} />
              </Container>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <MobileMenu
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
        onSearchClick={() => setSearchOpen(true)}
      />
      <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
