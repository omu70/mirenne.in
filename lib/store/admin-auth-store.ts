"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * A LOCAL CONVENIENCE GATE, NOT REAL SECURITY. There is no server here to
 * check a password against — this only keeps the admin screens out of a
 * casual visitor's way. Anyone who opens this file (or the browser
 * devtools) can read or bypass the passcode. Don't rely on this to protect
 * anything sensitive; a real deployment would need a real backend and auth.
 */
export const ADMIN_PASSCODE = "mirenne-admin";

interface AdminAuthState {
  unlocked: boolean;
  unlock: (passcode: string) => boolean;
  lock: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      unlocked: false,
      unlock: (passcode) => {
        const ok = passcode.trim().toLowerCase() === ADMIN_PASSCODE.toLowerCase();
        if (ok) set({ unlocked: true });
        return ok;
      },
      lock: () => set({ unlocked: false }),
    }),
    { name: "mirenne-admin-auth" }
  )
);
