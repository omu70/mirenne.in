import type { Metadata } from "next";
import { Container } from "@/components/luxury/container";
import { Breadcrumb } from "@/components/luxury/breadcrumb";
import { CheckoutClient } from "@/components/checkout/checkout-client";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your Mirenne order.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <>
      <Container className="pt-8">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: "Checkout" }]} />
      </Container>
      <CheckoutClient />
    </>
  );
}
