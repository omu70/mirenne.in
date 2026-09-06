"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/luxury/container";
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
import { useContentStore } from "@/lib/store/content-store";


const TRANSPARENT_PREFIXES = ["/collections"];

export function Navbar() {
  const pathname = usePathname();
  const mounted = useMounted();

  const [scrolled, setScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

  const headerRef = React.useRef<HTMLElement>(null);

  // The header nav is admin-editable (see /admin/menu). Any one entry can be
  // flagged as the mega-menu trigger, so the order and the labels either side
  // of it are data rather than two hardcoded arrays.
  const headerLinks = useContentStore((s) => s.navigation.headerLinks);

  const cartItems = useCartStore((s) => s.items);
  const openCart = useCartStore((s) => s.openCart);
  const wishlistCount = useWishlistStore((s) => s.productIds.length);
  const itemCount = cartItemCount(cartItems);

  const isTransparentCapable =
    pathname === "/" || TRANSPARENT_PREFIXES.some((p) => pathname.startsWith(p));

  const showSolid = scrolled || !isTransparentCapable || mobileMenuOpen || searchOpen;

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
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }


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
            {headerLinks.map((link, i) => (
              <Link
                key={`${link.href}-${i}`}
                href={link.href}
                className={cn("label-luxury link-underline transition-colors duration-500", textClass)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </Container>
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
