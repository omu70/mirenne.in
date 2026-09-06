import type { CartItem } from "@/lib/store/cart-store";

/**
 * The single source of truth for what a basket costs. Deliberately free of
 * React and of any "use client" module, because three separate places have to
 * agree on the number to the rupee: the cart drawer's running total, the
 * checkout page's summary, and the server route that tells Razorpay how much
 * to charge. When these constants lived as locals inside cart-drawer.tsx, the
 * only thing stopping the displayed total and the charged amount from drifting
 * apart was that nothing else computed a total yet.
 */

export const FREE_SHIPPING_THRESHOLD = 15000;
export const STANDARD_SHIPPING = 350;

const PROMO_CODES: Record<string, number> = {
  MIRENNE10: 0.1,
  WELCOME15: 0.15,
};

export function promoDiscountRate(code: string | null): number {
  if (!code) return 0;
  return PROMO_CODES[code.toUpperCase()] ?? 0;
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
 * Rounding happens once, on the discount, and every downstream figure is
 * derived from that rounded value — so the total always equals the lines the
 * customer was shown adding up, with no half-rupee drift between the summary
 * and the amount sent to Razorpay.
 */
export function computeTotals(subtotal: number, promoCode: string | null): OrderTotals {
  const discount = Math.round(subtotal * promoDiscountRate(promoCode));
  const discounted = subtotal - discount;
  const shipping = shippingFor(subtotal);
  return { subtotal, discount, shipping, total: discounted + shipping };
}

export function lineSubtotal(items: { price: number; quantity: number }[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

/** Razorpay works in the smallest currency unit — paise for INR. */
export function toPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export type CheckoutLine = Pick<CartItem, "slug" | "color" | "size" | "quantity" | "customization">;
