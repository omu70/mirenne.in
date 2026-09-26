import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin-guard";
import { db } from "@/lib/server/db";
import { parseCouponInput } from "@/lib/server/coupon-input";

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const parsed = parseCouponInput(await request.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ error: "bad_request", message: parsed.message }, { status: 400 });
  const c = parsed.value;
  const sql = db();
  const [exists] = await sql`select 1 from coupons where code = ${c.code}`;
  if (exists) return NextResponse.json({ error: "duplicate", message: `${c.code} already exists.` }, { status: 409 });
  await sql`
    insert into coupons (code, description, kind, value, min_subtotal, max_uses, starts_at, ends_at, active)
    values (${c.code}, ${c.description}, ${c.kind}, ${c.value}, ${c.minSubtotal}, ${c.maxUses}, ${c.startsAt}, ${c.endsAt}, ${c.active})`;
  return NextResponse.json({ ok: true });
}
