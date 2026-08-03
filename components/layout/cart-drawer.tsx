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
import { cartItemCount, cartSubtotal, promoDiscountRate, useCartStore } from "@/lib/store/cart-store";
import { useProductStore } from "@/lib/store/product-store";
import { formatINR } from "@/lib/utils";

const FREE_SHIPPING_THRESHOLD = 15000;
const STANDARD_SHIPPING = 350;

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
  const promoCode = useCartStore((s) => s.promoCode);
  const applyPromoCode = useCartStore((s) => s.applyPromoCode);
  const products = useProductStore((s) => s.products);

  const [promoInput, setPromoInput] = React.useState("");

  const subtotal = cartSubtotal(items);
  const discountRate = promoDiscountRate(promoCode);
  const discount = Math.round(subtotal * discountRate);
  const shippingEstimate = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  const total = subtotal - discount + shippingEstimate;

  const recommended = products.filter((p) => p.isBestSeller && !items.some((i) => i.productId === p.id)).slice(0, 3);

  const handleApplyPromo = () => {
    if (!promoInput.trim()) return;
    const rate = promoDiscountRate(promoInput);
    if (rate > 0) {
      applyPromoCode(promoInput.toUpperCase());
      toast.success(`Promo code ${promoInput.toUpperCase()} applied.`);
    } else {
      toast.error("That promo code is not valid.");
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
                      <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
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
                  <Button variant="secondary" size="sm" onClick={handleApplyPromo}>
                    Apply
                  </Button>
                </div>
                {promoCode && (
                  <p className="mt-2 text-xs text-gold">
                    {promoCode} applied — {Math.round(discountRate * 100)}% off
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
              <div className="mb-6 flex justify-between border-t border-hairline pt-4 text-base">
                <span className="text-gold">Estimated Total</span>
                <span className="font-serif text-lg text-gold">{formatINR(total)}</span>
              </div>
              <Button asChild variant="primary" size="lg" className="w-full">
                <Link href="/checkout" onClick={closeCart}>
                  Proceed to Checkout
                </Link>
              </Button>
              <p className="mt-3 text-center text-[11px] text-gold">
                Complimentary shipping on orders above {formatINR(FREE_SHIPPING_THRESHOLD)}
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
