import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderConfirmation } from "@/components/checkout/order-confirmation";

export const metadata: Metadata = {
  title: "Your Order",
  robots: { index: false, follow: false },
};

// The order number arrives as a search param, so the confirmation is read on
// the client and needs a Suspense boundary around useSearchParams.
export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <OrderConfirmation />
    </Suspense>
  );
}
