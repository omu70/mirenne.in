import Link from "next/link";
import Image from "next/image";
import { journalPosts } from "@/lib/data/journal";
import { Container } from "@/components/luxury/container";
import { SectionHeading } from "@/components/luxury/section-heading";
import { StaggerReveal, StaggerItem } from "@/components/luxury/reveal";
import { Button } from "@/components/ui/button";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export function JournalPreview() {
  const posts = journalPosts.slice(0, 3);

  return (
    <section className="bg-paper py-20 md:py-28">
      <Container>
        <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading eyebrow="The Journal" title="Stories From The House" className="mb-0" />
          <Button asChild variant="link" size="sm">
            <Link href="/journal">Visit The Journal →</Link>
          </Button>
        </div>

        <StaggerReveal className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6">
          {posts.map((post) => (
            <StaggerItem key={post.slug}>
              <Link href={`/journal/${post.slug}`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden bg-ivory">
                  <Image
                    src={post.coverImage.src}
                    alt={post.coverImage.alt}
                    fill
                    sizes="(min-width: 640px) 30vw, 90vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
                <p className="label-luxury mt-5 text-gold">{post.category}</p>
                <h3 className="mt-2 font-serif text-xl leading-snug text-gold transition-colors group-hover:text-gold-dark">
                  {post.title}
                </h3>
                <p className="mt-2 text-xs text-gold">
                  {formatDate(post.publishedAt)} · {post.readTime}
                </p>
              </Link>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </Container>
    </section>
  );
}
