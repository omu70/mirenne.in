"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import { Container } from "@/components/luxury/container";
import { Reveal } from "@/components/luxury/reveal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrderStore } from "@/lib/store/order-store";
import { useMounted } from "@/lib/hooks/use-mounted";
import { formatINR } from "@/lib/utils";

/**
 * Reads the order back out of the local order store by the number in the URL,
 * so the confirmation shows what was actually recorded rather than re-deriving
 * it from a cart that has already been cleared. If the order isn't found — a
 * shared link, a different browser, cleared storage — the number is still
 * shown, because it's the thing the customer needs when they get in touch.
 */
export function OrderConfirmation() {
  const mounted = useMounted();
  const params = useSearchParams();
  const orderId = params.get("order") ?? "";
  const order = useOrderStore((s) => s.orders.find((o) => o.id === orderId));

  if (!mounted) {
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

  return (
    <Container className="py-20 md:py-28">
      <Reveal className="mx-auto max-w-lg text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold text-gold">
          <Check className="h-6 w-6" strokeWidth={1.25} />
        </span>

        <p className="label-luxury mt-8 text-gold">Payment Received</p>
        <h1 className="mt-3 font-serif text-3xl leading-tight text-gold md:text-4xl">Thank you — your order is in.</h1>

        {orderId && (
          <p className="mt-5 text-sm text-gold">
            Order number <span className="font-serif text-base">{orderId}</span>
          </p>
        )}

        <p className="mt-4 text-sm leading-relaxed text-gold">
          A confirmation is on its way to your inbox. Made-to-order pieces are cut once the order is confirmed — the
          studio will be in touch with your timeline.
        </p>

        {order && (
          <div className="mt-10 border border-hairline bg-paper p-6 text-left">
            <ul className="flex flex-col gap-3">
              {order.items.map((i, n) => (
                <li key={`${i.slug}-${n}`} className="flex justify-between gap-4 text-sm">
                  <span className="text-gold">
                    {i.productName}
                    <span className="text-xs"> · {i.color} · {i.size} · Qty {i.quantity}</span>
                  </span>
                  <span className="shrink-0 text-gold">{formatINR(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex justify-between border-t border-hairline pt-4">
              <span className="text-gold">Paid</span>
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
