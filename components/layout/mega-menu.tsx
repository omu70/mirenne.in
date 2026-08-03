"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useContentStore, collectionsToMap } from "@/lib/store/content-store";
import { NAV_CATEGORIES } from "@/lib/data/nav-categories";

interface MegaMenuProps {
  onNavigate?: () => void;
}

export function MegaMenu({ onNavigate }: MegaMenuProps) {
  const collections = useContentStore((s) => s.collections);
  const featured = collectionsToMap(collections).signature;

  return (
    <div className="grid grid-cols-12 gap-x-10 gap-y-10">
      <div className="col-span-3">
        <p className="label-luxury mb-6 text-gold/70">Shop By Collection</p>
        <ul className="space-y-3.5">
          {collections.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/collections/${c.slug}`}
                onClick={onNavigate}
                className="link-underline font-serif text-lg text-gold transition-colors hover:text-gold-dark"
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/collections"
          onClick={onNavigate}
          className="label-luxury mt-7 inline-flex items-center gap-2 text-gold/70 transition-colors hover:text-gold-dark"
        >
          View All Collections
          <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
        </Link>
      </div>

      <div className="col-span-3">
        <p className="label-luxury mb-6 text-gold/70">Shop By Category</p>
        <ul className="space-y-3.5">
          {NAV_CATEGORIES.map((cat) => (
            <li key={cat}>
              <Link
                href={`/shop?category=${encodeURIComponent(cat)}`}
                onClick={onNavigate}
                className="link-underline text-sm text-gold transition-colors hover:text-gold-dark"
              >
                {cat}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="col-span-3">
        <p className="label-luxury mb-6 text-gold/70">The Edit</p>
        <ul className="space-y-3.5">
          <li>
            <Link href="/shop?filter=new" onClick={onNavigate} className="link-underline text-sm text-gold transition-colors hover:text-gold-dark">
              New Arrivals
            </Link>
          </li>
          <li>
            <Link href="/shop?filter=bestseller" onClick={onNavigate} className="link-underline text-sm text-gold transition-colors hover:text-gold-dark">
              Best Sellers
            </Link>
          </li>
          <li>
            <Link href="/shop?availability=made-to-order" onClick={onNavigate} className="link-underline text-sm text-gold transition-colors hover:text-gold-dark">
              Made To Order
            </Link>
          </li>
          <li>
            <Link href="/shop" onClick={onNavigate} className="link-underline text-sm text-gold transition-colors hover:text-gold-dark">
              Shop All
            </Link>
          </li>
        </ul>
        <div className="mt-9 border-t border-hairline pt-6">
          <p className="label-luxury mb-3 text-gold/70">Need Help Choosing?</p>
          <Link href="/contact" onClick={onNavigate} className="link-underline text-sm text-gold transition-colors hover:text-gold-dark">
            Book a Styling Appointment
          </Link>
        </div>
      </div>

      <div className="col-span-3">
        <Link href={`/collections/${featured.slug}`} onClick={onNavigate} className="group relative block aspect-[4/5] overflow-hidden bg-paper">
          <Image
            src={featured.bannerImage.src}
            alt={featured.bannerImage.alt}
            fill
            sizes="(min-width: 1024px) 22vw, 40vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/0 to-ink/0" />
          <div className="absolute inset-x-0 bottom-0 p-6">
            <p className="label-luxury text-ivory/80">{featured.name}</p>
            <p className="mt-2 font-serif text-xl leading-tight text-ivory">{featured.tagline}</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
