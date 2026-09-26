import { normaliseCode } from "@/lib/server/coupons";

export interface CouponInput {
  code: string;
  description: string;
  kind: "percent" | "flat";
  value: number;
  minSubtotal: number;
  maxUses: number | null;
  startsAt: Date | null;
  endsAt: Date | null;
  active: boolean;
}

/** Validates the admin coupon form. Dates arrive as YYYY-MM-DD (India time). */
export function parseCouponInput(raw: unknown): { ok: true; value: CouponInput } | { ok: false; message: string } {
  if (!raw || typeof raw !== "object") return { ok: false, message: "Expected a JSON body." };
  const b = raw as Record<string, unknown>;
  const code = normaliseCode(String(b.code ?? ""));
  if (!/^[A-Z0-9_-]{3,30}$/.test(code)) return { ok: false, message: "Code: 3–30 letters, numbers, - or _." };
  const kind = b.kind === "flat" ? "flat" : b.kind === "percent" ? "percent" : null;
  if (!kind) return { ok: false, message: "Choose percentage or flat amount." };
  const value = Math.floor(Number(b.value));
  if (!Number.isFinite(value) || value < 1) return { ok: false, message: "Enter a discount above zero." };
  if (kind === "percent" && value > 90) return { ok: false, message: "Percentage discounts max out at 90%." };
  const minSubtotal = Math.max(0, Math.floor(Number(b.minSubtotal) || 0));
  const maxUsesRaw = b.maxUses === "" || b.maxUses == null ? null : Math.floor(Number(b.maxUses));
  if (maxUsesRaw !== null && (!Number.isFinite(maxUsesRaw) || maxUsesRaw < 1)) return { ok: false, message: "Usage limit must be 1 or more, or blank." };

  const day = (v: unknown, endOfDay: boolean): Date | null | "bad" => {
    const s = String(v ?? "").trim();
    if (!s) return null;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return "bad";
    return new Date(`${s}T${endOfDay ? "23:59:59" : "00:00:00"}+05:30`);
  };
  const startsAt = day(b.startsAt, false);
  const endsAt = day(b.endsAt, true);
  if (startsAt === "bad" || endsAt === "bad") return { ok: false, message: "Dates should be YYYY-MM-DD." };
  if (startsAt && endsAt && endsAt < startsAt) return { ok: false, message: "The end date is before the start date." };

  return {
    ok: true,
    value: {
      code,
      description: String(b.description ?? "").trim().slice(0, 200),
      kind,
      value,
      minSubtotal,
      maxUses: maxUsesRaw,
      startsAt,
      endsAt,
      active: b.active !== false,
    },
  };
}
