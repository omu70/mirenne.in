import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin-guard";
import { db } from "@/lib/server/db";
import { addEvent, getOrder } from "@/lib/server/orders";
import { razorpayRequest } from "@/lib/server/razorpay";
import { sendCancelledEmail } from "@/lib/server/email";
import { toPaise } from "@/lib/checkout/pricing";
import type { OrderRow } from "@/lib/commerce/types";

/**
 * Refunds through Razorpay's API — the money actually goes back, this isn't
 * just a label. Full or partial. Optionally cancels the order and emails the
 * customer in the same step.
 */
export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await ctx.params;
  const order = await getOrder(id);
  if (!order) return NextResponse.json({ error: "not_found", message: "Order not found." }, { status: 404 });
  if (!order.razorpay_payment_id || !["paid", "partially_refunded"].includes(order.payment_status)) {
    return NextResponse.json({ error: "not_refundable", message: "There's no captured payment on this order to refund." }, { status: 409 });
  }

  const body = (await request.json().catch(() => ({}))) as { amount?: number; cancel?: boolean; notify?: boolean };
  const remaining = order.total - order.refunded_amount;
  const amount = Math.floor(Number(body.amount ?? remaining));
  if (!Number.isFinite(amount) || amount < 1 || amount > remaining) {
    return NextResponse.json(
      { error: "bad_amount", message: `Refund between ₹1 and ₹${remaining.toLocaleString("en-IN")}.` },
      { status: 400 }
    );
  }

  const rzp = await razorpayRequest<{ id: string }>(`/payments/${order.razorpay_payment_id}/refund`, {
    amount: toPaise(amount),
    notes: { order_number: order.number },
  });
  if (!rzp.ok) return NextResponse.json({ error: "razorpay_error", message: `Razorpay refused the refund: ${rzp.error}` }, { status: 502 });

  const sql = db();
  const refunded = order.refunded_amount + amount;
  const [updated] = await sql<OrderRow[]>`
    update orders set refunded_amount = ${refunded},
      payment_status = ${refunded >= order.total ? "refunded" : "partially_refunded"},
      status = ${body.cancel ? "cancelled" : order.status},
      updated_at = now()
    where id = ${id} returning *`;
  await addEvent(sql, id, "refund", `Refund ${rzp.data.id} of ₹${amount.toLocaleString("en-IN")} issued via Razorpay.`);
  if (body.cancel) await addEvent(sql, id, "status", "Order cancelled.");
  if (body.cancel && body.notify) {
    if (await sendCancelledEmail(updated, true)) await addEvent(sql, id, "email", `Cancellation email sent to ${updated.customer_email}.`);
  }
  return NextResponse.json({ ok: true, refundId: rzp.data.id });
}
