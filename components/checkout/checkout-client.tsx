"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { Check, Loader2, Lock, ShieldCheck, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Container } from "@/components/luxury/container";
import { SectionHeading } from "@/components/luxury/section-heading";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cartSubtotal, useCartStore } from "@/lib/store/cart-store";
import { useOrderStore, type Order } from "@/lib/store/order-store";
import { computeTotals } from "@/lib/checkout/pricing";
import { useMounted } from "@/lib/hooks/use-mounted";
import { cn, formatINR, isUnoptimizableSrc } from "@/lib/utils";
import { track } from "@/lib/analytics/events";

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

/** The subset of the Razorpay Checkout API this page actually uses. */
interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
interface RazorpayInstance {
  open: () => void;
  on: (event: "payment.failed", handler: (e: { error?: { description?: string } }) => void) => void;
}
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  notes: "",
};

function validate(form: FormState): string | null {
  if (!form.name.trim()) return "Enter the name this order is for.";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) return "Enter a valid email address.";
  if (!/^[0-9]{10}$/.test(form.phone.replace(/\D/g, "").slice(-10))) return "Enter a 10-digit mobile number.";
  if (!form.address.trim()) return "Enter a delivery address.";
  if (!form.city.trim()) return "Enter a city.";
  if (!form.state.trim()) return "Enter a state.";
  if (!/^[0-9]{6}$/.test(form.pincode.trim())) return "Enter a 6-digit PIN code.";
  return null;
}

