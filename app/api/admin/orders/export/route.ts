import { requireAdmin } from "@/lib/server/admin-guard";
import { db } from "@/lib/server/db";

/** CSV of orders (one row per item) for accounts, GST filing or a spreadsheet. */
export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const status = new URL(request.url).searchParams.get("status");
  const sql = db();
  const rows = await sql`
    select o.number, o.created_at, o.paid_at, o.status, o.payment_status, o.customer_name, o.customer_email,
      o.customer_phone, o.ship_address, o.ship_city, o.ship_state, o.ship_pincode, o.coupon_code, o.subtotal,
      o.discount, o.shipping, o.total, o.refunded_amount, o.razorpay_payment_id, o.courier, o.tracking_number,
      i.product_name, i.color, i.size, i.quantity, i.unit_price, i.customization
    from orders o join order_items i on i.order_id = o.id
    where ${status && status !== "all" ? sql`o.status = ${status}` : sql`true`}
    order by o.created_at desc, i.product_name`;

  const cols = [
    "number", "created_at", "paid_at", "status", "payment_status", "customer_name", "customer_email", "customer_phone",
    "ship_address", "ship_city", "ship_state", "ship_pincode", "coupon_code", "subtotal", "discount", "shipping", "total",
    "refunded_amount", "razorpay_payment_id", "courier", "tracking_number", "product_name", "color", "size", "quantity",
    "unit_price", "customization",
  ];
  const cell = (v: unknown) => {
    const s = v instanceof Date ? v.toISOString() : v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="mirenne-orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
