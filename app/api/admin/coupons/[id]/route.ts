import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin-guard";
import { db } from "@/lib/server/db";
import { parseCouponInput } from "@/lib/server/coupon-input";

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const sql = db();

  // Quick on/off toggle from the list.
  if (body && Object.keys(body).length === 1 && typeof body.active === "boolean") {
    await sql`update coupons set active = ${body.active} where id = ${id}`;
    return NextResponse.json({ ok: true });
  }

  const parsed = parseCouponInput(body);
  if (!parsed.ok) return NextResponse.json({ error: "bad_request", message: parsed.message }, { status: 400 });
  const c = parsed.value;
  const [clash] = await sql`select 1 from coupons where code = ${c.code} and id <> ${id}`;
  if (clash) return NextResponse.json({ error: "duplicate", message: `${c.code} already exists.` }, { status: 409 });
  await sql`
    update coupons set code = ${c.code}, description = ${c.description}, kind = ${c.kind}, value = ${c.value},
      min_subtotal = ${c.minSubtotal}, max_uses = ${c.maxUses}, starts_at = ${c.startsAt}, ends_at = ${c.endsAt}, active = ${c.active}
    where id = ${id}`;
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await ctx.params;
  await db()`delete from coupons where id = ${id}`;
  return NextResponse.json({ ok: true });
}
