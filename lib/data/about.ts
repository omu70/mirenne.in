import type { AboutCopy } from "@/lib/types";

// Sourced verbatim from the brand's Website Content Handoff doc (sections
// 3.1 "The Meaning of Mirenne" and 3.2 "The Shape It Took"). Reused inside
// the existing AboutCopy shape rather than restructuring it, since
// /admin/homepage already edits these four fields by name — heroSubline
// doubles as both the About page's standfirst and (via Footer.tsx, which
// reads this same field) the site-wide footer closing line.
export const aboutCopy: AboutCopy = {
  heroHeadline: "Mirenne. Where the mirage becomes real.",
  heroSubline:
    "Mirenne, modern Indian womenswear, for women who'd rather be remembered than seen.",
  philosophyStatement:
    "Long before it had a name, it was only a feeling, the way light bends over sand at the edge of the horizon, and for one breath, shows you something that shouldn't exist. A mirage. Not a lie, but a truth wearing a different shape, a glimpse of something real, just far enough away to seem impossible.\n\nThat feeling needed a name of its own. It borrowed from mirer, an old word meaning to reflect, to admire, to catch the light and hold it, and wrapped it in -enne, so it would sound like it belonged to someone. Not an illusion anymore. A name. Hers, or yours.",
  madeInIndiaStatement:
    "Mirenne is a made-to-order womenswear label built for the moments that deserve to be remembered exactly as they happen: the wedding, the festival, the day you've circled on the calendar. Every piece is made-to-order and shaped by karigars whose handwork is meant to be looked at twice, once for the silhouette, once for the detail hiding underneath it.\n\nNothing here comes off a rack. Nothing is made for an \"average\" body. What you wear exists because you're going to wear it, cut, stitched, and finished with you in mind from the very first thread.\n\nBuilt slowly, from Indore, for every daydream that deserved to be worn, not just imagined.",
};
