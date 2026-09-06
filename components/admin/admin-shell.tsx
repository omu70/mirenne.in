"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Home,
  Layers,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { useAdminAuthStore } from "@/lib/store/admin-auth-store";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Homepage", href: "/admin/homepage", icon: Home },
  { label: "Collections", href: "/admin/collections", icon: Layers },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // The product store can't write to local storage once it's full (uploaded
  // photos are stored inline as data URLs). It reports that here rather than
  // failing silently, because the symptom otherwise is an admin's whole
  // session of edits disappearing on the next reload with no explanation.
  React.useEffect(() => {
    const onFull = () =>
      toast.error("Browser storage is full — this change wasn't saved.", {
        description: "Remove some uploaded photos, or point products at image paths or URLs instead.",
        duration: 10000,
      });
    window.addEventListener("mirenne:storage-full", onFull);
    return () => window.removeEventListener("mirenne:storage-full", onFull);
  }, []);
  const lock = useAdminAuthStore((s) => s.lock);

  return (
    <div className="flex min-h-screen bg-ivory">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-hairline bg-paper lg:flex">
        <div className="px-7 py-8">
          <Link href="/admin">
            <Logo variant="horizontal" className="text-ink" markClassName="h-7" wordmarkClassName="text-base" />
          </Link>
          <p className="label-luxury mt-1 text-graphite/70">Admin</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-4">
          {NAV_ITEMS.map((item) => {
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
                  active ? "bg-ink text-ivory" : "text-ink/80 hover:bg-ivory"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col gap-1 border-t border-hairline px-4 py-5">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-ink/80 transition-colors hover:bg-ivory"
          >
            <ExternalLink className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            View Site
          </Link>
          <button
            onClick={lock}
            className="flex cursor-pointer items-center gap-3 px-3 py-2.5 text-left text-sm text-ink/80 transition-colors hover:bg-ivory"
          >
            <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            Lock Admin
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen w-full flex-1 flex-col lg:pl-64">
        <header className="flex items-center justify-between border-b border-hairline bg-ivory px-6 py-4 lg:hidden">
          <Logo variant="horizontal" className="text-ink" markClassName="h-6" wordmarkClassName="text-sm" />
          <button onClick={lock} className="label-luxury cursor-pointer text-graphite">
            Lock
          </button>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-hairline bg-paper px-4 py-2 lg:hidden">
          {NAV_ITEMS.map((item) => {
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "shrink-0 whitespace-nowrap px-3 py-1.5 text-xs transition-colors",
                  active ? "bg-ink text-ivory" : "text-ink/70"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 px-6 py-8 md:px-10 md:py-10">{children}</main>
      </div>

      <Toaster />
    </div>
  );
}
