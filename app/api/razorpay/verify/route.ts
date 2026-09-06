import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

/**
 * Confirms that a payment the browser reports as successful really was.
 *
 * The Razorpay modal hands the browser an order id, a payment id and a
 * signature. The signature is an HMAC-SHA256 of "<order_id>|<payment_id>"
 * keyed with the secret, which only this server holds — so a client cannot
 * forge one, and a "payment succeeded" callback is worth nothing until it has
 * been checked here.
 *
 * What this does NOT do, and what a real storefront needs before taking money:
 * persist the order server-side and reconcile it against Razorpay's webhooks.
 * With no database, an order confirmed here is written to the shopper's own
 * browser storage; if they close the tab mid-payment, the money moves and the
 * shop has no record of it. Treat this as a correct payment handshake on top
 * of storage that isn't ready for real orders.
 */

export async function POST(request: Request) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return NextResponse.json(
      { error: "payments_not_configured", message: "RAZORPAY_KEY_SECRET is not set on this deployment." },
      { status: 503 }
    );
  }

  let body: { razorpay_order_id?: string; razorpay_payment_id?: string; razorpay_signature?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request", message: "Expected a JSON body." }, { status: 400 });
  }

  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = body;

  if (!orderId || !paymentId || !signature) {
    return NextResponse.json(
      { error: "bad_request", message: "Missing order id, payment id or signature." },
      { status: 400 }
    );
  }

  const expected = createHmac("sha256", keySecret).update(`${orderId}|${paymentId}`).digest("hex");

  // Compare in constant time. A plain === leaks how much of the signature was
  // correct through timing, which is enough to forge one given enough attempts.
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  const valid = a.length === b.length && timingSafeEqual(a, b);

  if (!valid) {
    console.warn("[razorpay] signature mismatch for order", orderId);
    return NextResponse.json(
      { error: "invalid_signature", message: "This payment couldn't be verified." },
      { status: 400 }
    );
  }

  return NextResponse.json({ verified: true, orderId, paymentId });
}
