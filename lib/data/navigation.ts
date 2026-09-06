/**
 * Every link in the site's navigation, in one editable shape.
 *
 * These used to be module-level `const` arrays scattered across navbar.tsx,
 * mobile-menu.tsx and footer.tsx, which meant renaming a menu item or adding a
 * footer link was a code change and a deploy. They now seed the content store,
 * so /admin/menu can add, rename, reorder and remove any of them.
 *
 * There is no mega menu. The header is a flat row of links and nothing drops
 * down from it — the Shop panel that used to hang off "Shop" (collections,
 * categories, The Edit, a featured image) has been removed entirely.
 */

export interface NavLink {
  label: string;
  href: string;
}

export interface NavColumn {
  title: string;
  links: NavLink[];
}

export interface NavigationContent {
  /** Top-level header links, rendered left to right in this order. */
  headerLinks: NavLink[];
  /** Footer link columns. Add, remove and reorder them freely. */
  footerColumns: NavColumn[];
}

export const DEFAULT_NAVIGATION: NavigationContent = {
  headerLinks: [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "About", href: "/about" },
    { label: "Contact Us", href: "/contact" },
  ],

  footerColumns: [
    {
      title: "Shop",
      links: [
        { label: "Shop All", href: "/shop" },
        { label: "New Arrivals", href: "/shop?filter=new" },
      ],
    },
    {
      title: "Explore",
      links: [
        { label: "About Mirenne", href: "/about" },
        { label: "Contact Us", href: "/contact" },
      ],
    },
    {
      title: "Client Care",
      links: [
        { label: "Shipping & Returns", href: "/contact#faq" },
        { label: "Size Guide", href: "/contact#faq" },
        { label: "FAQs", href: "/contact#faq" },
      ],
    },
  ],
};

// ---- Text <-> data helpers, shared by the admin editor ----
// Link lists are edited as "Label | /href" per line, matching how the product
// form already handles colours and images. Deleting a line removes the link;
// adding one adds it; moving a line reorders it.

export function linksToText(links: NavLink[]): string {
  return links.map((l) => `${l.label} | ${l.href}`).join("\n");
}

export function textToLinks(text: string): NavLink[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, href] = line.split("|").map((s) => s.trim());
      return { label: label || "Untitled", href: href || "#" };
    });
}
