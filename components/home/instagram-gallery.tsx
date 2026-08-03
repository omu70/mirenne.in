import Image from "next/image";
import { Heart } from "lucide-react";
import { instagramPosts } from "@/lib/data/instagram";
import { Container } from "@/components/luxury/container";
import { SectionHeading } from "@/components/luxury/section-heading";
import { StaggerReveal, StaggerItem } from "@/components/luxury/reveal";

export function InstagramGallery() {
  const items = instagramPosts.slice(0, 6);

  return (
    <section className="py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Follow Along"
          title="@mirenne.studio"
          description="Behind-the-scenes atelier moments, campaign stills, and the pieces our clients style in the wild."
          align="center"
          className="mx-auto mb-14 items-center text-center"
        />

        <StaggerReveal className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {items.map((post, i) => (
            <StaggerItem key={i}>
              <a
                href="#"
                className="group relative block aspect-square overflow-hidden bg-paper"
                aria-label={post.caption}
              >
                <Image
                  src={post.image.src}
                  alt={post.image.alt}
                  fill
                  sizes="(min-width: 768px) 16vw, 45vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition-all duration-300 group-hover:bg-ink/50 group-hover:opacity-100">
                  <span className="flex items-center gap-1.5 text-sm text-ivory">
                    <Heart className="h-4 w-4 fill-ivory" strokeWidth={1.25} />
                    {post.likes.toLocaleString("en-IN")}
                  </span>
                </div>
              </a>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </Container>
    </section>
  );
}
