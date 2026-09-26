import Link from "next/link";
import { connection } from "next/server";
import { IndianRupee, PackageCheck, ShoppingBag, Users, Clock, CalendarDays } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DbNotice } from "@/components/admin/commerce/db-notice";
import { OrderStatusBadge } from "@/components/admin/commerce/status-badge";
import { fmtDate } from "@/components/admin/commerce/format";
import { isDatabaseConfigured } from "@/lib/server/db";
import { dashboardStats } from "@/lib/server/admin-queries";
import { isEmailConfigured } from "@/lib/server/email";
import { razorpayKeys } from "@/lib/server/razorpay";
import { formatINR } from "@/lib/utils";

export default async function AdminDashboardPage() {
  await connection();
  if (!isDatabaseConfigured()) return <DbNotice title="Dashboard" />;
  const s = await dashboardStats();

  const setup = [
    { ok: Boolean(razorpayKeys()), label: "Razorpay keys" },
    { ok: Boolean(process.env.RAZORPAY_WEBHOOK_SECRET), label: "Razorpay webhook" },
    { ok: isEmailConfigured(), label: "Order emails (Resend)" },
    { ok: Boolean(process.env.ORDER_ALERT_EMAIL), label: "New-order alerts" },
  ].filter((x) => !x.ok);

  const stats = [
    { label: "Revenue (All Time)", value: formatINR(s.revenue), icon: IndianRupee, href: "/admin/orders" },
    { label: "This Month", value: formatINR(s.month_revenue), sub: `${s.month_orders} orders`, icon: CalendarDays, href: "/admin/orders" },
    { label: "To Dispatch", value: String(s.to_dispatch), icon: PackageCheck, href: "/admin/orders?status=to_dispatch" },
    { label: "Customers", value: String(s.customers), icon: Users, href: "/admin/customers" },
  ];

  return (
    <div>
      <AdminPageHeader title="Dashboard" description="Live figures from paid orders, net of refunds." />

      {setup.length > 0 && (
        <div className="mb-8 border border-gold/40 bg-gold/5 p-4 text-sm text-ink">
          Still to set up: {setup.map((x) => x.label).join(", ")}. See SETUP.md in the project.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href} className="border border-hairline bg-paper p-6 transition-colors hover:border-ink">
              <Icon className="h-5 w-5 text-graphite" strokeWidth={1.25} />
              <p className="mt-4 font-serif text-2xl text-ink md:text-3xl">{stat.value}</p>
              <p className="label-luxury mt-1 text-graphite">{stat.label}</p>
              {stat.sub && <p className="mt-1 text-xs text-graphite">{stat.sub}</p>}
            </Link>
          );
        })}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="border border-hairline bg-paper p-6 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <p className="label-luxury text-ink">Recent Orders</p>
            <Link href="/admin/orders" className="label-luxury text-graphite hover:text-ink">
              View All
            </Link>
          </div>
          {s.recent.length === 0 ? (
            <p className="text-sm text-graphite">No paid orders yet. They&apos;ll appear here the moment someone checks out.</p>
          ) : (
            <div className="flex flex-col divide-y divide-hairline">
              {s.recent.map((o) => (
                <Link
                  key={o.id}
                  href={`/admin/orders/${o.id}`}
                  className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 py-3 text-sm hover:text-gold-dark sm:grid-cols-[110px_1fr_auto_auto]"
                >
                  <span className="text-ink">{o.number}</span>
                  <span className="truncate text-graphite">{o.customer_name}</span>
                  <OrderStatusBadge status={o.status} />
                  <span className="text-right text-ink">{formatINR(o.total)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="border border-hairline bg-paper p-6">
            <p className="label-luxury mb-5 text-ink">Best Sellers</p>
            {s.topProducts.length === 0 ? (
              <p className="text-sm text-graphite">No sales yet.</p>
            ) : (
              <ul className="flex flex-col gap-3 text-sm">
                {s.topProducts.map((p) => (
                  <li key={p.product_name} className="flex justify-between gap-3">
                    <span className="text-ink">{p.product_name}</span>
                    <span className="shrink-0 text-graphite">
                      {p.units} sold · {formatINR(p.revenue)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Link
            href="/admin/orders?status=pending_payment"
            className="flex items-center gap-4 border border-hairline bg-paper p-6 transition-colors hover:border-ink"
          >
            <Clock className="h-5 w-5 text-graphite" strokeWidth={1.25} />
            <div>
              <p className="font-serif text-2xl text-ink">{s.abandoned}</p>
              <p className="label-luxury text-graphite">Unfinished Checkouts (7 Days)</p>
            </div>
          </Link>
          <div className="flex items-center gap-4 border border-hairline bg-paper p-6">
            <ShoppingBag className="h-5 w-5 text-graphite" strokeWidth={1.25} />
            <div>
              <p className="font-serif text-2xl text-ink">{s.paid_orders}</p>
              <p className="label-luxury text-graphite">Paid Orders (All Time)</p>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-8 text-xs text-graphite">Updated {fmtDate(new Date())}</p>
    </div>
  );
}
