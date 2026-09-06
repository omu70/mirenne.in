"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn, formatINR, isUnoptimizableSrc } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface StickyMobileBuyBarProps {
  product: Product;
}

/**
 * Mobile-only conversion aid: once the real Add To Bag button (in BuyBox,
 * id="pdp-add-to-bag") scrolls out of view, a compact bar pins to the
 * bottom of the screen so the primary action stays one tap away through
 * the long editorial sections below the fold (designer note, reviews,
 * related products). Deliberately does not duplicate BuyBox's color/size
 * state — it forwards the tap to the real button via id, so whatever the
 * shopper already selected there is exactly what gets added.
 *
 * Also hides itself once the site footer scrolls into view. The footer is
 * rendered as a sibling after this page (in SiteChrome, not inside it), so
 * without this second check the fixed bar would sit on top of the footer's
 * own links and copyright line for as long as the page is scrolled to the
 * bottom.
 */
export function StickyMobileBuyBar({ product }: StickyMobileBuyBarProps) {
  const [pastButton, setPastButton] = React.useState(false);
  const [footerVisible, setFooterVisible] = React.useState(false);

  React.useEffect(() => {
    const button = document.getElementById("pdp-add-to-bag");
    const footer = document.querySelector("footer");
    const observers: IntersectionObserver[] = [];

    if (button) {
      const buttonObserver = new IntersectionObserver(([entry]) => setPastButton(!entry.isIntersecting), {
        rootMargin: "0px 0px -10% 0px",
      });
      buttonObserver.observe(button);
      observers.push(buttonObserver);
    }

    if (footer) {
      const footerObserver = new IntersectionObserver(([entry]) => setFooterVisible(entry.isIntersecting));
      footerObserver.observe(footer);
      observers.push(footerObserver);
    }

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const visible = pastButton && !footerVisible;

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-hairline bg-ivory/95 px-4 py-3 backdrop-blur transition-transform duration-300 ease-out md:hidden",
        visible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="relative h-12 w-9 shrink-0 overflow-hidden bg-paper">
        <Image
          src={product.images[0].src}
          alt=""
          unoptimized={isUnoptimizableSrc(product.images[0].src)}
          fill
          sizes="36px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-gold">{product.name}</p>
        <p className="text-xs text-gold">{formatINR(product.price)}</p>
      </div>
      <Button
        variant="primary"
        size="md"
        className="shrink-0"
        tabIndex={visible ? 0 : -1}
        onClick={() => document.getElementById("pdp-add-to-bag")?.click()}
      >
        Add To Bag
      </Button>
    </div>
  );
}
