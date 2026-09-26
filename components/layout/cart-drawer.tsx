"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/input";
import { cartItemCount, cartSubtotal, useCartStore } from "@/lib/store/cart-store";
import { FREE_SHIPPING_THRESHOLD, computeTotals, couponLabel, type AppliedCoupon } from "@/lib/checkout/pricing";
import { useProductStore } from "@/lib/store/product-store";
import { formatINR, isUnoptimizableSrc } from "@/lib/utils";

export function CartDrawer() {
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const giftMessage = useCartStore((s) => s.giftMessage);
  const setGiftMessage = useCartStore((s) => s.setGiftMessage);
  const giftWrap = useCartStore((s) => s.giftWrap);
  const setGiftWrap = useCartStore((s) => s.setGiftWrap);
  const coupon = useCartStore((s) => s.coupon);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const products = useProductStore((s) => s.products);

  const [promoInput, setPromoInput] = React.useState("");
  const [checkingPromo, setCheckingPromo] = React.useState(false);

  const subtotal = cartSubtotal(items);
  // Same helper the checkout page and the payment route use, so what's shown
  // here can't drift from what gets charged.
  const { discount, shipping: shippingEstimate, total } = computeTotals(subtotal, coupon);

  const recommended = products.filter((p) => p.isBestSeller && !items.some((i) => i.productId === p.id)).slice(0, 3);

  const handleApplyPromo = async () => {
    if (!promoInput.trim() || checkingPromo) return;
    setCheckingPromo(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoInput, subtotal }),
      });
      const data = (await res.json()) as { ok: boolean; coupon?: AppliedCoupon; message?: string };
      if (data.ok && data.coupon) {
        applyCoupon(data.coupon);
        setPromoInput("");
        toast.success(`${data.coupon.code} applied — ${couponLabel(data.coupon)}.`);
      } else {
        toast.error(data.message ?? "That promo code isn't valid.");
      }
    } catch {
      toast.error("Couldn't check that code. Try again.");
    } finally {
      setCheckingPromo(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(v) => !v && closeCart()}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Your Bag{items.length > 0 && ` (${cartItemCount(items)})`}</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag className="h-8 w-8 text-gold/40" strokeWidth={1} />
            <p className="text-sm text-gold">Your bag is empty.</p>
            <Button variant="secondary" size="sm" onClick={closeCart}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6">
              <ul className="divide-y divide-hairline">
                {items.map((item) => (
                  <li
                    key={`${item.productId}-${item.color}-${item.size}-${item.customization ?? "standard"}`}
                    className="flex gap-4 py-6"
                  >
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={closeCart}
                      className="relative h-28 w-20 shrink-0 overflow-hidden bg-paper"
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        unoptimized={isUnoptimizableSrc(item.image)}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </Link>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex justify-between gap-2">
                        <div>
                          <Link
                            href={`/product/${item.slug}`}
                            onClick={closeCart}
                            className="text-sm text-gold transition-colors hover:text-gold-dark"
                          >
                            {item.name}
                          </Link>
                          <p className="mt-1 text-xs text-gold">
                            {item.color} · {item.size}
                          </p>
                          {item.customization && (
                            <p className="mt-0.5 text-xs italic text-gold">{item.customization}</p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.productId, item.color, item.size, item.customization)}
                          className="cursor-pointer text-gold transition-colors hover:text-gold-dark"
                          aria-label={`Remove ${item.name} from bag`}
                        >
                          <X className="h-4 w-4" strokeWidth={1.25} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-hairline-dark">
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.color, item.size, item.quantity - 1, item.customization)
                            }
                            className="flex h-7 w-7 cursor-pointer items-center justify-center text-gold hover:text-gold-dark"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" strokeWidth={1.5} />
                          </button>
                          <span className="w-6 text-center text-xs text-gold">{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.color, item.size, item.quantity + 1, item.customization)
                            }
                            className="flex h-7 w-7 cursor-pointer items-center justify-center text-gold hover:text-gold-dark"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" strokeWidth={1.5} />
                          </button>
                        </div>
                        <p className="text-sm text-gold">{formatINR(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {recommended.length > 0 && (
                <div className="border-t border-hairline py-6">
                  <p className="label-luxury mb-4 text-gold">You May Also Like</p>
                  <div className="grid grid-cols-3 gap-3">
                    {recommended.map((p) => (
                      <Link key={p.id} href={`/product/${p.slug}`} onClick={closeCart} className="group">
                        <div className="relative aspect-[3/4] overflow-hidden bg-paper">
                          <Image
                            src={p.images[0].src}
                            alt={p.images[0].alt}
                            unoptimized={isUnoptimizableSrc(p.images[0].src)}
                            fill
                            sizes="120px"
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          />
                        </div>
                        <p className="mt-2 line-clamp-1 text-[11px] text-gold">{p.name}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-hairline py-6">
                <Label htmlFor="gift-message" className="mb-2 block">
                  Gift Message (Optional)
                </Label>
                <Textarea
                  id="gift-message"
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  rows={2}
                  placeholder="Add a note for the recipient..."
                  className="min-h-0"
                />
                <Label htmlFor="gift-wrap" className="mt-4 flex cursor-pointer items-center gap-3">
                  <Checkbox id="gift-wrap" checked={giftWrap} onCheckedChange={(v) => setGiftWrap(Boolean(v))} />
                  Complimentary Gift Wrapping
                </Label>
              </div>

              <div className="border-t border-hairline py-6">
                <p className="label-luxury mb-3 text-gold">Promo Code</p>
                <div className="flex gap-2">
                  <input
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Enter code"
                    className="h-11 flex-1 border border-hairline-dark bg-transparent px-3 text-sm uppercase placeholder:normal-case placeholder:text-gold/60 focus:outline-none focus:border-ink"
                  />
                  <Button variant="secondary" size="sm" onClick={handleApplyPromo} disabled={checkingPromo}>
                    {checkingPromo ? "…" : "Apply"}
                  </Button>
                </div>
                {coupon && (
                  <p className="mt-2 flex items-center justify-between text-xs text-gold">
                    <span>
                      {coupon.code} applied — {couponLabel(coupon)}
                      {discount === 0 && coupon.minSubtotal > subtotal && (
                        <> (needs {formatINR(coupon.minSubtotal)}+)</>
                      )}
                    </span>
                    <button type="button" onClick={() => applyCoupon(null)} className="cursor-pointer underline">
                      Remove
                    </button>
                  </p>
                )}
              </div>
            </div>

            <div className="border-t border-hairline px-6 py-6">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-gold">Subtotal</span>
                <span className="text-gold">{formatINR(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-gold">Discount</span>
                  <span className="text-gold">−{formatINR(discount)}</span>
                </div>
              )}
              <div className="mb-4 flex justify-between text-sm">
                <span className="text-gold">Shipping</span>
                <span className="text-gold">{shippingEstimate === 0 ? "Complimentary" : formatINR(shippingEstimate)}</span>
              </div>

              {/* How far off free shipping the basket is, as a bar rather than a
                  sentence at the bottom of the drawer. Every piece is priced
                  below the threshold, so a single-item basket is always short
                  of it and always paying delivery — a shopper who can see the
                  gap can close it, and one who can't, doesn't. */}
              {shippingEstimate > 0 && (
                <div className="mb-4">
                  <div className="h-0.5 w-full bg-hairline-dark/40">
                    <div
                      className="h-0.5 bg-ink transition-[width] duration-500 ease-out"
                      style={{ width: `${Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100))}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-gold">
                    {formatINR(FREE_SHIPPING_THRESHOLD - subtotal)} away from complimentary shipping
                  </p>
                </div>
              )}
              <div className="mb-6 flex justify-between border-t border-hairline pt-4 text-base">
                <span className="text-gold">Estimated Total</span>
                <span className="font-serif text-lg text-gold">{formatINR(total)}</span>
              </div>
              <Button asChild variant="primary" size="lg" className="w-full">
                <Link href="/checkout" onClick={closeCart}>
                  Proceed to Checkout
                </Link>
              </Button>
              {shippingEstimate === 0 && (
                <p className="mt-3 text-center text-[11px] text-gold">
                  Complimentary shipping applied
                </p>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
