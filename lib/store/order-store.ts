"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "paid" | "pending" | "refunded";

export interface OrderItem {
  productName: string;
  slug: string;
  color: string;
  size: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  city: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  placedAt: string;
  notes?: string;
}

/**
 * There's no real checkout-to-order pipeline in this frontend-only build
 * (Checkout Preview is still on the site's to-build list), so this is
 * sample order data an admin can review and move through statuses — not a
 * live feed of real purchases. Seeded with plausible orders against the
 * six seed products; persists to this browser's local storage.
 */
const SEED_ORDERS: Order[] = [
  {
    id: "MRN-1001",
    customerName: "Ritika Malhotra",
    customerEmail: "ritika.malhotra@example.com",
    city: "Mumbai, MH",
    items: [{ productName: "Kalaghoda Column Gown", slug: "kalaghoda-column-gown", color: "Wine", size: "M", quantity: 1, price: 52500 }],
    subtotal: 52500,
    shipping: 0,
    total: 52500,
    status: "processing",
    paymentStatus: "paid",
    placedAt: "2026-07-24",
  },
  {
    id: "MRN-1002",
    customerName: "Ananya Rao",
    customerEmail: "ananya.rao@example.com",
    city: "Bengaluru, KA",
    items: [{ productName: "Lucknow Chikankari Anarkali", slug: "lucknow-chikankari-anarkali", color: "Ivory", size: "L", quantity: 1, price: 38500 }],
    subtotal: 38500,
    shipping: 0,
    total: 38500,
    status: "shipped",
    paymentStatus: "paid",
    placedAt: "2026-07-21",
  },
  {
    id: "MRN-1003",
    customerName: "Harleen Kaur",
    customerEmail: "harleen.kaur@example.com",
    city: "Delhi, DL",
    items: [{ productName: "Chanderi Marigold Lehenga Set", slug: "chanderi-marigold-lehenga", color: "Marigold", size: "S", quantity: 1, price: 64500 }],
    subtotal: 64500,
    shipping: 0,
    total: 64500,
    status: "delivered",
    paymentStatus: "paid",
    placedAt: "2026-07-10",
  },
  {
    id: "MRN-1004",
    customerName: "Priya Nair",
    customerEmail: "priya.nair@example.com",
    city: "Kochi, KL",
    items: [{ productName: "Konkan Sunset Kaftan", slug: "konkan-sunset-kaftan", color: "Sunset", size: "Free Size", quantity: 2, price: 18500 }],
    subtotal: 37000,
    shipping: 350,
    total: 37350,
    status: "delivered",
    paymentStatus: "paid",
    placedAt: "2026-07-05",
  },
  {
    id: "MRN-1005",
    customerName: "Simran Chawla",
    customerEmail: "simran.chawla@example.com",
    city: "Chandigarh, PB",
    items: [{ productName: "Kalaghoda Cocktail Dress", slug: "kalaghoda-cocktail-dress", color: "Black", size: "M", quantity: 1, price: 28500 }],
    subtotal: 28500,
    shipping: 0,
    total: 28500,
    status: "pending",
    paymentStatus: "pending",
    placedAt: "2026-07-28",
    notes: "Requested gift wrap and a handwritten note.",
  },
  {
    id: "MRN-1006",
    customerName: "Meera Iyer",
    customerEmail: "meera.iyer@example.com",
    city: "Chennai, TN",
    items: [{ productName: "Konkan Linen Co-ord Set", slug: "konkan-linen-co-ord", color: "Sand", size: "S", quantity: 1, price: 16500 }],
    subtotal: 16500,
    shipping: 350,
    total: 16850,
    status: "cancelled",
    paymentStatus: "refunded",
    placedAt: "2026-06-29",
    notes: "Customer requested a different size that was out of stock; refunded in full.",
  },
];

interface OrderState {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrder: (id: string, patch: Partial<Order>) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;
  resetToSeed: () => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      orders: SEED_ORDERS,
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      updateOrder: (id, patch) =>
        set((state) => ({ orders: state.orders.map((o) => (o.id === id ? { ...o, ...patch } : o)) })),
      updateOrderStatus: (id, status) =>
        set((state) => ({ orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)) })),
      deleteOrder: (id) => set((state) => ({ orders: state.orders.filter((o) => o.id !== id) })),
      resetToSeed: () => set({ orders: SEED_ORDERS }),
    }),
    { name: "mirenne-orders" }
  )
);
