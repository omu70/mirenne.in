import type { Metadata } from "next";
import { Container } from "@/components/luxury/container";
import { Breadcrumb } from "@/components/luxury/breadcrumb";
import { WishlistContent } from "@/components/wishlist/wishlist-content";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "The Mirenne pieces you've saved.",
  robots: { index: false, follow: false },
};

export default function WishlistPage() {
  return (
    <>
      <Container className="pt-8">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} />
      </Container>
      <WishlistContent />
    </>
  );
}
