import { BadgeCheck, Star } from "lucide-react";
import { reviews as allReviews } from "@/lib/data/reviews";
import { Container } from "@/components/luxury/container";
import { SectionHeading } from "@/components/luxury/section-heading";
import { Reveal, StaggerReveal, StaggerItem } from "@/components/luxury/reveal";
import { cn, formatDaysAgo } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface ReviewsSectionProps {
  product: Product;
}

export function ReviewsSection({ product }: ReviewsSectionProps) {
  const reviews = allReviews.filter((r) => r.productId === product.id);

  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    return { star, count, pct: reviews.length ? Math.round((count / reviews.length) * 100) : 0 };
  });

  return (
    <section id="reviews" className="scroll-mt-28 border-t border-hairline py-16 md:py-24">
      <Container>
        <SectionHeading eyebrow="In Their Words" title="Customer Reviews" />

        {reviews.length === 0 ? (
          <Reveal className="mt-10 max-w-md">
            <p className="text-sm leading-relaxed text-gold">
              This piece hasn&apos;t been reviewed yet. Be the first to share how it wore for you.
            </p>
          </Reveal>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[280px_1fr] lg:gap-16">
            <Reveal className="lg:sticky lg:top-28 lg:self-start">
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-5xl text-gold">{product.rating.toFixed(1)}</span>
                <span className="text-sm text-gold">out of 5</span>
              </div>
              <div className="mt-2 flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < Math.round(product.rating) ? "fill-gold text-gold" : "text-hairline-dark"
                    )}
                    strokeWidth={1.25}
                  />
                ))}
              </div>
              <p className="mt-1 text-xs text-gold">
                Based on {product.reviewCount} review{product.reviewCount === 1 ? "" : "s"}
              </p>

              <div className="mt-7 flex flex-col gap-2">
                {distribution.map(({ star, count, pct }) => (
                  <div key={star} className="flex items-center gap-3 text-xs text-gold">
                    <span className="w-3 text-gold">{star}</span>
                    <Star className="h-3 w-3 shrink-0 fill-gold text-gold" strokeWidth={1.25} />
                    <span className="h-1 flex-1 bg-stone">
                      <span className="block h-full bg-gold-dark" style={{ width: `${pct}%` }} />
                    </span>
                    <span className="w-6 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </Reveal>

            <StaggerReveal className="flex flex-col gap-8">
              {reviews.map((review) => (
                <StaggerItem key={review.id}>
                  <div className="border-b border-hairline pb-8">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-3.5 w-3.5",
                            i < review.rating ? "fill-gold text-gold" : "text-hairline-dark"
                          )}
                          strokeWidth={1.25}
                        />
                      ))}
                    </div>
                    <h3 className="mt-3 text-sm text-gold">{review.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gold">{review.comment}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gold">
                      <span className="text-gold">{review.customerName}</span>
                      {review.verified && (
                        <span className="flex items-center gap-1">
                          <BadgeCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
                          Verified Purchase
                        </span>
                      )}
                      <span>·</span>
                      <span>{formatDaysAgo(review.daysAgo)}</span>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerReveal>
          </div>
        )}
      </Container>
    </section>
  );
}
