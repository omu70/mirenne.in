import { NextResponse } from "next/server";
import { products } from "@/lib/data/products";
import { computeTotals, lineSubtotal, toPaise, type AppliedCoupon, type CheckoutLine } from "@/lib/checkout/pricing";
import { checkCoupon } from "@/lib/server/coupons";
import { attachRazorpayOrder, createPendingOrder } from "@/lib/server/orders";
import { isDatabaseConfigured } from "@/lib/server/db";
import { razorpayKeys, razorpayRequest } from "@/lib/server/razorpay";

/**
 * Starts a payment. The order is written to the database *before* Razorpay is
 * asked for a payment, so the shop has a record even if the shopper abandons
 * the payment window or closes the tab halfway through.
 *
 * The browser sends only WHAT is being bought — never a price or a total.
 * Prices come from the catalogue committed to the repo and the coupon is looked
 * up in the database, so nothing the client claims can change the amount.
 */

interface OrderRequestBody {
  lines?: CheckoutLine[];
  promoCode?: string | null;
  customer?: { name?: string; email?: string; phone?: string };
  shipping?: { address?: string; city?: string; state?: string; pincode?: string; note?: string };
  gift?: { wrap?: boolean; message?: string };
}

const str = (v: unknown, max = 500) => String(v ?? "").trim().slice(0, max);

function badRequest(message: string, error = "bad_request") {
  return NextResponse.json({ error, message }, { status: 400 });
}

export async function POST(request: Request) {
  const keys = razorpayKeys();
  if (!keys) {
    return NextResponse.json(
      { error: "payments_not_configured", message: "Payments aren't configured yet. Add the Razorpay keys to the environment." },
      { status: 503 }
    );
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "database_not_configured", message: "Orders can't be saved yet. Add DATABASE_URL to the environment." },
      { status: 503 }
    );
  }

  let body: OrderRequestBody;
  try {
    body = await request.json();
  } catch {
    return badRequest("Expected a JSON body.");
  }

  // --- who and where --------------------------------------------------------
  const customer = { name: str(body.customer?.name, 120), email: str(body.customer?.email, 200), phone: str(body.customer?.phone, 20) };
  const shipping = {
    address: str(body.shipping?.address),
    city: str(body.shipping?.city, 100),
    state: str(body.shipping?.state, 100),
    pincode: str(body.shipping?.pincode, 6),
    note: str(body.shipping?.note),
  };
  if (!customer.name) return badRequest("Enter the name this order is for.");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customer.email)) return badRequest("Enter a valid email address.");
  if (!/^[0-9]{10}$/.test(customer.phone.replace(/\D/g, "").slice(-10))) return badRequest("Enter a 10-digit mobile number.");
  if (!shipping.address || !shipping.city || !shipping.state) return badRequest("Enter the full delivery address.");
  if (!/^[1-9][0-9]{5}$/.test(shipping.pincode)) return badRequest("Enter a 6-digit PIN code.");

  // --- what, at the catalogue's prices -------------------------------------
  const lines = body.lines ?? [];
  if (lines.length === 0 || lines.length > 30) return badRequest("There's nothing in the bag.", "empty_cart");

  const priced: { slug: string; name: string; color: string; size: string; customization: string; quantity: number; unitPrice: number }[] = [];
  for (const line of lines) {
    const product = products.find((p) => p.slug === line.slug);
    if (!product) {
      return NextResponse.json(
        { error: "unknown_product", message: `"${line.slug}" isn't in the published catalogue, so it can't be purchased yet.` },
        { status: 409 }
      );
    }
    const quantity = Math.floor(Number(line.quantity));
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > 9) {
      return badRequest(`Quantity for ${product.name} must be between 1 and 9.`, "bad_quantity");
    }
    priced.push({
      slug: product.slug,
      name: product.name,
      color: str(line.color, 60),
      size: str(line.size, 40),
      customization: str(line.customization, 1000),
      quantity,
      unitPrice: product.price,
    });
  }

  const subtotal = lineSubtotal(priced.map((p) => ({ price: p.unitPrice, quantity: p.quantity })));

  // --- coupon, re-checked here: this is the check that counts ---------------
  let coupon: AppliedCoupon | null = null;
  if (body.promoCode) {
    const check = await checkCoupon(body.promoCode, subtotal);
    if (!check.ok) return NextResponse.json({ error: "coupon_invalid", message: check.message }, { status: 409 });
    coupon = check.coupon;
  }
  const totals = computeTotals(subtotal, coupon);

  const order = await createPendingOrder({
    customer,
    shipping,
    gift: { wrap: Boolean(body.gift?.wrap), message: str(body.gift?.message) },
    lines: priced,
    totals,
    couponCode: coupon?.code ?? null,
  });

  const rzp = await razorpayRequest<{ id: string; amount: number; currency: string }>("/orders", {
    amount: toPaise(totals.total),
    currency: "INR",
    receipt: order.number,
    notes: { order_number: order.number, order_id: order.id, customer_email: customer.email },
  });
  if (!rzp.ok) {
    console.error("[razorpay] order creation failed", rzp.error);
    return NextResponse.json(
      { error: "razorpay_error", message: "Razorpay couldn't start this payment. Please try again in a moment." },
      { status: 502 }
    );
  }
  await attachRazorpayOrder(order.id, rzp.data.id);

  return NextResponse.json({
    razorpayOrderId: rzp.data.id,
    amount: rzp.data.amount,
    currency: rzp.data.currency,
    receipt: order.number,
    orderNumber: order.number,
    orderToken: order.public_token,
    keyId: keys.keyId, // public by design — the browser passes it to the Razorpay modal
    totals,
  });
}
