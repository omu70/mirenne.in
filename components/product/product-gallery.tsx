import Image from "next/image";
import type { ProductImage } from "@/lib/types";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

/**
 * Deliberately not a JS carousel. Desktop shows the full vertical stack of
 * images side-by-side with the sticky buy box (an editorial-magazine scroll,
 * not a click-through slideshow); mobile switches the same markup to a
 * horizontal CSS scroll-snap strip — no scroll-position tracking or active
 * index state needed either way.
 */
export function ProductGallery({ images, productName }: ProductGalleryProps) {
  return (
    <div
      className="flex snap-x snap-mandatory gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-3 lg:flex-col lg:snap-none lg:overflow-visible [&::-webkit-scrollbar]:hidden"
    >
      {images.map((image, i) => (
        <div
          key={image.src + i}
          className="relative aspect-[4/5] w-[82vw] shrink-0 snap-center bg-paper sm:w-[60vw] lg:w-full lg:shrink"
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority={i === 0}
            sizes="(min-width: 1024px) 44vw, (min-width: 640px) 60vw, 82vw"
            className="object-cover"
          />
        </div>
      ))}
      <span className="sr-only">{images.length} photos of {productName}</span>
    </div>
  );
}
