"use client";

import * as React from "react";
import { useRecentlyViewedStore } from "@/lib/store/recently-viewed-store";

interface RecentlyViewedTrackerProps {
  slug: string;
}

/**
 * Renders nothing — its only job is recording the current product into the
 * persisted "recently viewed" store. A plain useEffect is the right tool
 * here: it's synchronizing this page view with an external system
 * (localStorage, via the zustand persist middleware), not setting this
 * component's own local state, so it isn't the "derive during render
 * instead" case that the set-state-in-effect guidance warns against.
 * Placed on a server-rendered page component so each `/product/[slug]`
 * navigation mounts a fresh instance and records that exact slug.
 *
 * Stores the slug (not the internal id) because `productMap` — used to
 * resolve entries back into full `Product` objects for the rail — is keyed
 * by slug, and the slug is also the durable, URL-facing identity of the
 * product this store is meant to remember.
 */
export function RecentlyViewedTracker({ slug }: RecentlyViewedTrackerProps) {
  const record = useRecentlyViewedStore((s) => s.record);

  React.useEffect(() => {
    record(slug);
  }, [slug, record]);

  return null;
}
