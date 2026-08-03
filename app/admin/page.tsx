"use client";

import Link from "next/link";
import { Package, ShoppingCart, Users, TriangleAlert } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { useProductStore } from "@/lib/store/product-store";
import { useOrderStore } from "@/lib/store/order-store";
import { useCustomerStore } from "@/lib/store/customer-store";
import { useMounted } from "@/lib/hooks/use-mounted";
import { formatINR } from "@/lib/utils";

export default function AdminDashboardPage() {
  const mounted = useMounted();
  const products = useProductStore((s) => s.products);
  const orders = useOrderStore((s) => s.orders);
  const customers = useCustomerStore((s) => s.customers);

  if (!mounted) return null;

  const revenue = orders.filter((o) => o.paymentStatus === "paid").reduce((sum, o) => sum + o.total, 0);
  const lowStock = products.filter((p) => p.availability === "low-stock").length;
  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "processing").length;
  const recentOrders = [...orders].sort((a, b) => (a.placedAt < b.placedAt ? 1 : -1)).slice(0, 5);

  const stats = [
    { label: "Products", value: products.length, href: "/admin/products", icon: Package },
    { label: "Orders", value: orders.length, href: "/admin/orders", icon: ShoppingCart },
    { label: "Customers", value: customers.length, href: "/admin/customers", icon: Users },
    { label: "Low Stock", value: lowStock, href: "/admin/products", icon: TriangleAlert },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="A quick look at the catalogue, orders, and customers you're managing from this browser."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="border border-hairline bg-paper p-6 transition-colors hover:border-ink"
            >
              <Icon className="h-5 w-5 text-graphite" strokeWidth={1.25} />
              <p className="mt-4 font-serif text-3xl text-ink">{stat.value}</p>
              <p className="label-luxury mt-1 text-graphite">{stat.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="border border-hairline bg-paper p-6 lg:col-span-2">
          <p className="label-luxury mb-5 text-ink">Recent Orders</p>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-graphite">No orders yet.</p>
          ) : (
            <div className="flex flex-col divide-y divide-hairline">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href="/admin/orders"
                  className="flex items-center justify-between gap-4 py-3 text-sm transition-colors hover:text-gold-dark"
                >
                  <span className="text-ink">{order.id}</span>
                  <span className="flex-1 truncate text-graphite">{order.customerName}</span>
                  <span className="capitalize text-graphite">{order.status}</span>
                  <span className="text-ink">{formatINR(order.total)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="border border-hairline bg-paper p-6">
          <p className="label-luxury mb-5 text-ink">Revenue (Paid Orders)</p>
          <p className="font-serif text-3xl text-ink">{formatINR(revenue)}</p>
          <p className="mt-4 text-xs text-graphite">
            {pendingOrders} order{pendingOrders === 1 ? "" : "s"} pending or in progress.
          </p>
        </div>
      </div>

      <p className="mt-10 max-w-2xl text-xs leading-relaxed text-graphite">
        This is a frontend-only build with no server or database — everything you add or edit across these admin
        screens is saved to this browser&apos;s local storage, not to a shared backend. It won&apos;t sync to
        another device or browser, and clearing this browser&apos;s site data will reset it back to the sample
        content it shipped with.
      </p>
    </div>
  );
}
