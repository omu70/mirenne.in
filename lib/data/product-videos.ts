/**
 * Product videos, keyed by product slug. This file — not the admin panel —
 * is what real visitors see: admin edits only save to the admin's own
 * browser. Paste a Cloudinary MP4 link per product, e.g.
 *   "black-fern": "https://res.cloudinary.com/<cloud>/video/upload/q_auto/black-fern.mp4",
 * A product with no entry simply shows photos only.
 */
export const productVideos: Record<string, string> = {};
