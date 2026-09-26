"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppliedCoupon } from "@/lib/checkout/pricing";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  color: string;
  size: string;
  quantity: number;
  /**
   * Human-readable summary of bespoke choices (embellishment, lining,
   * monogram, custom measurements) for pieces added via the "Customize
   * This Piece" configurator. Absent for standard, off-the-rack orders.
   */
  customization?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  giftMessage: string;
  giftWrap: boolean;
  /** Checked against the database when applied; re-checked by the server at payment. */
  coupon: AppliedCoupon | null;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, color: string, size: string, customization?: string) => void;
  updateQuantity: (productId: string, color: string, size: string, quantity: number, customization?: string) => void;
  setGiftMessage: (msg: string) => void;
  setGiftWrap: (value: boolean) => void;
  applyCoupon: (coupon: AppliedCoupon | null) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

interface LineKey {
  productId: string;
  color: string;
  size: string;
  customization?: string;
}

// Two customized orders for the same product/color/size are still distinct
// lines (different monograms or measurements aren't interchangeable), so
// customization is part of the identity — not just a display detail.
const sameLine = (a: LineKey, b: LineKey) =>
  a.productId === b.productId &&
  a.color === b.color &&
  a.size === b.size &&
  (a.customization ?? null) === (b.customization ?? null);

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      giftMessage: "",
      giftWrap: false,
      coupon: null,
      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => sameLine(i, item));
          if (existing) {
            return {
              items: state.items.map((i) =>
                sameLine(i, item) ? { ...i, quantity: i.quantity + quantity } : i
              ),
              isOpen: true,
            };
          }
          return { items: [...state.items, { ...item, quantity }], isOpen: true };
        }),
      removeItem: (productId, color, size, customization) =>
        set((state) => ({
          items: state.items.filter((i) => !sameLine(i, { productId, color, size, customization })),
        })),
      updateQuantity: (productId, color, size, quantity, customization) =>
        set((state) => ({
          items: state.items
            .map((i) => (sameLine(i, { productId, color, size, customization }) ? { ...i, quantity } : i))
            .filter((i) => i.quantity > 0),
        })),
      setGiftMessage: (msg) => set({ giftMessage: msg }),
      setGiftWrap: (value) => set({ giftWrap: value }),
      applyCoupon: (coupon) => set({ coupon }),
      clearCart: () => set({ items: [], giftMessage: "", giftWrap: false, coupon: null }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: "mirenne-cart",
      // v1: promo codes moved from a hard-coded list to the database; drop any
      // old string code rather than carry it over unchecked.
      version: 1,
      migrate: (persisted) => {
        const state = { ...(persisted as Record<string, unknown>) };
        delete state.promoCode;
        return { ...state, coupon: null } as unknown as CartState;
      },
    }
  )
);

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function cartItemCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

