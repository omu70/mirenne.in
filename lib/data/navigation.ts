/**
 * Every link and heading in the site's navigation, in one editable shape.
 *
 * These used to be module-level `const` arrays scattered across navbar.tsx,
 * mega-menu.tsx, mobile-menu.tsx and footer.tsx, which meant renaming a menu
 * item or adding a footer link was a code change and a deploy. They now seed
 * the content store, so /admin/menu can edit the whole thing.
 */

export interface NavLink {
  label: string;
  href: string;
  /**
   * Marks the header item that opens the Shop mega menu instead of navigating.
   * At most one header link should carry it; the first one wins.
   */
  megaMenu?: boolean;
}

export interface NavColumn {
  title: string;
  links: NavLink[];
}

export interface NavigationContent {
  /** Top-level header links, rendered left to right in this order. */
  headerLinks: NavLink[];

  // Mega menu (desktop) / Shop accordion (mobile)
  collectionsTitle: string;
  categoriesTitle: string;
  /** A curated shortlist, not every category in the catalogue — the Shop
   *  page's own sidebar covers the full set. */
  categories: string[];
  editTitle: string;
  editLinks: NavLink[];
  helpTitle: string;
  helpLinks: NavLink[];

  /** Footer link columns. An empty title and no links hides a column. */
  footerColumns: NavColumn[];
}

export const DEFAULT_NAVIGATION: NavigationContent = {
  headerLinks: [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop", megaMenu: true },
    { label: "About", href: "/about" },
    { label: "Contact Us", href: "/contact" },
  ],

  collectionsTitle: "Shop By Collection",
  categoriesTitle: "Shop By Category",
  categories: [
    "Gown",
    "Draped Gown",
    "Anarkali",
    "Cocktail Dress",
    "Co-ord Set",
    "Saree",
    "Lehenga Set",
    "Kaftan",
  ],
  editTitle: "The Edit",
  editLinks: [
    { label: "New Arrivals", href: "/shop?filter=new" },
    { label: "Best Sellers", href: "/shop?filter=bestseller" },
    { label: "Made To Order", href: "/shop?availability=made-to-order" },
    { label: "Shop All", href: "/shop" },
  ],
  helpTitle: "Need Help Choosing?",
  helpLinks: [{ label: "Book a Styling Appointment", href: "/contact" }],

  footerColumns: [
    {
      title: "Shop",
      links: [
        { label: "Shop All", href: "/shop" },
        { label: "New Arrivals", href: "/shop?filter=new" },
        { label: "Best Sellers", href: "/shop?filter=bestseller" },
        { label: "All Collections", href: "/collections" },
      ],
    },
    {
      title: "Explore",
      links: [
        { label: "About Mirenne", href: "/about" },
        { label: "Contact Us", href: "/contact" },
        { label: "Wishlist", href: "/wishlist" },
      ],
    },
    {
      title: "Client Care",
      links: [
        { label: "Shipping & Returns", href: "/contact#faq" },
        { label: "Size Guide", href: "/contact#faq" },
        { label: "FAQs", href: "/contact#faq" },
        { label: "Book an Appointment", href: "/contact" },
      ],
    },
  ],
};

// ---- Text <-> data helpers, shared by the admin editor ----
// Link lists are edited as "Label | /href" per line, matching how the product
// form already handles colours and images.

export function linksToText(links: NavLink[]): string {
  return links.map((l) => `${l.label} | ${l.href}${l.megaMenu ? " | menu" : ""}`).join("\n");
}

export function textToLinks(text: string): NavLink[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, href, flag] = line.split("|").map((s) => s.trim());
      const link: NavLink = { label: label || "Untitled", href: href || "#" };
      if (flag?.toLowerCase() === "menu") link.megaMenu = true;
      return link;
    });
}

export function textToList(text: string): string[] {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}
