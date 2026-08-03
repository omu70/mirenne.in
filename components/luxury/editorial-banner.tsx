import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/luxury/reveal";

interface EditorialBannerProps {
  image: { src: string; alt: string };
  eyebrow?: string;
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  align?: "left" | "center" | "right";
  theme?: "light" | "dark";
  aspect?: string;
  className?: string;
  priority?: boolean;
}

/**
 * Full-bleed image with overlaid editorial text and an optional CTA.
 * `theme="light"` renders ivory text over a dark scrim (for imagery-heavy
 * banners); `theme="dark"` renders ink text with only a faint scrim, for
 * paler mood-field imagery where dark text reads better.
 */
export function EditorialBanner({
  image,
  eyebrow,
  title,
  description,
  ctaLabel,
  ctaHref,
  align = "left",
  theme = "light",
  aspect = "aspect-[16/9]",
  className,
  priority,
}: EditorialBannerProps) {
  return (
    <div className={cn("group relative overflow-hidden bg-paper", aspect, className)}>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        priority={priority}
        sizes="100vw"
        className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
      />
      <div
        className={cn(
          "absolute inset-0",
          theme === "light" ? "bg-gradient-to-t from-ink/65 via-ink/10 to-transparent" : "bg-ivory/10"
        )}
      />
      <div
        className={cn(
          "absolute inset-0 flex flex-col justify-end p-8 md:p-14",
          align === "center" && "items-center text-center",
          align === "right" && "items-end text-right"
        )}
      >
        <Reveal className="max-w-lg">
          {eyebrow && (
            <p className={cn("label-luxury mb-3", theme === "light" ? "text-ivory/80" : "text-gold")}>
              {eyebrow}
            </p>
          )}
          <h3
            className={cn(
              "font-serif text-3xl leading-[1.1] md:text-5xl",
              theme === "light" ? "text-ivory" : "text-gold"
            )}
          >
            {title}
          </h3>
          {description && (
            <p
              className={cn(
                "mt-4 max-w-md text-sm leading-relaxed",
                theme === "light" ? "text-ivory/85" : "text-gold"
              )}
            >
              {description}
            </p>
          )}
          {ctaLabel && ctaHref && (
            <Button asChild variant={theme === "light" ? "outlineLight" : "secondary"} size="md" className="mt-7">
              <Link href={ctaHref}>{ctaLabel}</Link>
            </Button>
          )}
        </Reveal>
      </div>
    </div>
  );
}
