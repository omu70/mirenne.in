import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [65, 75, 90],
    // Hosts an admin may paste an image URL from in /admin/products. Deliberately
    // an allowlist rather than `hostname: "**"`: the optimizer fetches whatever
    // it is pointed at, so a wildcard would turn /_next/image into an open image
    // proxy for anyone who gets past the (openly documented) admin passcode.
    // Add a host here when you start serving photography from somewhere new —
    // an unlisted host renders as a blank box and logs a 400 from /_next/image.
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "ik.imagekit.io" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.mirenne.in" },
      { protocol: "https", hostname: "mirenne.in" },
    ],
  },
};

export default nextConfig;
