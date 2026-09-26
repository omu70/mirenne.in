import { createHmac, timingSafeEqual } from "node:crypto";
import { after, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { addEvent, markOrderPaid, markPaymentFailed, notifyOrderPaid } from "@/lib/server/orders";

/**
 * Razorpay → server notifications. This is the safety net: if a shopper pays
 * and closes the tab before the browser's verify call lands, this still marks
 * the order paid. Set it up in Razorpay → Settings → Webhooks with the URL
 * https://<your-domain>/api/razorpay/webhook, the events payment.captured,
 * payment.failed and refund.processed, and a secret copied into
 * RAZORPAY_WEBHOOK_SECRET.
 */

interface PaymentEntity {
  id: string;
  order_id: string;
  error_description?: string;
}
interface RefundEntity {
  id: string;
  payment_id: string;
  amount: number;
}

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "webhook_not_configured" }, { status: 503 });

  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  const expected = createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (!(a.length === b.length && timingSafeEqual(a, b))) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  let event: { event?: string; payload?: { payment?: { entity?: PaymentEntity }; refund?: { entity?: RefundEntity } } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const payment = event.payload?.payment?.entity;

  switch (event.event) {
    case "payment.captured":
    case "order.paid": {
      if (!payment?.order_id) break;
      const { order, newlyPaid } = await markOrderPaid(payment.order_id, payment.id, "webhook");
      if (order && newlyPaid) after(() => notifyOrderPaid(order));
      break;
    }
    case "payment.failed": {
      if (payment?.order_id) await markPaymentFailed(payment.order_id, payment.error_description ?? "declined");
      break;
    }
    case "refund.processed": {
      const refund = event.payload?.refund?.entity;
      if (!refund) break;
      const sql = db();
      const rupees = Math.round(refund.amount / 100);
      const [order] = await sql<{ id: string; total: number; refunded_amount: number }[]>`
        select id, total, refunded_amount from orders where razorpay_payment_id = ${refund.payment_id}`;
      if (!order) break;
      // Refunds started from the admin are already counted; only record ones made elsewhere.
      const [seen] = await sql`select 1 from order_events where order_id = ${order.id} and message like ${`%${refund.id}%`}`;
      if (seen) break;
      const refunded = Math.min(order.total, order.refunded_amount + rupees);
      await sql`
        update orders set refunded_amount = ${refunded},
          payment_status = ${refunded >= order.total ? "refunded" : "partially_refunded"}, updated_at = now()
        where id = ${order.id}`;
      await addEvent(sql, order.id, "refund", `Refund ${refund.id} of ₹${rupees.toLocaleString("en-IN")} processed by Razorpay.`);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