export function CheckoutClient() {
  const mounted = useMounted();
  const router = useRouter();

  const items = useCartStore((s) => s.items);
  const promoCode = useCartStore((s) => s.promoCode);
  const giftMessage = useCartStore((s) => s.giftMessage);
  const giftWrap = useCartStore((s) => s.giftWrap);
  const clearCart = useCartStore((s) => s.clearCart);
  const addOrder = useOrderStore((s) => s.addOrder);

  const [form, setForm] = React.useState<FormState>(EMPTY_FORM);
  const [scriptState, setScriptState] = React.useState<"loading" | "ready" | "failed">("loading");
  const [paying, setPaying] = React.useState(false);
  // Keyed by the PIN code that produced it, so a stale result can never be
  // shown against a newer code and the state never has to be cleared in an
  // effect — a mismatched key just isn't rendered.
  const [pinResult, setPinResult] = React.useState<{
    code: string;
    status: "looking" | "found" | "notfound" | "error";
    area: string;
  } | null>(null);

  // Rough starting point from the request's geo headers, purely to save typing.
  // It only fills fields still empty, so it can never overwrite something the
  // shopper typed, and the PIN code lookup below overrides whatever it guessed.
  // IP location is frequently wrong by a city or more (mobile networks, VPNs),
  // which is exactly why it is a prefill and not an answer.
  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/geo")
      .then((r) => (r.ok ? r.json() : null))
      .then((geo) => {
        if (cancelled || !geo || (!geo.city && !geo.state)) return;
        setForm((f) => ({
          ...f,
          city: f.city.trim() ? f.city : (geo.city ?? ""),
          state: f.state.trim() ? f.state : (geo.state ?? ""),
        }));
      })
      .catch(() => {
        // A failed guess is a non-event — the fields simply stay empty.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // PIN code is authoritative: once six digits resolve, they set the city and
  // state, overriding anything the IP guess put there. Debounced so typing the
  // last digits doesn't fire a request per keystroke, and every earlier
  // in-flight lookup is cancelled so a slow response can't land after a newer one.
  const pincode = form.pincode.trim();
  const pincodeValid = /^[1-9][0-9]{5}$/.test(pincode);

  React.useEffect(() => {
    if (!pincodeValid) return;

    let cancelled = false;
    const timer = setTimeout(() => {
      setPinResult({ code: pincode, status: "looking", area: "" });
      fetch(`/api/pincode?code=${pincode}`)
        .then(async (r) => ({ ok: r.ok, data: await r.json() }))
        .then(({ ok, data }) => {
          if (cancelled) return;
          if (!ok) {
            setPinResult({ code: pincode, status: data?.error === "not_found" ? "notfound" : "error", area: "" });
            return;
          }
          setForm((f) => ({ ...f, city: data.city || f.city, state: data.state || f.state }));
          setPinResult({ code: pincode, status: "found", area: data.area ?? "" });
        })
        .catch(() => {
          if (!cancelled) setPinResult({ code: pincode, status: "error", area: "" });
        });
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [pincode, pincodeValid]);

  const pin = pinResult?.code === pincode ? pinResult : null;

  // begin_checkout / InitiateCheckout — the step Meta and GA4 both need to
  // measure the drop-off between "reached checkout" and "paid". Fired once,
  // after the cart store has hydrated and there is actually something in it.
  const reportedCheckout = React.useRef(false);
  React.useEffect(() => {
    if (reportedCheckout.current || items.length === 0) return;
    reportedCheckout.current = true;
    track.beginCheckout(
      items.map((i) => ({ id: i.productId, slug: i.slug, name: i.name, price: i.price, quantity: i.quantity })),
      computeTotals(cartSubtotal(items), promoCode).total
    );
  }, [items, promoCode]);

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  // Totals are shown from the shared pricing module so this page agrees with
  // the cart drawer to the rupee; the amount actually charged is recomputed
  // server-side and echoed back, and that copy is what gets recorded.
  const subtotal = cartSubtotal(items);
  const totals = computeTotals(subtotal, promoCode);

  if (!mounted) {
    return (
      <Container className="py-14">
        <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            <Skeleton className="h-8 w-52" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
          <Skeleton className="h-72 w-full" />
        </div>
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container className="py-24">
        <div className="mx-auto max-w-md text-center">
          <ShoppingBag className="mx-auto h-8 w-8 text-gold" strokeWidth={1} />
          <h1 className="mt-6 font-serif text-3xl text-gold">Your bag is empty</h1>
          <p className="mt-3 text-sm leading-relaxed text-gold">
            Nothing to check out just yet. Have a look at the collection and come back.
          </p>
          <Button asChild variant="primary" size="lg" className="mt-8">
            <Link href="/shop">Shop All</Link>
          </Button>
        </div>
      </Container>
    );
  }

  const recordOrder = (receipt: string, serverTotals: typeof totals, paymentId: string) => {
    const order: Order = {
      id: receipt,
      customerName: form.name.trim(),
      customerEmail: form.email.trim(),
      city: `${form.city.trim()}, ${form.state.trim()}`,
      items: items.map((i) => ({
        productName: i.name,
        slug: i.slug,
        color: i.color,
        size: i.size,
        quantity: i.quantity,
        price: i.price,
      })),
      subtotal: serverTotals.subtotal,
      shipping: serverTotals.shipping,
      total: serverTotals.total,
      status: "pending",
      paymentStatus: "paid",
      placedAt: new Date().toISOString().slice(0, 10),
      notes: [
        `Razorpay payment ${paymentId}`,
        `${form.address.trim()}, ${form.city.trim()}, ${form.state.trim()} ${form.pincode.trim()}`,
        `Phone ${form.phone.trim()}`,
        giftWrap ? "Gift wrap requested." : "",
        giftMessage.trim() ? `Gift message: ${giftMessage.trim()}` : "",
        form.notes.trim(),
      ]
        .filter(Boolean)
        .join(" · "),
    };
    addOrder(order);
  };

  const handlePay = async () => {
    const problem = validate(form);
    if (problem) {
      toast.error(problem);
      return;
    }
    if (scriptState === "failed" || (scriptState === "ready" && !window.Razorpay)) {
      // Distinguish "not yet" from "never" — an ad blocker or a blocked
      // network leaves the first message on screen forever with nothing the
      // shopper can act on.
      toast.error("The payment window couldn't load.", {
        description: "Check your connection, or disable any ad blocker for this site, then reload.",
        duration: 10000,
      });
      return;
    }
    if (scriptState !== "ready" || !window.Razorpay) {
      toast.error("The payment window is still loading. Give it a second and try again.");
      return;
    }

    setPaying(true);
    try {
      // Only what is being bought goes to the server — never the price.
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: items.map((i) => ({
            slug: i.slug,
            color: i.color,
            size: i.size,
            quantity: i.quantity,
            customization: i.customization,
          })),
          promoCode,
          customer: { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message ?? "Couldn't start the payment.", { duration: 8000 });
        setPaying(false);
        return;
      }

      const razorpay = new window.Razorpay({
        key: data.keyId,
        order_id: data.razorpayOrderId,
        amount: data.amount,
        currency: data.currency,
        name: "Mirenne",
        description: `Order ${data.receipt}`,
        prefill: { name: form.name.trim(), email: form.email.trim(), contact: form.phone.trim() },
        notes: { address: `${form.address.trim()}, ${form.city.trim()} ${form.pincode.trim()}` },
        theme: { color: "#763400" },
        modal: {
          ondismiss: () => {
            setPaying(false);
            toast("Payment cancelled — your bag is still here.");
          },
        },
        handler: async (response: RazorpayResponse) => {
          // A "success" callback from the browser proves nothing on its own.
          // The order is only recorded once the server has checked the
          // signature against the secret.
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.verified) {
              toast.error(verifyData.message ?? "We couldn't verify that payment.", { duration: 10000 });
              setPaying(false);
              return;
            }
            recordOrder(data.receipt, data.totals, response.razorpay_payment_id);
            // Only after verification — reporting a Purchase off the browser's
            // unverified success callback would feed Meta and GA4 revenue that
            // never actually cleared.
            track.purchase(
              data.receipt,
              items.map((i) => ({ id: i.productId, slug: i.slug, name: i.name, price: i.price, quantity: i.quantity })),
              data.totals.total,
              data.totals.shipping
            );
            clearCart();
            router.push(`/checkout/success?order=${encodeURIComponent(data.receipt)}`);
          } catch {
            toast.error("The payment went through but we couldn't confirm it. Please contact the studio.", {
              duration: 12000,
            });
            setPaying(false);
          }
        },
      });

      razorpay.on("payment.failed", (e) => {
        toast.error(e.error?.description ?? "The payment didn't go through.");
        setPaying(false);
      });

      razorpay.open();
    } catch {
      toast.error("Couldn't reach the payment service. Check your connection and try again.");
      setPaying(false);
    }
  };

  return (
    <>
      <Script
        src={RAZORPAY_SCRIPT}
        strategy="afterInteractive"
        onReady={() => setScriptState("ready")}
        onError={() => setScriptState("failed")}
      />

      <Container className="py-10 md:py-14">
        <SectionHeading eyebrow="Almost There" title="Checkout" className="mb-10" />

        <div className="grid gap-12 lg:grid-cols-[1fr_380px] lg:gap-16">
          <div>
            <h2 className="label-luxury mb-5 text-gold">Contact</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Full Name" htmlFor="co-name">
                <Input id="co-name" value={form.name} onChange={set("name")} autoComplete="name" />
              </FormField>
              <FormField label="Email" htmlFor="co-email">
                <Input id="co-email" type="email" value={form.email} onChange={set("email")} autoComplete="email" />
              </FormField>
              <FormField label="Mobile Number" htmlFor="co-phone">
                <Input id="co-phone" inputMode="tel" value={form.phone} onChange={set("phone")} autoComplete="tel" />
              </FormField>
            </div>

            <h2 className="label-luxury mb-5 mt-12 text-gold">Delivery Address</h2>
            <div className="grid gap-5">
              <FormField label="Address" htmlFor="co-address">
                <Textarea
                  id="co-address"
                  rows={3}
                  value={form.address}
                  onChange={set("address")}
                  autoComplete="street-address"
                  placeholder="Flat / house number, street, landmark"
                />
              </FormField>
              <div className="grid gap-5 sm:grid-cols-3">
                <FormField label="City" htmlFor="co-city">
                  <Input id="co-city" value={form.city} onChange={set("city")} autoComplete="address-level2" />
                </FormField>
                <FormField label="State" htmlFor="co-state">
                  <Input id="co-state" value={form.state} onChange={set("state")} autoComplete="address-level1" />
                </FormField>
                <FormField label="PIN Code" htmlFor="co-pincode">
                  <Input
                    id="co-pincode"
                    inputMode="numeric"
                    maxLength={6}
                    value={form.pincode}
                    onChange={set("pincode")}
                    autoComplete="postal-code"
                    aria-describedby="co-pincode-status"
                  />
                  <p id="co-pincode-status" aria-live="polite" className="mt-1.5 min-h-4 text-[11px] text-gold">
                    {pin?.status === "looking" && (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="h-3 w-3 animate-spin" strokeWidth={1.5} />
                        Looking up…
                      </span>
                    )}
                    {pin?.status === "found" && (
                      <span className="flex items-center gap-1.5">
                        <Check className="h-3 w-3" strokeWidth={1.5} />
                        {pin.area ? `${pin.area} — city and state filled in` : "City and state filled in"}
                      </span>
                    )}
                    {pin?.status === "notfound" && "No Indian PIN code matches that number."}
                    {pin?.status === "error" && "Couldn't check that PIN code — type the city and state."}
                  </p>
                </FormField>
              </div>
              <FormField label="Delivery Notes" htmlFor="co-notes" optional>
                <Textarea
                  id="co-notes"
                  rows={2}
                  value={form.notes}
                  onChange={set("notes")}
                  placeholder="Anything the courier should know"
                />
              </FormField>
            </div>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="border border-hairline bg-paper p-6">
              <h2 className="label-luxury mb-5 text-gold">Order Summary</h2>

              <ul className="flex flex-col gap-4">
                {items.map((i) => (
                  <li key={`${i.productId}-${i.color}-${i.size}-${i.customization ?? ""}`} className="flex gap-3">
                    <div className="relative aspect-[3/4] w-14 shrink-0 overflow-hidden bg-ivory">
                      <Image
                        src={i.image}
                        alt={i.name}
                        unoptimized={isUnoptimizableSrc(i.image)}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm text-gold">{i.name}</p>
                      <p className="text-xs text-gold">
                        {i.color} · {i.size} · Qty {i.quantity}
                      </p>
                      {i.customization && <p className="mt-0.5 text-[11px] text-gold">{i.customization}</p>}
                    </div>
                    <span className="text-sm text-gold">{formatINR(i.price * i.quantity)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 border-t border-hairline pt-5 text-sm">
                <Row label="Subtotal" value={formatINR(totals.subtotal)} />
                {totals.discount > 0 && (
                  <Row label={`Discount${promoCode ? ` (${promoCode})` : ""}`} value={`−${formatINR(totals.discount)}`} />
                )}
                <Row
                  label="Shipping"
                  value={totals.shipping === 0 ? "Complimentary" : formatINR(totals.shipping)}
                />
                <div className="mt-4 flex justify-between border-t border-hairline pt-4">
                  <span className="text-gold">Total</span>
                  <span className="font-serif text-lg text-gold">{formatINR(totals.total)}</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="mt-6 w-full"
                onClick={handlePay}
                disabled={paying}
              >
                {paying ? "Opening payment…" : `Pay ${formatINR(totals.total)}`}
              </Button>

              {scriptState === "failed" && (
                <p className="mt-3 text-center text-[11px] text-gold-dark">
                  The payment window couldn&apos;t load. Check your connection or any ad blocker, then reload.
                </p>
              )}

              <div className="mt-5 flex flex-col gap-2.5 text-[11px] text-gold">
                <p className="flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 shrink-0" strokeWidth={1.25} />
                  Payment is handled by Razorpay — card details never touch this site
                </p>
                <p className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0" strokeWidth={1.25} />
                  Cards, UPI, net banking and wallets accepted
                </p>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}

function FormField({
  label,
  htmlFor,
  optional,
  children,
}: {
  label: string;
  htmlFor: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor} className="mb-2 block">
        {label}
        {optional && <span className="ml-1 normal-case text-gold/60">(optional)</span>}
      </Label>
      {children}
    </div>
  );
}

function Row({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn("mb-2 flex justify-between", className)}>
      <span className="text-gold">{label}</span>
      <span className="text-gold">{value}</span>
    </div>
  );
}
