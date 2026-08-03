import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // All imagery is generated locally under /public for now (see
    // scripts/generate-art.py). Add remotePatterns here if real campaign
    // photography is later hosted externally.
    qualities: [65, 75, 90],
  },
};

export default nextConfig;
