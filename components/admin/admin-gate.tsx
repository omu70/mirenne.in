"use client";

import * as React from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/brand/logo";
import { useAdminAuthStore } from "@/lib/store/admin-auth-store";
import { useMounted } from "@/lib/hooks/use-mounted";
import { AdminShell } from "@/components/admin/admin-shell";

/**
 * Gates everything under /admin behind a passcode screen. This is a
 * convenience gate, not real security — see the loud comment on
 * ADMIN_PASSCODE in lib/store/admin-auth-store.ts. Gated on useMounted so
 * the server-rendered pass (which never knows this browser's saved
 * unlock state) can't flash the passcode screen at an admin who's already
 * unlocked it here before.
 */
export function AdminGate({ children }: { children: React.ReactNode }) {
  const mounted = useMounted();
  const unlocked = useAdminAuthStore((s) => s.unlocked);
  const unlock = useAdminAuthStore((s) => s.unlock);
  const [passcode, setPasscode] = React.useState("");
  const [error, setError] = React.useState(false);

  if (!mounted) return null;

  if (!unlocked) {
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (unlock(passcode)) {
        setError(false);
        setPasscode("");
      } else {
        setError(true);
      }
    };

    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory px-6">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex flex-col items-center gap-6 text-center">
            <Logo variant="full" className="text-ink" />
            <div>
              <p className="label-luxury text-graphite">Admin</p>
              <p className="mt-2 text-sm leading-relaxed text-graphite">
                Enter the admin passcode to manage products, orders, customers, and site content.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <Label htmlFor="admin-passcode" className="mb-2 block">
                Passcode
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite" strokeWidth={1.25} />
                <Input
                  id="admin-passcode"
                  type="password"
                  autoFocus
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setError(false);
                  }}
                  className="pl-11"
                  placeholder="Enter passcode"
                />
              </div>
              {error && <p className="mt-2 text-xs text-gold-dark">That passcode isn&apos;t right. Try again.</p>}
            </div>
            <Button type="submit" variant="primary" size="lg">
              Enter Admin
            </Button>
          </form>

          <p className="mt-8 text-center text-xs leading-relaxed text-graphite">
            This is a local convenience gate for this browser only — not real authentication. Everything you manage
            here saves to this browser&apos;s local storage, not a server.
          </p>
        </div>
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
