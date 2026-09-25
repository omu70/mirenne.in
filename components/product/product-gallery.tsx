import * as React from "react";
import Image from "next/image";
import type { ProductImage } from "@/lib/types";
import { cn, isUnoptimizableSrc } from "@/lib/utils";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
  /** Optional MP4 URL, slotted in right after the lead photo. */
  video?: string;
}

/**
 * Deliberately not a JS carousel. Desktop lays the photos out as a two-column
 * editorial grid beside the sticky buy box; mobile switches the same markup to
 * a horizontal CSS scroll-snap strip — no scroll-position tracking or active
 * index state needed either way.
 *
 * On an odd number of photos the first one runs full width, so the remaining
 * even count fills the grid and nothing is left stranded in a half-empty final
 * row. With an even count every photo is half width. Both shapes are common in
 * the catalogue (the Collection 1 pieces have five or six shots each), and this
 * is the one rule that makes both of them land square.
 */
export function ProductGallery({ images, productName, video }: ProductGalleryProps) {
  const itemCount = images.length + (video ? 1 : 0);
  const leadIsFullWidth = itemCount % 2 === 1;

  return (
    <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-3 lg:grid lg:grid-cols-2 lg:snap-none lg:overflow-visible [&::-webkit-scrollbar]:hidden">
      {images.map((image, i) => {
        const spansBothColumns = leadIsFullWidth && i === 0;
        return (
          <React.Fragment key={image.src + i}>
          <div
            className={cn(
              "relative aspect-[4/5] w-[82vw] shrink-0 snap-center bg-paper sm:w-[60vw] lg:w-auto lg:shrink",
              spansBothColumns && "lg:col-span-2"
            )}
          >
            <Image
              src={image.src}
              alt={image.alt}
              unoptimized={isUnoptimizableSrc(image.src)}
              fill
              priority={i === 0}
              // Half the gallery column once the grid kicks in, except the
              // full-width lead shot — an oversized `sizes` here would have
              // the browser fetch a needlessly large file for every photo.
              sizes={
                spansBothColumns
                  ? "(min-width: 1024px) 44vw, (min-width: 640px) 60vw, 82vw"
                  : "(min-width: 1024px) 22vw, (min-width: 640px) 60vw, 82vw"
              }
              className="object-cover"
            />
          </div>
          {video && i === 0 && (
            <div className="relative aspect-[4/5] w-[82vw] shrink-0 snap-center bg-paper sm:w-[60vw] lg:w-auto lg:shrink">
              <video
                src={video}
                poster={image.src}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label={`${productName} in motion`}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          )}
          </React.Fragment>
        );
      })}
      <span className="sr-only">
        {images.length} photos{video ? " and a video" : ""} of {productName}
      </span>
    </div>
  );
}
