import Link from "next/link";
import { connection } from "next/server";
import { Download } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DbNotice } from "@/components/admin/commerce/db-notice";
import { SearchBox } from "@/components/admin/commerce/search-box";
import { OrderStatusBadge, PaymentBadge } from "@/components/admin/commerce/status-badge";
import { fmtDate } from "@/components/admin/commerce/format";
import { isDatabaseConfigured } from "@/lib/server/db";
import { listOrders, type OrderFilter } from "@/lib/server/admin-queries";
import type { OrderStatus } from "@/lib/commerce/types";
import { cn, formatINR } from "@/lib/utils";

const TABS: { value: OrderFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "to_dispatch", label: "To Dispatch" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "returned", label: "Returned" },
  { value: "pending_payment", label: "Unfinished Checkouts" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  await connection();
  if (!isDatabaseConfigured()) return <DbNotice title="Orders" />;

  const sp = await searchParams;
  const filter = (TABS.some((t) => t.value === sp.status) ? sp.status : "all") as OrderFilter;
  const page = Math.max(1, Number(sp.page) || 1);
  const q = sp.q ?? "";
  const { rows, count, pages, counts } = await listOrders(filter, q, page);

  const tabCount = (t: OrderFilter) =>
    t === "all"
      ? Object.entries(counts).reduce((n, [k, v]) => (k === "pending_payment" ? n : n + (v ?? 0)), 0)
      : t === "to_dispatch"
        ? (counts.confirmed ?? 0) + (counts.in_production ?? 0)
        : (counts[t as OrderStatus] ?? 0);

  const href = (p: Record<string, string | number | undefined>) => {
    const u = new URLSearchParams();
    const merged = { status: filter, q, page: 1, ...p };
    if (merged.status && merged.status !== "all") u.set("status", String(merged.status));
    if (merged.q) u.set("q", String(merged.q));
    if (Number(merged.page) > 1) u.set("page", String(merged.page));
    const s = u.toString();
    return `/admin/orders${s ? `?${s}` : ""}`;
  };

  return (
    <div>
      <AdminPageHeader
        title="Orders"
        description="Every order placed on the site. Open one to update its status, add tracking, refund or add notes."
        action={
          <a
            href={`/api/admin/orders/export?status=${filter}`}
            className="label-luxury flex items-center gap-2 text-graphite hover:text-ink"
          >
            <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
            Export CSV
          </a>
        }
      />

      <div className="mb-5 flex gap-1 overflow-x-auto border-b border-hairline">
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={href({ status: t.value, page: 1 })}
            className={cn(
              "shrink-0 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm transition-colors",
              filter === t.value ? "border-ink text-ink" : "border-transparent text-graphite hover:text-ink"
            )}
          >
            {t.label} <span className="text-xs text-graphite">({tabCount(t.value)})</span>
          </Link>
        ))}
      </div>

      <div className="mb-5">
        <SearchBox placeholder="Search order no., name, email, phone, AWB" />
      </div>

      {filter === "pending_payment" && (
        <p className="mb-5 max-w-2xl text-xs leading-relaxed text-graphite">
          Shoppers who filled in checkout but didn&apos;t finish paying. Useful for a follow-up call or WhatsApp — nothing
          has been charged.
        </p>
      )}

      {rows.length === 0 ? (
        <p className="py-16 text-center text-sm text-graphite">
          {q ? `No orders match “${q}”.` : "No orders here yet."}
        </p>
      ) : (
        <div className="overflow-x-auto border border-hairline">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-hairline bg-paper text-left">
                {["Order", "Date", "Customer", "Ship To", "Items", "Total", "Payment", "Status"].map((h) => (
                  <th key={h} className="label-luxury px-4 py-3 font-normal text-graphite">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id} className="border-b border-hairline last:border-b-0 hover:bg-paper/60">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="text-ink underline-offset-4 hover:underline">
                      {o.number}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-graphite">{fmtDate(o.created_at)}</td>
                  <td className="px-4 py-3">
                    <p className="text-ink">{o.customer_name}</p>
                    <p className="text-xs text-graphite">{o.customer_phone}</p>
                  </td>
                  <td className="px-4 py-3 text-graphite">
                    {o.ship_city}, {o.ship_state}
                  </td>
                  <td className="px-4 py-3 text-graphite">{o.item_count}</td>
                  <td className="px-4 py-3 text-ink">{formatINR(o.total)}</td>
                  <td className="px-4 py-3">
                    <PaymentBadge status={o.payment_status} />
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm text-graphite">
          <span>
            {count} orders · page {page} of {pages}
          </span>
          <div className="flex gap-4">
            {page > 1 && <Link href={href({ page: page - 1 })}>← Previous</Link>}
            {page < pages && <Link href={href({ page: page + 1 })}>Next →</Link>}
          </div>
        </div>
      )}
    </div>
  );
}
