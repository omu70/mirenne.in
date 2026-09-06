"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import { useContentStore } from "@/lib/store/content-store";
import { useMounted } from "@/lib/hooks/use-mounted";

interface MobileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSearchClick: () => void;
}

export function MobileMenu({ open, onOpenChange, onSearchClick }: MobileMenuProps) {
  const mounted = useMounted();
  const wishlistCount = useWishlistStore((s) => s.productIds.length);
  const headerLinks = useContentStore((s) => s.navigation.headerLinks);
  const close = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full max-w-sm p-0">
        <div className="flex items-center justify-between border-b border-hairline px-6 py-6">
          <Logo variant="horizontal" className="text-gold" markClassName="h-7" wordmarkClassName="text-lg" />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <button
            onClick={() => {
              close();
              onSearchClick();
            }}
            className="mb-8 flex w-full items-center gap-3 border border-hairline-dark px-4 py-3 text-gold transition-colors hover:border-ink hover:text-gold-dark"
          >
            <Search className="h-4 w-4" strokeWidth={1.25} />
            <span className="text-sm">Search products, collections...</span>
          </button>


          <nav className="flex flex-col divide-y divide-hairline border-t border-hairline">
            {headerLinks.map((link, i) => (
              <Link
                key={`${link.href}-${i}`}
                href={link.href}
                onClick={close}
                className="label-luxury py-4 text-gold"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/wishlist" onClick={close} className="label-luxury flex items-center justify-between py-4 text-gold">
              Wishlist
              {mounted && wishlistCount > 0 && <span className="text-gold">{wishlistCount}</span>}
            </Link>
          </nav>

          <div className="mt-8 flex flex-col gap-3 border-t border-hairline pt-8">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => toast("Sign in is coming soon.", { description: "This is a frontend preview build." })}
            >
              Sign In
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toast("Account creation is coming soon.", { description: "This is a frontend preview build." })}
            >
              Create Account
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
