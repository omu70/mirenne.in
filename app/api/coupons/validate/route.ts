import { NextResponse } from "next/server";
import { checkCoupon } from "@/lib/server/coupons";
import { isDatabaseConfigured } from "@/lib/server/db";

/** Lets the cart check a code before checkout. The order route checks it again. */
export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ ok: false, message: "Promo codes aren't available right now." }, { status: 503 });
  }
  const body = (await request.json().catch(() => ({}))) as { code?: string; subtotal?: number };
  const subtotal = Math.max(0, Math.floor(Number(body.subtotal) || 0));
  const result = await checkCoupon(String(body.code ?? ""), subtotal);
  return NextResponse.json(result, { status: result.ok ? 200 : 422 });
}
