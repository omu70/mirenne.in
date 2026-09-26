import type { CartItem } from "@/lib/store/cart-store";

/**
 * The single source of truth for what a basket costs. Free of React and of any
 * "use client" module, because three places have to agree on the number to the
 * rupee: the cart drawer, the checkout summary, and the server route that tells
 * Razorpay how much to charge. The browser only ever uses this to *display* a
 * total — the server re-runs it with the coupon it looked up itself.
 */

export const FREE_SHIPPING_THRESHOLD = 15000;
export const STANDARD_SHIPPING = 350;

/** The parts of a coupon the price maths needs. Coupons themselves live in the database. */
export interface AppliedCoupon {
  code: string;
  kind: "percent" | "flat";
  value: number;
  minSubtotal: number;
}

export function couponDiscount(subtotal: number, coupon: AppliedCoupon | null): number {
  if (!coupon || subtotal <= 0 || subtotal < coupon.minSubtotal) return 0;
  const raw = coupon.kind === "percent" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
  return Math.min(raw, subtotal);
}

export function couponLabel(coupon: AppliedCoupon): string {
  return coupon.kind === "percent" ? `${coupon.value}% off` : `₹${coupon.value.toLocaleString("en-IN")} off`;
}

export function shippingFor(subtotal: number): number {
  return subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
}

export interface OrderTotals {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
}

/**
 * Rounding happens once, on the discount, and every downstream figure derives
 * from that — so the total always equals the lines the customer was shown.
 * Free shipping is judged on the pre-discount subtotal, as before.
 */
export function computeTotals(subtotal: number, coupon: AppliedCoupon | null): OrderTotals {
  const discount = couponDiscount(subtotal, coupon);
  const shipping = shippingFor(subtotal);
  return { subtotal, discount, shipping, total: subtotal - discount + shipping };
}

export function lineSubtotal(items: { price: number; quantity: number }[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

/** Razorpay works in the smallest currency unit — paise for INR. */
export function toPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export type CheckoutLine = Pick<CartItem, "slug" | "color" | "size" | "quantity" | "customization">;
