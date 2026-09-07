/**
 * One place that knows how to report a commerce event, so the rest of the app
 * calls `track.addToCart(...)` and never touches gtag or fbq directly.
 *
 * The site shipped with no analytics at all — no GA4, no Meta Pixel, no events
 * anywhere. That makes conversion-rate work guesswork: you cannot tell an ad
 * that produced a sale from one that produced a bounce, and Meta has no
 * conversion signal to optimise delivery against.
 *
 * Nothing here loads or fires unless the matching env var is set, so a
 * deployment without IDs behaves exactly as before rather than throwing.
 *
 * What this deliberately is NOT: server-side tracking. Browser pixels are
 * blocked often enough (ad blockers, iOS, ITP) that reported conversions run
 * meaningfully below real ones. Meta's Conversions API sending Purchase from
 * the server — where the payment is already being verified — is the fix, and
 * it needs a real order store behind it first.
 */

type Params = Record<string, unknown>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";
export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID ?? "";
export const analyticsEnabled = Boolean(GA_ID || FB_PIXEL_ID);

const CURRENCY = "INR";

function ga(event: string, params: Params = {}) {
  if (!GA_ID || typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", event, params);
}

function fb(event: string, params: Params = {}) {
  if (!FB_PIXEL_ID || typeof window === "undefined" || !window.fbq) return;
  window.fbq("track", event, params);
}

interface LineItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
}

const gaItems = (items: LineItem[]) =>
  items.map((i) => ({
    item_id: i.slug,
    item_name: i.name,
    item_category: i.category,
    price: i.price,
    quantity: i.quantity,
  }));

const value = (items: LineItem[]) => items.reduce((n, i) => n + i.price * i.quantity, 0);

export const track = {
  pageView(url: string) {
    if (GA_ID && typeof window !== "undefined" && window.gtag) {
      window.gtag("config", GA_ID, { page_path: url });
    }
    fb("PageView");
  },

  viewItem(item: LineItem) {
    ga("view_item", { currency: CURRENCY, value: item.price, items: gaItems([item]) });
    fb("ViewContent", {
      content_ids: [item.slug],
      content_name: item.name,
      content_type: "product",
      value: item.price,
      currency: CURRENCY,
    });
  },

  addToCart(item: LineItem) {
    const v = item.price * item.quantity;
    ga("add_to_cart", { currency: CURRENCY, value: v, items: gaItems([item]) });
    fb("AddToCart", {
      content_ids: [item.slug],
      content_name: item.name,
      content_type: "product",
      value: v,
      currency: CURRENCY,
    });
  },

  addToWishlist(item: LineItem) {
    ga("add_to_wishlist", { currency: CURRENCY, value: item.price, items: gaItems([item]) });
    fb("AddToWishlist", { content_ids: [item.slug], content_name: item.name, value: item.price, currency: CURRENCY });
  },

  beginCheckout(items: LineItem[], total: number) {
    ga("begin_checkout", { currency: CURRENCY, value: total, items: gaItems(items) });
    fb("InitiateCheckout", {
      content_ids: items.map((i) => i.slug),
      content_type: "product",
      num_items: items.reduce((n, i) => n + i.quantity, 0),
      value: total,
      currency: CURRENCY,
    });
  },

  purchase(orderId: string, items: LineItem[], total: number, shipping: number) {
    ga("purchase", {
      transaction_id: orderId,
      currency: CURRENCY,
      value: total,
      shipping,
      items: gaItems(items),
    });
    fb("Purchase", {
      content_ids: items.map((i) => i.slug),
      content_type: "product",
      num_items: items.reduce((n, i) => n + i.quantity, 0),
      value: total,
      currency: CURRENCY,
    });
  },

  search(term: string) {
    ga("search", { search_term: term });
    fb("Search", { search_string: term });
  },
};

export type { LineItem };
export { value as itemsValue };
