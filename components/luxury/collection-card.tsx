import Link from "next/link";
import Image from "next/image";
import type { Collection } from "@/lib/types";
import { cn } from "@/lib/utils";
import { collectionHref } from "@/lib/collections/href";

interface CollectionCardProps {
  collection: Collection;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export function CollectionCard({ collection, className, priority, sizes }: CollectionCardProps) {
  return (
    <Link
      href={collectionHref(collection.slug)}
      className={cn("group relative block aspect-[4/5] overflow-hidden bg-paper", className)}
    >
      <Image
        src={collection.bannerImage.src}
        alt={collection.bannerImage.alt}
        fill
        priority={priority}
        sizes={sizes ?? "(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 90vw"}
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/65 via-ink/5 to-transparent transition-opacity duration-500 group-hover:from-ink/75" />
      <div className="absolute inset-x-0 bottom-0 p-6">
        <p className="font-serif text-2xl text-ivory">{collection.name}</p>
        <p className="mt-1.5 text-xs leading-relaxed text-ivory/80">{collection.tagline}</p>
      </div>
    </Link>
  );
}
