import { NextResponse } from "next/server";
import { products } from "@/lib/data/products";
import { computeTotals, lineSubtotal, toPaise, type CheckoutLine } from "@/lib/checkout/pricing";

/**
 * Creates the Razorpay order the browser then pays against.
 *
 * The browser sends only WHAT is being bought — slug, colour, size, quantity —
 * never the price or the total. Prices are looked up here, in the catalogue
 * committed to the repo, and the amount is recomputed from scratch. Anything
 * else and a customer could edit the request in devtools and buy a ₹52,000
 * gown for ₹1.
 *
 * The consequence is worth stating plainly: only pieces that exist in
 * lib/data/products.ts can be sold. A product added in /admin/products lives
 * in one browser's local storage and the server has never heard of it, so it
 * is rejected here rather than being quietly charged at whatever price the
 * client claimed. To make a piece purchasable, it has to be committed.
 */

const RAZORPAY_ORDERS_URL = "https://api.razorpay.com/v1/orders";

interface OrderRequestBody {
  lines?: CheckoutLine[];
  promoCode?: string | null;
  customer?: { name?: string; email?: string; phone?: string };
}

function orderReceipt(): string {
  // Short, human-quotable, and unique enough for a receipt field that Razorpay
  // caps at 40 characters: MRN- plus a base-36 timestamp and a random tail.
  return `MRN-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export async function POST(request: Request) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    // A deliberate, readable failure. Without it the fetch below returns a
    // Razorpay auth error and the shopper sees "payment failed" for what is
    // actually a missing line in .env.local.
    return NextResponse.json(
      {
        error: "payments_not_configured",
        message:
          "Payments aren't configured on this deployment. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.local and restart the server.",
      },
      { status: 503 }
    );
  }

  let body: OrderRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request", message: "Expected a JSON body." }, { status: 400 });
  }

  const lines = body.lines ?? [];
  if (lines.length === 0) {
    return NextResponse.json({ error: "empty_cart", message: "There's nothing in the bag." }, { status: 400 });
  }

  const priced: { productName: string; slug: string; color: string; size: string; quantity: number; price: number }[] =
    [];

  for (const line of lines) {
    const product = products.find((p) => p.slug === line.slug);
    if (!product) {
      return NextResponse.json(
        {
          error: "unknown_product",
          message: `"${line.slug}" isn't in the published catalogue, so it can't be purchased yet.`,
        },
        { status: 409 }
      );
    }

    const quantity = Math.floor(Number(line.quantity));
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > 9) {
      return NextResponse.json(
        { error: "bad_quantity", message: `Quantity for ${product.name} must be between 1 and 9.` },
        { status: 400 }
      );
    }

    priced.push({
      productName: product.name,
      slug: product.slug,
      color: String(line.color ?? ""),
      size: String(line.size ?? ""),
      quantity,
      price: product.price,
    });
  }

  const totals = computeTotals(lineSubtotal(priced), body.promoCode ?? null);
  const receipt = orderReceipt();

  const razorpayResponse = await fetch(RAZORPAY_ORDERS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
    },
    body: JSON.stringify({
      amount: toPaise(totals.total),
      currency: "INR",
      receipt,
      notes: {
        customerName: body.customer?.name ?? "",
        customerEmail: body.customer?.email ?? "",
        customerPhone: body.customer?.phone ?? "",
        pieces: priced.map((p) => `${p.productName} (${p.size})`).join(", ").slice(0, 480),
      },
    }),
  });

  if (!razorpayResponse.ok) {
    const detail = await razorpayResponse.text();
    console.error("[razorpay] order creation failed", razorpayResponse.status, detail);
    return NextResponse.json(
      { error: "razorpay_error", message: "Razorpay couldn't create this order. Check the API keys and try again." },
      { status: 502 }
    );
  }

  const order = (await razorpayResponse.json()) as { id: string; amount: number; currency: string };

  return NextResponse.json({
    razorpayOrderId: order.id,
    amount: order.amount,
    currency: order.currency,
    receipt,
    // The key id is public by design — it's what the browser passes to the
    // Razorpay modal. Returning it here keeps it in one place rather than
    // needing a second, NEXT_PUBLIC_ copy of the same value.
    keyId,
    // Server-authoritative figures, so the summary the shopper confirms is the
    // one that was actually charged rather than the client's own arithmetic.
    totals,
    items: priced,
  });
}
