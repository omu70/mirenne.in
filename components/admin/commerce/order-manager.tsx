"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, ExternalLink, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OrderStatusBadge, PaymentBadge } from "@/components/admin/commerce/status-badge";
import { fmtDate } from "@/components/admin/commerce/format";
import { formatINR } from "@/lib/utils";
import {
  MANUAL_STATUSES,
  ORDER_STATUS_LABEL,
  type OrderEventRow,
  type OrderItemRow,
  type OrderRow,
  type OrderStatus,
} from "@/lib/commerce/types";

const COURIERS = ["Delhivery", "Blue Dart", "DTDC", "Shiprocket", "India Post", "Xpressbees", "Ekart", "Other"];

async function call(url: string, method: string, body: unknown): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, message: data.message };
  } catch {
    return { ok: false, message: "Couldn't reach the server." };
  }
}

export function OrderManager({ order, items, events }: { order: OrderRow; items: OrderItemRow[]; events: OrderEventRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const paid = order.payment_status === "paid" || order.payment_status === "partially_refunded";
  const refundable = order.total - order.refunded_amount;

  const run = async (url: string, method: string, body: unknown, success: string) => {
    setBusy(true);
    const r = await call(url, method, body);
    setBusy(false);
    if (r.ok) {
      toast.success(success);
      router.refresh();
    } else toast.error(r.message ?? "That didn't work.");
    return r.ok;
  };

  // --- status -----------------------------------------------------------------
  const [nextStatus, setNextStatus] = React.useState<OrderStatus | "">("");
  const [notifyStatus, setNotifyStatus] = React.useState(true);

  // --- shipping ---------------------------------------------------------------
  const [courier, setCourier] = React.useState(order.courier || "Delhivery");
  const [awb, setAwb] = React.useState(order.tracking_number);
  const [trackUrl, setTrackUrl] = React.useState(order.tracking_url);
  const [notifyShip, setNotifyShip] = React.useState(!order.shipped_at);

  // --- refund / note ----------------------------------------------------------
  const [refundAmount, setRefundAmount] = React.useState(String(refundable));
  const [cancelOnRefund, setCancelOnRefund] = React.useState(true);
  const [note, setNote] = React.useState(order.admin_note);

  const address = `${order.customer_name}\n${order.ship_address}\n${order.ship_city}, ${order.ship_state} ${order.ship_pincode}\nPhone: ${order.customer_phone}`;
  const whatsapp = `https://wa.me/91${order.customer_phone.replace(/\D/g, "").slice(-10)}`;

  return (
    <div>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl text-ink">{order.number}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-3 text-sm text-graphite">
            {fmtDate(order.created_at)} <OrderStatusBadge status={order.status} /> <PaymentBadge status={order.payment_status} />
          </p>
        </div>
        <Button asChild variant="secondary" size="sm">
          <Link href={`/admin/orders/${order.id}/slip`} target="_blank">
            <Printer className="mr-2 h-3.5 w-3.5" strokeWidth={1.5} /> Packing Slip
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-6">
          {/* Items */}
          <section className="border border-hairline bg-paper p-6">
            <p className="label-luxury mb-4 text-ink">Items</p>
            <div className="flex flex-col divide-y divide-hairline border-y border-hairline">
              {items.map((i) => (
                <div key={i.id} className="flex justify-between gap-4 py-3 text-sm">
                  <div>
                    <p className="text-ink">{i.product_name}</p>
                    <p className="text-xs text-graphite">
                      {[i.color, i.size, `Qty ${i.quantity}`, `${formatINR(i.unit_price)} each`].filter(Boolean).join(" · ")}
                    </p>
                    {i.customization && <p className="mt-1 whitespace-pre-line text-xs text-gold-dark">{i.customization}</p>}
                  </div>
                  <p className="shrink-0 text-ink">{formatINR(i.unit_price * i.quantity)}</p>
                </div>
              ))}
            </div>
            <dl className="mt-4 flex flex-col gap-1.5 text-sm">
              <Line label="Subtotal" value={formatINR(order.subtotal)} />
              {order.discount > 0 && <Line label={`Discount (${order.coupon_code})`} value={`−${formatINR(order.discount)}`} />}
              <Line label="Shipping" value={order.shipping === 0 ? "Free" : formatINR(order.shipping)} />
              <Line label="Total" value={formatINR(order.total)} strong />
              {order.refunded_amount > 0 && <Line label="Refunded" value={`−${formatINR(order.refunded_amount)}`} />}
            </dl>
            {(order.gift_wrap || order.gift_message || order.delivery_note) && (
              <div className="mt-5 border-t border-hairline pt-4 text-sm text-ink">
                {order.gift_wrap && <p>🎁 Gift wrap requested</p>}
                {order.gift_message && <p className="mt-1">Gift message: “{order.gift_message}”</p>}
                {order.delivery_note && <p className="mt-1">Delivery note: {order.delivery_note}</p>}
              </div>
            )}
          </section>

          {/* Shipping */}
          <section className="border border-hairline bg-paper p-6">
            <p className="label-luxury mb-1 text-ink">Shipping</p>
            <p className="mb-5 text-xs text-graphite">
              Book the pickup with your courier (or Shiprocket), then enter the AWB here. The order moves to Shipped and the
              customer gets an email with the tracking link.
            </p>
            {!paid ? (
              <p className="text-sm text-graphite">Available once the order is paid.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="mb-2 block">Courier</Label>
                  <Select value={courier} onValueChange={setCourier}>
                    <SelectTrigger className="normal-case tracking-normal">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COURIERS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-2 block">Tracking / AWB Number</Label>
                  <Input value={awb} onChange={(e) => setAwb(e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <Label className="mb-2 block">Tracking Link</Label>
                  <Input value={trackUrl} onChange={(e) => setTrackUrl(e.target.value)} placeholder="Paste the courier's tracking page link (optional)" />
                </div>
                <label className="flex items-center gap-2 text-sm text-ink sm:col-span-2">
                  <input type="checkbox" checked={notifyShip} onChange={(e) => setNotifyShip(e.target.checked)} />
                  Email the customer their tracking details
                </label>
                <div className="sm:col-span-2">
                  <Button
                    variant="primary"
                    size="md"
                    disabled={busy || !awb.trim()}
                    onClick={() =>
                      run(
                        `/api/admin/orders/${order.id}`,
                        "PATCH",
                        { action: "ship", courier, trackingNumber: awb, trackingUrl: trackUrl, notify: notifyShip },
                        order.shipped_at ? "Tracking updated." : "Marked as shipped."
                      )
                    }
                  >
                    {order.shipped_at ? "Update Tracking" : "Mark As Shipped"}
                  </Button>
                  {order.shipped_at && <span className="ml-3 text-xs text-graphite">Shipped {fmtDate(order.shipped_at)}</span>}
                </div>
              </div>
            )}
          </section>

          {/* Timeline */}
          <section className="border border-hairline bg-paper p-6">
            <p className="label-luxury mb-4 text-ink">Timeline</p>
            <ol className="flex flex-col gap-3">
              {events.map((e) => (
                <li key={e.id} className="grid grid-cols-[150px_1fr] gap-3 text-sm">
                  <span className="text-xs text-graphite">{fmtDate(e.created_at)}</span>
                  <span className="text-ink">{e.message}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="flex flex-col gap-6">
          {/* Customer */}
          <section className="border border-hairline bg-paper p-6 text-sm">
            <p className="label-luxury mb-4 text-ink">Customer</p>
            {order.customer_id ? (
              <Link href={`/admin/customers/${order.customer_id}`} className="text-ink underline-offset-4 hover:underline">
                {order.customer_name}
              </Link>
            ) : (
              <p className="text-ink">{order.customer_name}</p>
            )}
            <p className="mt-1">
              <a href={`mailto:${order.customer_email}`} className="text-graphite hover:text-ink">
                {order.customer_email}
              </a>
            </p>
            <p className="mt-1 flex gap-3">
              <a href={`tel:${order.customer_phone}`} className="text-graphite hover:text-ink">
                {order.customer_phone}
              </a>
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="text-gold-dark hover:underline">
                WhatsApp
              </a>
            </p>
            <p className="label-luxury mb-2 mt-5 text-graphite">Ship To</p>
            <p className="whitespace-pre-line text-ink">{address}</p>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(address).then(() => toast.success("Address copied."))}
              className="mt-2 flex cursor-pointer items-center gap-1.5 text-xs text-graphite hover:text-ink"
            >
              <Copy className="h-3 w-3" strokeWidth={1.5} /> Copy address
            </button>
          </section>

          {/* Status */}
          <section className="border border-hairline bg-paper p-6">
            <p className="label-luxury mb-4 text-ink">Update Status</p>
            <Select value={nextStatus} onValueChange={(v) => setNextStatus(v as OrderStatus)}>
              <SelectTrigger className="normal-case tracking-normal">
                <SelectValue placeholder={ORDER_STATUS_LABEL[order.status]} />
              </SelectTrigger>
              <SelectContent>
                {MANUAL_STATUSES.filter((s) => s !== order.status && (paid || s === "cancelled")).map((s) => (
                  <SelectItem key={s} value={s}>
                    {ORDER_STATUS_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(nextStatus === "delivered" || nextStatus === "cancelled") && (
              <label className="mt-3 flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" checked={notifyStatus} onChange={(e) => setNotifyStatus(e.target.checked)} />
                Email the customer
              </label>
            )}
            {nextStatus === "cancelled" && paid && (
              <p className="mt-2 text-xs text-gold-dark">Cancelling doesn&apos;t refund. Use Refund below to send the money back.</p>
            )}
            <Button
              variant="secondary"
              size="sm"
              className="mt-4"
              disabled={busy || !nextStatus}
              onClick={async () => {
                if (await run(`/api/admin/orders/${order.id}`, "PATCH", { action: "status", status: nextStatus, notify: notifyStatus }, "Status updated.")) setNextStatus("");
              }}
            >
              Save Status
            </Button>
          </section>

          {/* Payment */}
          <section className="border border-hairline bg-paper p-6 text-sm">
            <p className="label-luxury mb-4 text-ink">Payment</p>
            <Line label="Status" value={<PaymentBadge status={order.payment_status} />} />
            <Line label="Paid" value={fmtDate(order.paid_at)} />
            {order.razorpay_payment_id && (
              <Line
                label="Razorpay"
                value={
                  <a
                    href={`https://dashboard.razorpay.com/app/payments/${order.razorpay_payment_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-graphite hover:text-ink"
                  >
                    {order.razorpay_payment_id} <ExternalLink className="h-3 w-3" />
                  </a>
                }
              />
            )}
            {paid && refundable > 0 && (
              <div className="mt-5 border-t border-hairline pt-5">
                <Label className="mb-2 block">Refund Amount (₹)</Label>
                <Input inputMode="numeric" value={refundAmount} onChange={(e) => setRefundAmount(e.target.value.replace(/\D/g, ""))} />
                <label className="mt-3 flex items-center gap-2 text-ink">
                  <input type="checkbox" checked={cancelOnRefund} onChange={(e) => setCancelOnRefund(e.target.checked)} />
                  Also cancel the order and email the customer
                </label>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-4"
                  disabled={busy || !refundAmount}
                  onClick={() => {
                    if (!window.confirm(`Refund ${formatINR(Number(refundAmount))} to the customer through Razorpay? This can't be undone.`)) return;
                    run(
                      `/api/admin/orders/${order.id}/refund`,
                      "POST",
                      { amount: Number(refundAmount), cancel: cancelOnRefund, notify: cancelOnRefund },
                      "Refund issued."
                    );
                  }}
                >
                  Refund Via Razorpay
                </Button>
              </div>
            )}
            {paid && (
              <button
                type="button"
                disabled={busy}
                onClick={() => run(`/api/admin/orders/${order.id}`, "PATCH", { action: "resend_confirmation" }, "Confirmation email sent.")}
                className="mt-5 block cursor-pointer text-xs text-graphite underline hover:text-ink"
              >
                Re-send confirmation email
              </button>
            )}
          </section>

          {/* Note */}
          <section className="border border-hairline bg-paper p-6">
            <p className="label-luxury mb-1 text-ink">Internal Note</p>
            <p className="mb-3 text-xs text-graphite">Only visible here — measurements, karigar notes, promised dates.</p>
            <Textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} />
            <Button
              variant="secondary"
              size="sm"
              className="mt-3"
              disabled={busy || note === order.admin_note}
              onClick={() => run(`/api/admin/orders/${order.id}`, "PATCH", { action: "note", note }, "Note saved.")}
            >
              Save Note
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}

function Line({ label, value, strong }: { label: string; value: React.ReactNode; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 ${strong ? "border-t border-hairline pt-2 text-base text-ink" : ""}`}>
      <dt className="text-graphite">{label}</dt>
      <dd className="text-right text-ink">{value}</dd>
    </div>
  );
}
