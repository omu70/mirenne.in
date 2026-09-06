"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { products as seedProducts } from "@/lib/data/products";
import { slugify } from "@/lib/utils";
import type { Product } from "@/lib/types";

/**
 * The live, editable product catalogue. Everything the storefront renders —
 * Shop, Home rails, the PDP, search, related/recently-viewed — reads from
 * this store rather than importing lib/data/products.ts directly, so
 * whatever gets added/edited/removed in /admin/products shows up on the
 * live site immediately. It persists to this browser's local storage (see
 * the project-wide caveat: there's no backend here, so "saved" means saved
 * to this browser on this device, not to a server).
 */
/**
 * Local storage is capped (~5MB in most browsers) and uploaded photos are
 * stored inline as data URLs, so a big gallery can hit the ceiling. Without
 * this wrapper setItem throws, persist swallows it, and the admin's whole
 * catalogue silently fails to save — including edits that had nothing to do
 * with images. Catching it means the in-memory catalogue still works for the
 * rest of the session and the admin is told what happened instead of losing
 * work without a word.
 */
const safeLocalStorage: Storage = {
  get length() {
    return localStorage.length;
  },
  key: (i) => localStorage.key(i),
  getItem: (k) => localStorage.getItem(k),
  removeItem: (k) => localStorage.removeItem(k),
  clear: () => localStorage.clear(),
  setItem: (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("mirenne:storage-full"));
      }
    }
  },
};

interface ProductState {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  reorderProducts: (orderedIds: string[]) => void;
  resetToSeed: () => void;
}

export const useProductStore = create<ProductState>()(
  persist(
    (set) => ({
      products: seedProducts,

      addProduct: (product) =>
        set((state) => ({ products: [...state.products, product] })),

      updateProduct: (id, patch) =>
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),

      deleteProduct: (id) =>
        set((state) => ({ products: state.products.filter((p) => p.id !== id) })),

      reorderProducts: (orderedIds) =>
        set((state) => {
          const byId = new Map(state.products.map((p) => [p.id, p]));
          const reordered = orderedIds.map((id) => byId.get(id)).filter((p): p is Product => Boolean(p));
          const remaining = state.products.filter((p) => !orderedIds.includes(p.id));
          return { products: [...reordered, ...remaining] };
        }),

      resetToSeed: () => set({ products: seedProducts }),
    }),
    { name: "mirenne-products", storage: createJSONStorage(() => safeLocalStorage) }
  )
);


/** Slugifies a name and disambiguates against existing slugs (my-piece, my-piece-2, ...). */
export function generateSlug(name: string, existing: Product[]): string {
  const base = slugify(name) || "piece";
  let slug = base;
  let n = 2;
  while (existing.some((p) => p.slug === slug)) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

export function generateProductId(): string {
  return `p-${(typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`).slice(0, 8)}`;
}
