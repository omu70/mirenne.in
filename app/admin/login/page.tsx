"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/brand/logo";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (res?.ok) {
      const next = params.get("next");
      router.replace(next && next.startsWith("/admin") ? next : "/admin");
      router.refresh();
    } else {
      setError(data.message ?? "Couldn't sign in. Check your connection.");
    }
  };

  return (
    <form onSubmit={submit} className="w-full max-w-sm border border-hairline bg-paper p-8">
      <Logo variant="horizontal" className="text-ink" markClassName="h-7" wordmarkClassName="text-base" />
      <p className="label-luxury mt-6 flex items-center gap-2 text-graphite">
        <Lock className="h-3.5 w-3.5" strokeWidth={1.5} /> Admin Sign In
      </p>
      <Label htmlFor="admin-password" className="mb-2 mt-6 block">
        Password
      </Label>
      <Input
        id="admin-password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoFocus
      />
      {error && <p className="mt-3 text-xs text-gold-dark">{error}</p>}
      <Button type="submit" variant="primary" size="md" className="mt-6 w-full" disabled={busy || !password}>
        {busy ? "Signing in…" : "Sign In"}
      </Button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-6">
      <React.Suspense fallback={null}>
        <LoginForm />
      </React.Suspense>
    </div>
  );
}
