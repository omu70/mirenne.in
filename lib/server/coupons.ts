import type postgres from "postgres";
import { db } from "@/lib/server/db";
import type { AppliedCoupon } from "@/lib/checkout/pricing";
import type { CouponRow } from "@/lib/commerce/types";

export type CouponCheck = { ok: true; coupon: AppliedCoupon } | { ok: false; message: string };

export function normaliseCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

export function toApplied(row: CouponRow): AppliedCoupon {
  return { code: row.code, kind: row.kind, value: row.value, minSubtotal: row.min_subtotal };
}

/**
 * Whether a code can be used on a basket of this size right now. Called when a
 * shopper applies a code, and again when the order is created — the second
 * check is the one that counts.
 */
export async function checkCoupon(
  rawCode: string,
  subtotal: number,
  sql: postgres.Sql = db()
): Promise<CouponCheck> {
  const code = normaliseCode(rawCode);
  if (!code) return { ok: false, message: "Enter a promo code." };

  const [row] = await sql<CouponRow[]>`select * from coupons where code = ${code}`;
  const now = new Date();
  if (!row || !row.active) return { ok: false, message: "That promo code isn't valid." };
  if (row.starts_at && row.starts_at > now) return { ok: false, message: "That promo code isn't active yet." };
  if (row.ends_at && row.ends_at < now) return { ok: false, message: "That promo code has expired." };
  if (row.max_uses !== null && row.used_count >= row.max_uses) {
    return { ok: false, message: "That promo code has been fully used." };
  }
  if (subtotal < row.min_subtotal) {
    return {
      ok: false,
      message: `This code needs a bag of ₹${row.min_subtotal.toLocaleString("en-IN")} or more.`,
    };
  }
  return { ok: true, coupon: toApplied(row) };
}
