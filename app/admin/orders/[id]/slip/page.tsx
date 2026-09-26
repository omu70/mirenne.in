import { notFound } from "next/navigation";
import { connection } from "next/server";
import { PrintButton } from "@/components/admin/commerce/print-button";
import { isDatabaseConfigured } from "@/lib/server/db";
import { getOrder, getOrderItems } from "@/lib/server/orders";
import { fmtDate } from "@/components/admin/commerce/format";
import { formatINR } from "@/lib/utils";

/** Printable packing slip to go in the parcel (and a shipping label block to cut out). */
export default async function PackingSlipPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  if (!isDatabaseConfigured()) notFound();
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();
  const items = await getOrderItems(id);

  return (
    <div className="mx-auto max-w-2xl bg-white p-10 text-sm text-ink print:p-0">
      <div className="mb-8 flex items-start justify-between print:hidden">
        <p className="text-graphite">Packing slip for {order.number}</p>
        <PrintButton />
      </div>

      <div className="border border-ink p-6">
        <p className="label-luxury text-graphite">Ship To</p>
        <p className="mt-2 text-lg">{order.customer_name}</p>
        <p className="whitespace-pre-line">{order.ship_address}</p>
        <p>
          {order.ship_city}, {order.ship_state} — {order.ship_pincode}
        </p>
        <p className="mt-1">Phone: {order.customer_phone}</p>
        <p className="mt-4 text-xs text-graphite">
          Order {order.number} · {order.courier ? `${order.courier} ${order.tracking_number}` : "Prepaid"}
        </p>
      </div>

      <div className="mt-10">
        <p className="font-serif text-2xl tracking-[0.3em]">MIRENNE</p>
        <p className="mt-1 text-graphite">
          Order {order.number} · {fmtDate(order.created_at, false)}
        </p>

        <table className="mt-6 w-full border-collapse">
          <thead>
            <tr className="border-b border-ink text-left">
              <th className="py-2 font-normal">Piece</th>
              <th className="py-2 font-normal">Colour / Size</th>
              <th className="py-2 text-right font-normal">Qty</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-b border-hairline align-top">
                <td className="py-2">
                  {i.product_name}
                  {i.customization && <p className="whitespace-pre-line text-xs text-graphite">{i.customization}</p>}
                </td>
                <td className="py-2">{[i.color, i.size].filter(Boolean).join(" / ")}</td>
                <td className="py-2 text-right">{i.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Gifts leave the price off the slip. */}
        {!order.gift_wrap && !order.gift_message && <p className="mt-4 text-right">Total paid: {formatINR(order.total)}</p>}
        {order.gift_message && <p className="mt-6 border border-hairline p-4 italic">“{order.gift_message}”</p>}
        <p className="mt-10 text-center text-xs text-graphite">Thank you for choosing Mirenne — made for you, by hand.</p>
      </div>
    </div>
  );
}
