export type CollectionSlug =
  | "evening-wear"
  | "resort"
  | "cocktail"
  | "wedding-guest"
  | "festive"
  | "vacation"
  | "signature";

export type Availability = "in-stock" | "made-to-order" | "low-stock";

export interface ColorOption {
  name: string;
  hex: string;
}

export interface ProductImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  /**
   * Optional on purpose. A piece can sit in the catalogue without belonging
   * to a collection — every consumer (cards, PDP breadcrumb, buy box,
   * related products, shop filters, search) treats an absent collection as
   * "unassigned" and simply omits the collection label rather than assuming
   * a lookup in collectionMap will resolve.
   */
  collection?: CollectionSlug;
  category: string;
  price: number;
  compareAtPrice?: number;
  shortDescription: string;
  description: string;
  /** Bulleted construction/spec points, shown as their own PDP accordion. */
  details?: string[];
  /** e.g. "2 (Blouse + Saree)" — what physically ships with the piece. */
  components?: string;
  designerNote: string;
  fabric: string;
  care: string;
  stylingSuggestion: string;
  colors: ColorOption[];
  sizes: string[];
  sizeGuideType: "standard" | "saree" | "free-size";
  availability: Availability;
  images: ProductImage[];
  isNew: boolean;
  isBestSeller: boolean;
  rating: number;
  reviewCount: number;
  deliveryEstimate: string;
  tags: string[];
}

export interface Collection {
  slug: CollectionSlug;
  name: string;
  tagline: string;
  description: string;
  bannerImage: ProductImage;
}

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  verified: boolean;
  daysAgo: number;
}

export interface Testimonial {
  customerName: string;
  location: string;
  quote: string;
  occasion: string;
}

export interface JournalPost {
  slug: string;
  title: string;
  category: "Style Guide" | "Behind the Scenes" | "Editorial" | "Fashion Story";
  excerpt: string;
  body: string[];
  readTime: string;
  coverImage: ProductImage;
  publishedAt: string;
}

export interface InstagramPost {
  image: ProductImage;
  likes: number;
  caption: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface TimelineEntry {
  year: string;
  label: string;
}

export interface FounderStory {
  founderName: string;
  title: string;
  heroQuote: string;
  storyParagraphs: string[];
  timeline: TimelineEntry[];
  craftsmanshipNote: string[];
}

export interface AboutCopy {
  heroHeadline: string;
  heroSubline: string;
  philosophyStatement: string;
  madeInIndiaStatement: string;
}
