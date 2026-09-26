/**
 * Product videos, keyed by product slug. This file — not the admin panel —
 * is what real visitors see: admin edits only save to the admin's own
 * browser. Files live in public/videos/ (720p H.264, no audio, ~1–6 MB each).
 * A product with no entry simply shows photos only.
 */
export const productVideos: Record<string, string> = {
  "black-fern": "/videos/black-fern.mp4",
  "butterfly-whisper": "/videos/butterfly-whisper.mp4",
  "champagne-shimmer": "/videos/champagne-shimmer.mp4",
  cygnet: "/videos/cygnet.mp4",
  "ivory-grace": "/videos/ivory-grace.mp4",
  "pearl-trail": "/videos/pearl-trail.mp4",
};
