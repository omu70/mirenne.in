import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin-guard";
import { db } from "@/lib/server/db";
import { addEvent, getOrder, getOrderItems } from "@/lib/server/orders";
import {
  sendCancelledEmail,
  sendDeliveredEmail,
  sendOrderConfirmation,
  sendShippedEmail,
} from "@/lib/server/email";
import { MANUAL_STATUSES, ORDER_STATUS_LABEL, type OrderRow, type OrderStatus } from "@/lib/commerce/types";

type Body =
  | { action: "status"; status: OrderStatus; notify?: boolean }
  | { action: "ship"; courier: string; trackingNumber: string; trackingUrl?: string; notify?: boolean }
  | { action: "note"; note: string }
  | { action: "resend_confirmation" };

const str = (v: unknown, max = 500) => String(v ?? "").trim().slice(0, max);

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await ctx.params;
  const order = await getOrder(id);
  if (!order) return NextResponse.json({ error: "not_found", message: "Order not found." }, { status: 404 });

  const body = (await request.json().catch(() => null)) as Body | null;
  if (!body) return NextResponse.json({ error: "bad_request", message: "Expected a JSON body." }, { status: 400 });
  const sql = db();

  switch (body.action) {
    case "status": {
      if (!MANUAL_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: "bad_status", message: "That status can't be set by hand." }, { status: 400 });
      }
      if (order.payment_status !== "paid" && order.payment_status !== "partially_refunded" && body.status !== "cancelled") {
        return NextResponse.json(
          { error: "unpaid", message: "This order hasn't been paid, so it can only be cancelled." },
          { status: 409 }
        );
      }
      const [updated] = await sql<OrderRow[]>`
        update orders set status = ${body.status},
          delivered_at = ${body.status === "delivered" ? sql`now()` : sql`delivered_at`},
          updated_at = now()
        where id = ${id} returning *`;
      await addEvent(sql, id, "status", `Status changed from ${ORDER_STATUS_LABEL[order.status]} to ${ORDER_STATUS_LABEL[body.status]}.`);
      if (body.notify) {
        const sent =
          body.status === "delivered"
            ? await sendDeliveredEmail(updated)
            : body.status === "cancelled"
              ? await sendCancelledEmail(updated, updated.refunded_amount > 0)
              : false;
        if (sent) await addEvent(sql, id, "email", `${ORDER_STATUS_LABEL[body.status]} email sent to ${updated.customer_email}.`);
      }
      return NextResponse.json({ ok: true });
    }

    case "ship": {
      if (order.payment_status !== "paid" && order.payment_status !== "partially_refunded") {
        return NextResponse.json({ error: "unpaid", message: "Only paid orders can be shipped." }, { status: 409 });
      }
      const courier = str(body.courier, 80);
      const trackingNumber = str(body.trackingNumber, 80);
      const trackingUrl = str(body.trackingUrl, 500);
      if (!courier || !trackingNumber) {
        return NextResponse.json({ error: "bad_request", message: "Enter the courier and tracking number." }, { status: 400 });
      }
      if (trackingUrl && !/^https?:\/\//.test(trackingUrl)) {
        return NextResponse.json({ error: "bad_request", message: "The tracking link should start with https://" }, { status: 400 });
      }
      const [updated] = await sql<OrderRow[]>`
        update orders set courier = ${courier}, tracking_number = ${trackingNumber}, tracking_url = ${trackingUrl},
          status = case when status in ('delivered', 'returned') then status else 'shipped' end,
          shipped_at = coalesce(shipped_at, now()), updated_at = now()
        where id = ${id} returning *`;
      await addEvent(sql, id, "shipped", `Shipped with ${courier}, tracking ${trackingNumber}.`);
      if (body.notify !== false) {
        const sent = await sendShippedEmail(updated, await getOrderItems(id));
        await addEvent(sql, id, "email", sent ? `Shipping email sent to ${updated.customer_email}.` : "Shipping email not sent (email isn't configured or failed).");
      }
      return NextResponse.json({ ok: true });
    }

    case "note": {
      await sql`update orders set admin_note = ${str(body.note, 4000)}, updated_at = now() where id = ${id}`;
      return NextResponse.json({ ok: true });
    }

    case "resend_confirmation": {
      if (order.payment_status === "unpaid" || order.payment_status === "failed") {
        return NextResponse.json({ error: "unpaid", message: "This order hasn't been paid." }, { status: 409 });
      }
      const sent = await sendOrderConfirmation(order, await getOrderItems(id));
      if (!sent) return NextResponse.json({ error: "email_failed", message: "Email isn't configured, or the send failed." }, { status: 502 });
      await addEvent(sql, id, "email", `Confirmation email re-sent to ${order.customer_email}.`);
      return NextResponse.json({ ok: true });
    }
  }
  return NextResponse.json({ error: "bad_request", message: "Unknown action." }, { status: 400 });
}
