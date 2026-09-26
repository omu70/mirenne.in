import { NextResponse } from "next/server";
import { getOrderForCustomer, getOrderItems } from "@/lib/server/orders";
import { isDatabaseConfigured } from "@/lib/server/db";

/**
 * The customer's order page (the link in their confirmation email). Needs both
 * the order number and the order's random token, so order numbers — which are
 * sequential and guessable — can't be used to read someone else's details.
 */
export async function GET(request: Request) {
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "unavailable" }, { status: 503 });
  const url = new URL(request.url);
  const order = await getOrderForCustomer(url.searchParams.get("order") ?? "", url.searchParams.get("t") ?? "");
  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const items = await getOrderItems(order.id);

  return NextResponse.json({
    number: order.number,
    status: order.status,
    paymentStatus: order.payment_status,
    placedAt: order.created_at,
    name: order.customer_name,
    city: `${order.ship_city}, ${order.ship_state}`,
    subtotal: order.subtotal,
    discount: order.discount,
    couponCode: order.coupon_code,
    shipping: order.shipping,
    total: order.total,
    courier: order.courier,
    trackingNumber: order.tracking_number,
    trackingUrl: order.tracking_url,
    items: items.map((i) => ({
      name: i.product_name,
      slug: i.product_slug,
      color: i.color,
      size: i.size,
      quantity: i.quantity,
      price: i.unit_price,
    })),
  });
}
