import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";
import { DbNotice } from "@/components/admin/commerce/db-notice";
import { CustomerNote } from "@/components/admin/commerce/customer-note";
import { OrderStatusBadge, PaymentBadge } from "@/components/admin/commerce/status-badge";
import { fmtDate } from "@/components/admin/commerce/format";
import { isDatabaseConfigured } from "@/lib/server/db";
import { getCustomer } from "@/lib/server/admin-queries";
import { formatINR } from "@/lib/utils";

export default async function AdminCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  if (!isDatabaseConfigured()) return <DbNotice title="Customer" />;
  const { id } = await params;
  const data = await getCustomer(id);
  if (!data) notFound();
  const { customer, orders, address } = data;
  const paidOrders = orders.filter((o) => ["paid", "partially_refunded", "refunded"].includes(o.payment_status));
  const spent = paidOrders.reduce((n, o) => n + o.total - o.refunded_amount, 0);
  const whatsapp = `https://wa.me/91${customer.phone.replace(/\D/g, "").slice(-10)}`;

  return (
    <div>
      <Link href="/admin/customers" className="label-luxury mb-6 inline-flex items-center gap-2 text-graphite hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} /> Customers
      </Link>
      <h1 className="font-serif text-3xl text-ink">{customer.name || customer.email}</h1>
      <p className="mt-2 text-sm text-graphite">Customer since {fmtDate(customer.created_at, false)}</p>

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        <section className="border border-hairline bg-paper p-6">
          <p className="label-luxury mb-4 text-ink">Orders ({orders.length})</p>
          <div className="flex flex-col divide-y divide-hairline">
            {orders.map((o) => (
              <Link
                key={o.id}
                href={`/admin/orders/${o.id}`}
                className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 py-3 text-sm hover:text-gold-dark sm:grid-cols-[110px_1fr_auto_auto_auto]"
              >
                <span className="text-ink">{o.number}</span>
                <span className="text-graphite">{fmtDate(o.created_at, false)}</span>
                <PaymentBadge status={o.payment_status} />
                <OrderStatusBadge status={o.status} />
                <span className="text-right text-ink">{formatINR(o.total)}</span>
              </Link>
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-6">
          <section className="border border-hairline bg-paper p-6 text-sm">
            <p className="label-luxury mb-4 text-ink">Contact</p>
            <p>
              <a href={`mailto:${customer.email}`} className="text-ink hover:underline">
                {customer.email}
              </a>
            </p>
            <p className="mt-1 flex gap-3">
              <a href={`tel:${customer.phone}`} className="text-graphite hover:text-ink">
                {customer.phone}
              </a>
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="text-gold-dark hover:underline">
                WhatsApp
              </a>
            </p>
            {address && (
              <>
                <p className="label-luxury mb-2 mt-5 text-graphite">Last Address</p>
                <p className="whitespace-pre-line text-ink">
                  {address.ship_address}
                  {"\n"}
                  {address.ship_city}, {address.ship_state} {address.ship_pincode}
                </p>
              </>
            )}
            <div className="mt-5 flex justify-between border-t border-hairline pt-4">
              <span className="text-graphite">Lifetime spend</span>
              <span className="text-ink">{formatINR(spent)}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-graphite">Paid orders</span>
              <span className="text-ink">{paidOrders.length}</span>
            </div>
          </section>
          <CustomerNote id={customer.id} initial={customer.admin_note} />
        </div>
      </div>
    </div>
  );
}
