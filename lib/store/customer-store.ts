"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  ordersCount: number;
  totalSpent: number;
  joinedAt: string;
  vip: boolean;
  notes?: string;
}

/**
 * Sample customer records — there's no real accounts/auth system in this
 * frontend-only build, so this is a manageable list for the admin rather
 * than a live customer database. Persists to this browser's local storage.
 */
const SEED_CUSTOMERS: Customer[] = [
  { id: "c01", name: "Ritika Malhotra", email: "ritika.malhotra@example.com", phone: "+91 98200 11234", city: "Mumbai, MH", ordersCount: 3, totalSpent: 142500, joinedAt: "2025-02-14", vip: true },
  { id: "c02", name: "Ananya Rao", email: "ananya.rao@example.com", phone: "+91 90080 22345", city: "Bengaluru, KA", ordersCount: 2, totalSpent: 71500, joinedAt: "2025-05-03", vip: false },
  { id: "c03", name: "Harleen Kaur", email: "harleen.kaur@example.com", phone: "+91 98140 33456", city: "Delhi, DL", ordersCount: 4, totalSpent: 198500, joinedAt: "2024-11-22", vip: true },
  { id: "c04", name: "Priya Nair", email: "priya.nair@example.com", phone: "+91 94470 44567", city: "Kochi, KL", ordersCount: 1, totalSpent: 37350, joinedAt: "2026-06-30", vip: false },
  { id: "c05", name: "Simran Chawla", email: "simran.chawla@example.com", phone: "+91 98760 55678", city: "Chandigarh, PB", ordersCount: 1, totalSpent: 28500, joinedAt: "2026-07-28", vip: false },
  { id: "c06", name: "Meera Iyer", email: "meera.iyer@example.com", phone: "+91 93450 66789", city: "Chennai, TN", ordersCount: 1, totalSpent: 16850, joinedAt: "2026-06-29", vip: false },
  { id: "c07", name: "Devika Menon", email: "devika.menon@example.com", phone: "+91 99870 77890", city: "Hyderabad, TS", ordersCount: 5, totalSpent: 267000, joinedAt: "2024-08-09", vip: true },
];

interface CustomerState {
  customers: Customer[];
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, patch: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  resetToSeed: () => void;
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set) => ({
      customers: SEED_CUSTOMERS,
      addCustomer: (customer) => set((state) => ({ customers: [...state.customers, customer] })),
      updateCustomer: (id, patch) =>
        set((state) => ({ customers: state.customers.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      deleteCustomer: (id) => set((state) => ({ customers: state.customers.filter((c) => c.id !== id) })),
      resetToSeed: () => set({ customers: SEED_CUSTOMERS }),
    }),
    { name: "mirenne-customers" }
  )
);
