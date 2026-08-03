import type { Metadata } from "next";
import { Container } from "@/components/luxury/container";
import { Breadcrumb } from "@/components/luxury/breadcrumb";
import { AboutContent } from "@/components/about/about-content";

export const metadata: Metadata = {
  title: "About",
  description:
    "Mirenne is a made-to-order womenswear label built in Indore, India — where the mirage becomes real.",
};

export default function AboutPage() {
  return (
    <>
      <Container className="pt-8">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "About" }]} />
      </Container>
      <AboutContent />
    </>
  );
}
