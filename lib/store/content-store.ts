"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { collections as seedCollections } from "@/lib/data/collections";
import { aboutCopy as seedAbout } from "@/lib/data/about";
import { founderStory as seedFounder } from "@/lib/data/founder";
import type { Collection, CollectionSlug, AboutCopy, FounderStory } from "@/lib/types";

export interface HeroContent {
  eyebrow: string;
  headlineLine1: string;
  headlineLine2: string;
  subheadline: string;
  backgroundImage: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
}

const DEFAULT_HERO: HeroContent = {
  // Tagline + CTA sourced verbatim from the Website Content Handoff doc,
  // section 2.1 ("Tagline (overlay on hero image)"). The doc gives one
  // line of tagline copy for the hero, not a separate small eyebrow plus
  // an unrelated big headline — so the tagline is now the actual H1
  // (split across the same two lines Hero already renders), rather than
  // being demoted to a small label above leftover pre-rebrand placeholder
  // copy ("Silhouette first. Trend never.", which named neither Mirenne
  // nor the mirage). Subheadline reuses the same approved line already
  // used as the About/Footer standfirst, instead of inventing new copy.
  // eyebrow is blank on purpose — Hero only renders it when non-empty
  // (matching the secondary-CTA pattern below), so there's no leftover
  // empty label row; /admin/homepage can still add one back if wanted.
  eyebrow: "",
  headlineLine1: "Where the mirage",
  headlineLine2: "becomes real.",
  subheadline: "Mirenne, modern Indian womenswear, for women who'd rather be remembered than seen.",
  // The homepage's first banner: the Signature collection's editorial image
  // (not one of the generic hero-*.jpg mood shots) — deliberately a
  // different image than EditorialCampaign's featured collection further
  // down the page, so the same photo doesn't appear twice in the first two
  // screens. Admin-editable at /admin/homepage regardless.
  backgroundImage: "/images/mood/collection-signature.jpg",
  primaryCtaLabel: "Shop the Collection",
  primaryCtaHref: "/shop",
  secondaryCtaLabel: "",
  secondaryCtaHref: "",
};

/**
 * Editorial/homepage content the admin can rewrite from /admin/homepage and
 * /admin/collections. Like the product store, this persists to this
 * browser's local storage — there's no backend to save it to. Collections
 * are edit-only (name/tagline/description/banner) against the same fixed
 * seven slugs; the set of collections itself isn't admin-addable, since
 * CollectionSlug is a closed type baked into every product record.
 */
interface ContentState {
  hero: HeroContent;
  about: AboutCopy;
  founder: FounderStory;
  collections: Collection[];
  updateHero: (patch: Partial<HeroContent>) => void;
  updateAbout: (patch: Partial<AboutCopy>) => void;
  updateFounder: (patch: Partial<FounderStory>) => void;
  updateCollection: (slug: CollectionSlug, patch: Partial<Collection>) => void;
  resetToDefaults: () => void;
}

export const useContentStore = create<ContentState>()(
  persist(
    (set) => ({
      hero: DEFAULT_HERO,
      about: seedAbout,
      founder: seedFounder,
      collections: seedCollections,

      updateHero: (patch) => set((state) => ({ hero: { ...state.hero, ...patch } })),
      updateAbout: (patch) => set((state) => ({ about: { ...state.about, ...patch } })),
      updateFounder: (patch) => set((state) => ({ founder: { ...state.founder, ...patch } })),
      updateCollection: (slug, patch) =>
        set((state) => ({
          collections: state.collections.map((c) => (c.slug === slug ? { ...c, ...patch } : c)),
        })),

      resetToDefaults: () =>
        set({ hero: DEFAULT_HERO, about: seedAbout, founder: seedFounder, collections: seedCollections }),
    }),
    { name: "mirenne-content" }
  )
);

/** Derives a slug-keyed lookup from the live collections array on demand. */
export function collectionsToMap(list: Collection[]): Record<CollectionSlug, Collection> {
  return Object.fromEntries(list.map((c) => [c.slug, c])) as Record<CollectionSlug, Collection>;
}
