import type { Collection, CollectionSlug } from "@/lib/types";

export const collections: Collection[] = [
  {
    slug: "evening-wear",
    name: "Evening Wear",
    tagline: "For rooms with better lighting and longer memories.",
    description:
      "Gowns and structured column dresses built for the evenings that call for something considered rather than loud — galas, receptions, dinners that run late.",
    bannerImage: { src: "/images/mood/collection-evening-wear.jpg", alt: "Deep ink and gold editorial field for Evening Wear", width: 1200, height: 1500 },
  },
  {
    slug: "resort",
    name: "Resort",
    tagline: "Ease, considered.",
    description:
      "Fluid silhouettes in fabric chosen to move with heat rather than against it — for the version of you that packs light and still dresses with intention.",
    bannerImage: { src: "/images/mood/collection-resort.jpg", alt: "Warm sand-toned editorial field for Resort", width: 1200, height: 1500 },
  },
  {
    slug: "cocktail",
    name: "Cocktail",
    tagline: "Shorter hemlines, same restraint.",
    description:
      "Pieces built for a smaller room and a closer light — an evening that starts before dinner and does not need a ballroom to justify it.",
    bannerImage: { src: "/images/mood/collection-cocktail.jpg", alt: "Taupe and gold editorial field for Cocktail", width: 1200, height: 1500 },
  },
  {
    slug: "wedding-guest",
    name: "Wedding Guest",
    tagline: "Never the bride. Never overlooked.",
    description:
      "Sarees, anarkalis, and drapes designed for a role we take as seriously as any other — considered enough to be remembered, without competing with the day itself.",
    bannerImage: { src: "/images/mood/collection-wedding-guest.jpg", alt: "Warm golden editorial field for Wedding Guest", width: 1200, height: 1500 },
  },
  {
    slug: "festive",
    name: "Festive",
    tagline: "Celebration, without the costume.",
    description:
      "Lehengas and hand-worked separates for the celebrations that ask for more colour and more craft, without asking you to disappear into either.",
    bannerImage: { src: "/images/mood/collection-festive.jpg", alt: "Deep festive gold and ink editorial field", width: 1200, height: 1500 },
  },
  {
    slug: "vacation",
    name: "Vacation",
    tagline: "Packed light, worn slowly.",
    description:
      "Easy separates and light dresses for the days between events — considered enough to photograph, simple enough to actually wear.",
    bannerImage: { src: "/images/mood/collection-vacation.jpg", alt: "Airy ivory-toned editorial field for Vacation", width: 1200, height: 1500 },
  },
  {
    slug: "signature",
    name: "Signature",
    tagline: "The silhouettes that built the house.",
    description:
      "Pieces we return to, season after season, because we have never found a reason to improve on them. This is Mirenne with nothing to prove.",
    bannerImage: { src: "/images/mood/collection-signature.jpg", alt: "Refined paper and gold editorial field for Signature", width: 1200, height: 1500 },
  },
];

export const collectionMap: Record<CollectionSlug, Collection> = Object.fromEntries(
  collections.map((c) => [c.slug, c])
) as Record<CollectionSlug, Collection>;
