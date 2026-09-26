import type postgres from "postgres";
import { db } from "@/lib/server/db";
import { sendNewOrderAlert, sendOrderConfirmation } from "@/lib/server/email";
import type { OrderEventRow, OrderItemRow, OrderRow } from "@/lib/commerce/types";

type Sql = postgres.Sql | postgres.TransactionSql;

export interface NewOrderInput {
  customer: { name: string; email: string; phone: string };
  shipping: { address: string; city: string; state: string; pincode: string; note: string };
  gift: { wrap: boolean; message: string };
  lines: {
    slug: string;
    name: string;
    color: string;
    size: string;
    customization: string;
    quantity: number;
    unitPrice: number;
  }[];
  totals: { subtotal: number; discount: number; shipping: number; total: number };
  couponCode: string | null;
}

export async function addEvent(sql: Sql, orderId: string, kind: string, message: string): Promise<void> {
  await sql`insert into order_events (order_id, kind, message) values (${orderId}, ${kind}, ${message})`;
}

/** Writes the order before payment starts, so an abandoned or interrupted payment still leaves a record. */
export async function createPendingOrder(input: NewOrderInput): Promise<OrderRow> {
  return db().begin(async (tx) => {
    const [order] = await tx<OrderRow[]>`
      insert into orders (
        customer_name, customer_email, customer_phone,
        ship_address, ship_city, ship_state, ship_pincode, delivery_note,
        gift_wrap, gift_message,
        subtotal, discount, shipping, total, coupon_code
      ) values (
        ${input.customer.name}, ${input.customer.email.toLowerCase()}, ${input.customer.phone},
        ${input.shipping.address}, ${input.shipping.city}, ${input.shipping.state}, ${input.shipping.pincode}, ${input.shipping.note},
        ${input.gift.wrap}, ${input.gift.message},
        ${input.totals.subtotal}, ${input.totals.discount}, ${input.totals.shipping}, ${input.totals.total}, ${input.couponCode}
      ) returning *`;
    for (const l of input.lines) {
      await tx`
        insert into order_items (order_id, product_slug, product_name, color, size, customization, quantity, unit_price)
        values (${order.id}, ${l.slug}, ${l.name}, ${l.color}, ${l.size}, ${l.customization}, ${l.quantity}, ${l.unitPrice})`;
    }
    await addEvent(tx, order.id, "created", "Checkout started — waiting for payment.");
    return order;
  });
}

export async function attachRazorpayOrder(orderId: string, razorpayOrderId: string): Promise<void> {
  await db()`update orders set razorpay_order_id = ${razorpayOrderId}, updated_at = now() where id = ${orderId}`;
}

export async function getOrderItems(orderId: string, sql: Sql = db()): Promise<OrderItemRow[]> {
  return sql<OrderItemRow[]>`select * from order_items where order_id = ${orderId} order by product_name`;
}

export async function getOrder(orderId: string): Promise<OrderRow | null> {
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) return null;
  const [order] = await db()<OrderRow[]>`select * from orders where id = ${orderId}`;
  return order ?? null;
}

export async function getOrderEvents(orderId: string): Promise<OrderEventRow[]> {
  return db()<OrderEventRow[]>`select id::text, kind, message, created_at from order_events where order_id = ${orderId} order by created_at desc, id desc`;
}

/** The customer's own view of an order: needs the order number *and* its secret token. */
export async function getOrderForCustomer(number: string, token: string): Promise<OrderRow | null> {
  if (!/^[0-9a-f]{32}$/.test(token)) return null;
  const [order] = await db()<OrderRow[]>`select * from orders where number = ${number} and public_token = ${token}`;
  return order ?? null;
}

/**
 * Marks an order paid. Safe to call more than once and from both the browser's
 * verify call and Razorpay's webhook: only the first call flips the status, and
 * only that call gets `newlyPaid: true` — so emails and coupon counts happen once.
 */
export async function markOrderPaid(
  razorpayOrderId: string,
  paymentId: string,
  source: "checkout" | "webhook"
): Promise<{ order: OrderRow | null; newlyPaid: boolean }> {
  return db().begin(async (tx) => {
    const [paid] = await tx<OrderRow[]>`
      update orders set
        payment_status = 'paid',
        status = case when status = 'pending_payment' then 'confirmed' else status end,
        razorpay_payment_id = ${paymentId},
        paid_at = now(),
        updated_at = now()
      where razorpay_order_id = ${razorpayOrderId} and payment_status in ('unpaid', 'failed')
      returning *`;

    if (!paid) {
      const [existing] = await tx<OrderRow[]>`select * from orders where razorpay_order_id = ${razorpayOrderId}`;
      return { order: existing ?? null, newlyPaid: false };
    }

    const [customer] = await tx<{ id: string }[]>`
      insert into customers (email, name, phone) values (${paid.customer_email}, ${paid.customer_name}, ${paid.customer_phone})
      on conflict (email) do update set name = excluded.name, phone = excluded.phone, updated_at = now()
      returning id`;
    await tx`update orders set customer_id = ${customer.id} where id = ${paid.id}`;
    paid.customer_id = customer.id;

    if (paid.coupon_code) {
      await tx`update coupons set used_count = used_count + 1 where code = ${paid.coupon_code}`;
    }
    await addEvent(
      tx,
      paid.id,
      "paid",
      `Payment ${paymentId} received${source === "webhook" ? " (confirmed by Razorpay webhook)" : ""}.`
    );
    return { order: paid, newlyPaid: true };
  });
}

export async function markPaymentFailed(razorpayOrderId: string, reason: string): Promise<void> {
  const sql = db();
  const [order] = await sql<OrderRow[]>`
    update orders set payment_status = 'failed', updated_at = now()
    where razorpay_order_id = ${razorpayOrderId} and payment_status = 'unpaid' returning *`;
  const [any] = order ? [order] : await sql<OrderRow[]>`select * from orders where razorpay_order_id = ${razorpayOrderId}`;
  if (any) await addEvent(sql, any.id, "payment_failed", `Payment attempt failed: ${reason}`);
}

/** Emails that go out once an order is paid. Logged on the order timeline. */
export async function notifyOrderPaid(order: OrderRow): Promise<void> {
  const items = await getOrderItems(order.id);
  const [confirmation, alert] = await Promise.all([sendOrderConfirmation(order, items), sendNewOrderAlert(order, items)]);
  const sql = db();
  await addEvent(
    sql,
    order.id,
    "email",
    confirmation ? `Confirmation email sent to ${order.customer_email}.` : "Confirmation email not sent (email isn't configured or failed)."
  );
  if (alert) await addEvent(sql, order.id, "email", "New-order alert sent to the studio.");
}
