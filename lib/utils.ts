import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number of paise-free rupees as an Indian currency string, e.g. 48000 -> "₹48,000" */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * True for image sources Next's optimizer cannot fetch — a data: URL from an
 * admin upload, or a blob: URL from a local preview. Those have to be passed
 * to <Image> with `unoptimized`, or the optimizer returns 400 and the image
 * renders as a blank box.
 */
export function isUnoptimizableSrc(src: string): boolean {
  return src.startsWith("data:") || src.startsWith("blob:");
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Renders a review's `daysAgo` as a relative label ("2 weeks ago"). Deliberately
 * a pure function of the number itself rather than `Date.now() - daysAgo` —
 * this is a statically generated page, and the dummy data already encodes
 * "how long ago" as a fixed relative value, so there's no wall-clock
 * dependency to introduce (and thus nothing that could ever mismatch between
 * server and client, or quietly go stale as time passes after the build).
 */
export function formatDaysAgo(daysAgo: number): string {
  if (daysAgo < 1) return "Today";
  if (daysAgo < 7) return `${daysAgo} day${daysAgo === 1 ? "" : "s"} ago`;
  if (daysAgo < 30) {
    const weeks = Math.round(daysAgo / 7);
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  }
  if (daysAgo < 365) {
    const months = Math.round(daysAgo / 30);
    return `${months} month${months === 1 ? "" : "s"} ago`;
  }
  const years = Math.round(daysAgo / 365);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}
