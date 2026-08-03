import type { Metadata } from "next";
import { Container } from "@/components/luxury/container";
import { Breadcrumb } from "@/components/luxury/breadcrumb";
import { ContactContent } from "@/components/contact/contact-content";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Questions about an order, sizing, or a custom piece? Reach the Mirenne studio in Indore, India, or browse answers to frequently asked questions.",
};

export default function ContactPage() {
  return (
    <>
      <Container className="pt-8">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Contact Us" }]} />
      </Container>
      <ContactContent />
    </>
  );
}
