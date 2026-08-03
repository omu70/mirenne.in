"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Returns true only after the component has mounted on the client.
 * Use this to gate any UI that reads from a persisted (localStorage-backed)
 * Zustand store — cart / wishlist counts, etc. — so the server-rendered
 * markup (which always sees an empty store) matches the first client
 * render exactly, avoiding hydration warnings, and the real count fades
 * in a beat later instead of causing a mismatch.
 *
 * Implemented with useSyncExternalStore (client snapshot true, server
 * snapshot false) rather than the classic `useEffect(() => setMounted(true))`
 * idiom, so there's no setState-in-effect involved at all.
 */
export function useMounted() {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
