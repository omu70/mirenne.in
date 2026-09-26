"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { fmtDate } from "@/components/admin/commerce/format";
import { cn, formatINR } from "@/lib/utils";
import type { CouponRow } from "@/lib/commerce/types";

interface FormState {
  code: string;
  description: string;
  kind: "percent" | "flat";
  value: string;
  minSubtotal: string;
  maxUses: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
}

const EMPTY: FormState = {
  code: "",
  description: "",
  kind: "percent",
  value: "10",
  minSubtotal: "",
  maxUses: "",
  startsAt: "",
  endsAt: "",
  active: true,
};

const istDay = (d: Date | null) =>
  d ? new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date(d)) : "";

function toForm(c: CouponRow): FormState {
  return {
    code: c.code,
    description: c.description,
    kind: c.kind,
    value: String(c.value),
    minSubtotal: c.min_subtotal ? String(c.min_subtotal) : "",
    maxUses: c.max_uses ? String(c.max_uses) : "",
    startsAt: istDay(c.starts_at),
    endsAt: istDay(c.ends_at),
    active: c.active,
  };
}

function couponState(c: CouponRow): { label: string; live: boolean } {
  const now = new Date();
  if (!c.active) return { label: "Off", live: false };
  if (c.ends_at && new Date(c.ends_at) < now) return { label: "Expired", live: false };
  if (c.starts_at && new Date(c.starts_at) > now) return { label: "Scheduled", live: false };
  if (c.max_uses !== null && c.used_count >= c.max_uses) return { label: "Used Up", live: false };
  return { label: "Live", live: true };
}

export function CouponManager({ coupons }: { coupons: CouponRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<CouponRow | "new" | null>(null);
  const [form, setForm] = React.useState<FormState>(EMPTY);
  const [busy, setBusy] = React.useState(false);

  const open = (c: CouponRow | "new") => {
    setForm(c === "new" ? EMPTY : toForm(c));
    setEditing(c);
  };

  const request = async (url: string, method: string, body?: unknown) => {
    setBusy(true);
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (!res?.ok) toast.error(data.message ?? "That didn't work.");
    return Boolean(res?.ok);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const isNew = editing === "new";
    const ok = await request(isNew ? "/api/admin/coupons" : `/api/admin/coupons/${(editing as CouponRow).id}`, isNew ? "POST" : "PATCH", form);
    if (ok) {
      toast.success(isNew ? `${form.code.toUpperCase()} created.` : "Coupon saved.");
      setEditing(null);
      router.refresh();
    }
  };

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div>
      <AdminPageHeader
        title="Coupons"
        description="Promo codes shoppers can enter in the bag. Checked on the server at payment, so an expired or used-up code can't slip through."
        action={
          <Button variant="primary" size="sm" onClick={() => open("new")}>
            <Plus className="mr-2 h-3.5 w-3.5" strokeWidth={1.5} /> New Coupon
          </Button>
        }
      />

      {coupons.length === 0 ? (
        <p className="py-16 text-center text-sm text-graphite">No coupons yet.</p>
      ) : (
        <div className="overflow-x-auto border border-hairline">
          <table className="w-full min-w-[820px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-hairline bg-paper text-left">
                {["Code", "Discount", "Min. Bag", "Used", "Valid", "Status", ""].map((h, i) => (
                  <th key={i} className="label-luxury px-4 py-3 font-normal text-graphite">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => {
                const st = couponState(c);
                return (
                  <tr key={c.id} className="border-b border-hairline last:border-b-0">
                    <td className="px-4 py-3">
                      <p className="font-mono text-ink">{c.code}</p>
                      {c.description && <p className="text-xs text-graphite">{c.description}</p>}
                    </td>
                    <td className="px-4 py-3 text-ink">{c.kind === "percent" ? `${c.value}%` : formatINR(c.value)}</td>
                    <td className="px-4 py-3 text-graphite">{c.min_subtotal ? formatINR(c.min_subtotal) : "—"}</td>
                    <td className="px-4 py-3 text-graphite">
                      {c.used_count}
                      {c.max_uses ? ` / ${c.max_uses}` : ""}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-graphite">
                      {c.starts_at || c.ends_at
                        ? `${c.starts_at ? fmtDate(c.starts_at, false) : "Now"} – ${c.ends_at ? fmtDate(c.ends_at, false) : "No end"}`
                        : "Always"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={async () => {
                          if (await request(`/api/admin/coupons/${c.id}`, "PATCH", { active: !c.active })) router.refresh();
                        }}
                        className={cn(
                          "cursor-pointer border px-2 py-0.5 text-[11px]",
                          st.live ? "border-ink bg-ink text-ivory" : "border-hairline-dark text-graphite"
                        )}
                        title={c.active ? "Click to switch off" : "Click to switch on"}
                      >
                        {st.label}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => open(c)} aria-label={`Edit ${c.code}`} className="flex h-8 w-8 cursor-pointer items-center justify-center text-graphite hover:text-ink">
                          <Pencil className="h-4 w-4" strokeWidth={1.25} />
                        </button>
                        <button
                          aria-label={`Delete ${c.code}`}
                          className="flex h-8 w-8 cursor-pointer items-center justify-center text-graphite hover:text-gold-dark"
                          onClick={async () => {
                            if (!window.confirm(`Delete ${c.code}? Past orders keep their discount; the code just stops working.`)) return;
                            if (await request(`/api/admin/coupons/${c.id}`, "DELETE")) {
                              toast.success(`${c.code} deleted.`);
                              router.refresh();
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.25} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Sheet open={editing !== null} onOpenChange={(v) => !v && setEditing(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{editing === "new" ? "New Coupon" : "Edit Coupon"}</SheetTitle>
          </SheetHeader>
          <form onSubmit={save} className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-6">
            <div>
              <Label className="mb-2 block">Code</Label>
              <Input value={form.code} onChange={set("code")} placeholder="DIWALI15" className="font-mono uppercase" required />
            </div>
            <div>
              <Label className="mb-2 block">Description (only you see this)</Label>
              <Input value={form.description} onChange={set("description")} placeholder="Diwali campaign, Instagram" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">Type</Label>
                <div className="flex border border-hairline-dark">
                  {(["percent", "flat"] as const).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, kind: k }))}
                      className={cn("h-10 flex-1 cursor-pointer text-sm", form.kind === k ? "bg-ink text-ivory" : "text-ink")}
                    >
                      {k === "percent" ? "% Off" : "₹ Off"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="mb-2 block">{form.kind === "percent" ? "Percent" : "Amount (₹)"}</Label>
                <Input inputMode="numeric" value={form.value} onChange={set("value")} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">Minimum Bag (₹)</Label>
                <Input inputMode="numeric" value={form.minSubtotal} onChange={set("minSubtotal")} placeholder="None" />
              </div>
              <div>
                <Label className="mb-2 block">Total Uses Allowed</Label>
                <Input inputMode="numeric" value={form.maxUses} onChange={set("maxUses")} placeholder="Unlimited" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">Starts</Label>
                <Input type="date" value={form.startsAt} onChange={set("startsAt")} />
              </div>
              <div>
                <Label className="mb-2 block">Ends</Label>
                <Input type="date" value={form.endsAt} onChange={set("endsAt")} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
              Active
            </label>
            <Button type="submit" variant="primary" size="md" disabled={busy}>
              {busy ? "Saving…" : "Save Coupon"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
