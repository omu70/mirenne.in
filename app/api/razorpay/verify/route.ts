import { createHmac, timingSafeEqual } from "node:crypto";
import { after, NextResponse } from "next/server";
import { markOrderPaid, notifyOrderPaid } from "@/lib/server/orders";

/**
 * Confirms a payment the browser reports as successful. The signature is an
 * HMAC of "<order_id>|<payment_id>" keyed with the secret only this server
 * holds, so a client can't forge one. Once it checks out the order is marked
 * paid in the database. If the shopper closes the tab before this runs, the
 * Razorpay webhook (app/api/razorpay/webhook) marks it paid instead.
 */
export async function POST(request: Request) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return NextResponse.json({ error: "payments_not_configured", message: "RAZORPAY_KEY_SECRET is not set." }, { status: 503 });
  }

  let body: { razorpay_order_id?: string; razorpay_payment_id?: string; razorpay_signature?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request", message: "Expected a JSON body." }, { status: 400 });
  }
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = body;
  if (!orderId || !paymentId || !signature) {
    return NextResponse.json({ error: "bad_request", message: "Missing order id, payment id or signature." }, { status: 400 });
  }

  const expected = createHmac("sha256", keySecret).update(`${orderId}|${paymentId}`).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (!(a.length === b.length && timingSafeEqual(a, b))) {
    console.warn("[razorpay] signature mismatch for order", orderId);
    return NextResponse.json({ error: "invalid_signature", message: "This payment couldn't be verified." }, { status: 400 });
  }

  const { order, newlyPaid } = await markOrderPaid(orderId, paymentId, "checkout");
  if (!order) {
    console.error("[razorpay] verified payment for unknown order", orderId, paymentId);
    return NextResponse.json(
      { error: "order_not_found", message: "Payment received, but we couldn't find the order. Please contact the studio." },
      { status: 404 }
    );
  }
  if (newlyPaid) after(() => notifyOrderPaid(order));

  return NextResponse.json({ verified: true, orderNumber: order.number, orderToken: order.public_token });
}
