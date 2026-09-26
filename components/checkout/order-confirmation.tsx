"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Package, Truck } from "lucide-react";
import { Container } from "@/components/luxury/container";
import { Reveal } from "@/components/luxury/reveal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatINR } from "@/lib/utils";
import { ORDER_STATUS_LABEL, type OrderStatus, type PaymentStatus } from "@/lib/commerce/types";

interface CustomerOrder {
  number: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  placedAt: string;
  subtotal: number;
  discount: number;
  couponCode: string | null;
  shipping: number;
  total: number;
  courier: string;
  trackingNumber: string;
  trackingUrl: string;
  items: { name: string; slug: string; color: string; size: string; quantity: number; price: number }[];
}

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: "confirmed", label: "Confirmed" },
  { status: "in_production", label: "Being Made" },
  { status: "shipped", label: "Shipped" },
  { status: "delivered", label: "Delivered" },
];

/**
 * Order status page — shown straight after payment and linked from every
 * order email. Reads the order from the server with the number + secret token
 * in the URL, so it works on any device and always shows the live status.
 */
export function OrderConfirmation() {
  const params = useSearchParams();
  const number = params.get("order") ?? "";
  const token = params.get("t") ?? "";
  const [order, setOrder] = React.useState<CustomerOrder | null>(null);
  const [state, setState] = React.useState<"loading" | "ready" | "missing">(token ? "loading" : "missing");

  React.useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetch(`/api/orders/lookup?order=${encodeURIComponent(number)}&t=${encodeURIComponent(token)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        setOrder(data);
        setState(data ? "ready" : "missing");
      })
      .catch(() => !cancelled && setState("missing"));
    return () => {
      cancelled = true;
    };
  }, [number, token]);

  if (state === "loading") {
    return (
      <Container className="py-24">
        <div className="mx-auto max-w-lg space-y-4">
          <Skeleton className="mx-auto h-12 w-12 rounded-full" />
          <Skeleton className="mx-auto h-9 w-64" />
          <Skeleton className="h-24 w-full" />
        </div>
      </Container>
    );
  }

  const fresh = !order || order.status === "confirmed" || order.status === "pending_payment";
  const stepIndex = order ? STEPS.findIndex((s) => s.status === order.status) : -1;

  return (
    <Container className="py-20 md:py-28">
      <Reveal className="mx-auto max-w-lg text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold text-gold">
          {order?.status === "shipped" ? (
            <Truck className="h-6 w-6" strokeWidth={1.25} />
          ) : order?.status === "delivered" ? (
            <Package className="h-6 w-6" strokeWidth={1.25} />
          ) : (
            <Check className="h-6 w-6" strokeWidth={1.25} />
          )}
        </span>

        <p className="label-luxury mt-8 text-gold">
          {order ? ORDER_STATUS_LABEL[order.status] : "Payment Received"}
        </p>
        <h1 className="mt-3 font-serif text-3xl leading-tight text-gold md:text-4xl">
          {fresh ? "Thank you — your order is in." : `Order ${order?.number}`}
        </h1>

        {number && (
          <p className="mt-5 text-sm text-gold">
            Order number <span className="font-serif text-base">{number}</span>
          </p>
        )}

        {fresh && (
          <p className="mt-4 text-sm leading-relaxed text-gold">
            A confirmation is on its way to your inbox. Made-to-order pieces are cut once the order is confirmed — the
            studio will be in touch with your timeline.
          </p>
        )}

        {order && order.status !== "cancelled" && order.status !== "returned" && order.status !== "pending_payment" && (
          <ol className="mt-10 grid grid-cols-4 gap-2 text-[10px] uppercase tracking-[0.15em] text-gold">
            {STEPS.map((s, i) => (
              <li key={s.status} className="flex flex-col items-center gap-2">
                <span className={`h-1 w-full ${i <= stepIndex ? "bg-gold" : "bg-hairline-dark"}`} />
                <span className={i <= stepIndex ? "" : "opacity-50"}>{s.label}</span>
              </li>
            ))}
          </ol>
        )}

        {order && (order.trackingNumber || order.trackingUrl) && (
          <div className="mt-8 border border-hairline bg-paper p-5 text-sm text-gold">
            <p>
              {order.courier && <>Shipped with {order.courier}. </>}
              {order.trackingNumber && (
                <>
                  Tracking <span className="font-serif">{order.trackingNumber}</span>
                </>
              )}
            </p>
            {order.trackingUrl && (
              <Button asChild variant="secondary" size="sm" className="mt-4">
                <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer">
                  Track Parcel
                </a>
              </Button>
            )}
          </div>
        )}

        {order && (
          <div className="mt-10 border border-hairline bg-paper p-6 text-left">
            <ul className="flex flex-col gap-3">
              {order.items.map((i, n) => (
                <li key={`${i.slug}-${n}`} className="flex justify-between gap-4 text-sm">
                  <span className="text-gold">
                    {i.name}
                    <span className="text-xs"> · {[i.color, i.size, `Qty ${i.quantity}`].filter(Boolean).join(" · ")}</span>
                  </span>
                  <span className="shrink-0 text-gold">{formatINR(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>
            {order.discount > 0 && (
              <div className="mt-4 flex justify-between text-sm text-gold">
                <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                <span>−{formatINR(order.discount)}</span>
              </div>
            )}
            <div className="mt-2 flex justify-between text-sm text-gold">
              <span>Shipping</span>
              <span>{order.shipping === 0 ? "Complimentary" : formatINR(order.shipping)}</span>
            </div>
            <div className="mt-4 flex justify-between border-t border-hairline pt-4">
              <span className="text-gold">{order.paymentStatus === "paid" ? "Paid" : "Total"}</span>
              <span className="font-serif text-lg text-gold">{formatINR(order.total)}</span>
            </div>
          </div>
        )}

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild variant="primary" size="lg">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="/contact">Contact The Studio</Link>
          </Button>
        </div>
      </Reveal>
    </Container>
  );
}
