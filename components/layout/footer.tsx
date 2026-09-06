"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { Container } from "@/components/luxury/container";
import { Logo } from "@/components/brand/logo";
import { useContentStore } from "@/lib/store/content-store";

export function Footer() {
  const aboutCopy = useContentStore((s) => s.about);
  const collections = useContentStore((s) => s.collections);
  // Footer columns are admin-editable (see /admin/menu); a column with no
  // title and no links is treated as removed rather than rendered empty.
  const footerColumns = useContentStore((s) => s.navigation.footerColumns).filter(
    (c) => c.title || c.links.length > 0
  );

  return (
    <footer className="border-t border-hairline bg-paper">
      <Container className="py-20">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link href="/" aria-label="Mirenne — Home">
              <Logo variant="horizontal" className="text-gold" />
            </Link>
            {/* Rust per the brand Typography reference (the wordmark's own
                ink color, #934c14 — same value as --color-gold). No
                newsletter form here: NewsletterBand already sits directly
                above the footer on the homepage, so a second "Join The
                List" form right below it was a straight duplicate. */}
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-gold">{aboutCopy.heroSubline}</p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-8">
            {footerColumns.map((column, ci) => (
              <div key={`${column.title}-${ci}`}>
                <p className="label-luxury mb-5 text-gold">{column.title}</p>
                <ul className="space-y-3">
                  {column.links.map((link, i) => (
                    <li key={`${link.href}-${i}`}>
                      <Link
                        href={link.href}
                        className="link-underline text-sm text-gold transition-colors hover:text-gold-dark"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 border-t border-hairline pt-6">
          <p className="label-luxury mb-4 text-gold/70">Our Collections</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {collections.map((c) => (
              <Link
                key={c.slug}
                href={`/collections/${c.slug}`}
                className="text-xs text-gold transition-colors hover:text-gold-dark"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-6 border-t border-hairline pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gold">© {new Date().getFullYear()} Mirenne. All rights reserved. Made in India.</p>
          <div className="flex items-center gap-5">
            <a href="#" className="label-luxury text-gold transition-colors hover:text-gold-dark">
              Instagram
            </a>
            <a href="#" className="label-luxury text-gold transition-colors hover:text-gold-dark">
              Pinterest
            </a>
            <a
              href="mailto:studio@mirenne.com"
              aria-label="Email Mirenne"
              className="text-gold transition-colors hover:text-gold-dark"
            >
              <Mail className="h-4 w-4" strokeWidth={1.25} />
            </a>
          </div>
          <p className="text-xs text-gold">Secure Checkout · Cards, UPI &amp; Net Banking Accepted</p>
        </div>
      </Container>
    </footer>
  );
}
