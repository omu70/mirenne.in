import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin-guard";
import { db } from "@/lib/server/db";

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await ctx.params;
  const body = (await request.json().catch(() => ({}))) as { note?: string };
  await db()`update customers set admin_note = ${String(body.note ?? "").slice(0, 4000)}, updated_at = now() where id = ${id}`;
  return NextResponse.json({ ok: true });
}
